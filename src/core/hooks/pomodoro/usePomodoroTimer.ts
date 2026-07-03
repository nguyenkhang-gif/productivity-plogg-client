"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_CONFIG,
  PomodoroConfig,
  clearActiveSession,
  getActiveSession,
  getConfig,
  getTodayCompleted,
  recordCompletedFocus,
  saveActiveSession,
  saveConfig,
} from "@/core/lib/pomodoro/coffeeFocusStore";

export type TimerPhase = "focus" | "shortBreak" | "longBreak";
export type TimerStatus = "idle" | "running" | "paused" | "finished";

const BASE_TITLE = "Coffee Focus | KPro";
// Render trigger only — remaining time is always wall-clock math off endAt,
// so background-tab interval throttling can't drift the timer.
const TICK_MS = 500;

function durationMs(config: PomodoroConfig, phase: TimerPhase): number {
  switch (phase) {
    case "focus":
      return config.focusMin * 60_000;
    case "shortBreak":
      return config.shortBreakMin * 60_000;
    case "longBreak":
      return config.longBreakMin * 60_000;
  }
}

export function formatRemaining(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function usePomodoroTimer() {
  // Defaults on first render (also what the server prerenders); real config and
  // any interrupted session are restored client-side in the mount effect below.
  const [config, setConfigState] = useState<PomodoroConfig>(DEFAULT_CONFIG);
  const [phase, setPhase] = useState<TimerPhase>("focus");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [totalMs, setTotalMs] = useState(durationMs(DEFAULT_CONFIG, "focus"));
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const [todayCount, setTodayCount] = useState(0);

  const endAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Refs mirror state the interval callback needs — avoids stale closures.
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const completeSession = useCallback(() => {
    clearTick();
    endAtRef.current = null;
    clearActiveSession();
    if (phaseRef.current === "focus") {
      setTodayCount(recordCompletedFocus());
    }
    setStatus("finished");
  }, [clearTick]);

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      if (endAtRef.current === null) return;
      const remaining = Math.max(0, endAtRef.current - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0) completeSession();
    }, TICK_MS);
  }, [clearTick, completeSession]);

  /** Begin a fresh session in the given phase (defaults to the current one). */
  const beginPhase = useCallback(
    (next: TimerPhase, cfg: PomodoroConfig) => {
      const total = durationMs(cfg, next);
      endAtRef.current = Date.now() + total;
      setPhase(next);
      setTotalMs(total);
      setRemainingMs(total);
      setStatus("running");
      saveActiveSession({
        phase: next,
        endAt: endAtRef.current,
        pausedRemainingMs: null,
        totalMs: total,
      });
      startTick();
    },
    [startTick]
  );

  const start = useCallback(() => beginPhase(phase, config), [beginPhase, phase, config]);

  const startBreak = useCallback(
    (kind: "shortBreak" | "longBreak" = "shortBreak") => beginPhase(kind, config),
    [beginPhase, config]
  );

  const pause = useCallback(() => {
    if (endAtRef.current === null) return;
    const remaining = Math.max(0, endAtRef.current - Date.now());
    setRemainingMs(remaining);
    endAtRef.current = null;
    clearTick();
    setStatus("paused");
    saveActiveSession({
      phase: phaseRef.current,
      endAt: 0,
      pausedRemainingMs: remaining,
      totalMs,
    });
  }, [clearTick, totalMs]);

  const resume = useCallback(() => {
    endAtRef.current = Date.now() + remainingMs;
    setStatus("running");
    saveActiveSession({
      phase: phaseRef.current,
      endAt: endAtRef.current,
      pausedRemainingMs: null,
      totalMs,
    });
    startTick();
  }, [remainingMs, totalMs, startTick]);

  /** Manually jump to any phase (mode tabs). Stops the clock, fresh idle timer. */
  const switchPhase = useCallback(
    (next: TimerPhase) => {
      clearTick();
      endAtRef.current = null;
      clearActiveSession();
      setPhase(next);
      setStatus("idle");
      const total = durationMs(config, next);
      setTotalMs(total);
      setRemainingMs(total);
    },
    [clearTick, config]
  );

  const reset = useCallback(() => switchPhase("focus"), [switchPhase]);
  const skipBreak = useCallback(() => switchPhase("focus"), [switchPhase]);

  /** Persist config changes. A running/paused session keeps its original timing —
   *  new durations apply from the next session. */
  const updateConfig = useCallback(
    (partial: Partial<PomodoroConfig>) => {
      const merged = saveConfig(partial);
      setConfigState(merged);
      if (status === "idle") {
        const total = durationMs(merged, phase);
        setTotalMs(total);
        setRemainingMs(total);
      }
    },
    [status, phase]
  );

  // Mount: load config + today's count, then restore an interrupted session.
  useEffect(() => {
    const cfg = getConfig();
    setConfigState(cfg);
    setTodayCount(getTodayCompleted());

    const active = getActiveSession();
    if (!active) {
      const total = durationMs(cfg, "focus");
      setTotalMs(total);
      setRemainingMs(total);
      return;
    }

    setPhase(active.phase);
    setTotalMs(active.totalMs);

    if (active.pausedRemainingMs !== null) {
      setRemainingMs(active.pausedRemainingMs);
      setStatus("paused");
    } else if (active.endAt > Date.now()) {
      endAtRef.current = active.endAt;
      setRemainingMs(active.endAt - Date.now());
      setStatus("running");
      startTick();
    } else {
      // Finished while the page was closed — still counts.
      clearActiveSession();
      if (active.phase === "focus") {
        setTodayCount(recordCompletedFocus());
      }
      setRemainingMs(0);
      setStatus("finished");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tab title: live countdown while running, "done" marker when finished,
  // base title otherwise. TitleManager owns the title on other routes; this
  // effect owns it while the page is mounted and restores it on unmount.
  useEffect(() => {
    if (status === "running") {
      document.title = `${formatRemaining(remainingMs)} ☕ | KPro`;
    } else if (status === "finished") {
      document.title = `Done! ☕ | KPro`;
    } else {
      document.title = BASE_TITLE;
    }
  }, [status, remainingMs]);

  useEffect(() => {
    return () => {
      clearTick();
      document.title = BASE_TITLE;
    };
  }, [clearTick]);

  // Long break every Nth completed focus (cycle resets with the daily count)
  const nextBreakKind: "shortBreak" | "longBreak" =
    todayCount > 0 && todayCount % config.sessionsPerCycle === 0
      ? "longBreak"
      : "shortBreak";

  return {
    phase,
    status,
    remainingMs,
    totalMs,
    progress: totalMs > 0 ? remainingMs / totalMs : 0,
    config,
    todayCount,
    nextBreakKind,
    start,
    pause,
    resume,
    reset,
    startBreak,
    skipBreak,
    switchPhase,
    updateConfig,
  };
}
