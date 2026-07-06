"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/core/redux/store";
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
  addProgress,
  getProgress,
  type Progress,
} from "@/core/lib/pomodoro/coffeeFocusStore";
import {
  CYCLE_BONUS_XP,
  type DrinkAccent,
  drinksUnlockedBetween,
  getDrinkDef,
  levelFromXp,
  xpForLevel,
} from "@/core/lib/pomodoro/progression";
import { toast } from "@/core/hooks/use-toast";
import { useWakeLock } from "@/core/hooks/useWakeLock";
import {
  playClick,
  preloadSounds,
  requestNotifyPermission,
  useCompletionSignal,
} from "./useCompletionSignal";
import {
  useFocusProgress,
  useFlushSession,
  useSyncConfig,
  useDrainPendingFlush,
} from "@/core/services/client/useFocusSync";

export type TimerPhase = "focus" | "shortBreak" | "longBreak";
export type TimerStatus = "idle" | "running" | "paused" | "finished";

/** Per-phase identity — label, tab emoji, accent token. Single source of truth
 *  for the switcher pill, cup colors, tab title and favicon. */
export const PHASE_META: Record<
  TimerPhase,
  { label: string; emoji: string; accent: "coffee" | "tea" }
> = {
  focus: { label: "Focus", emoji: "☕", accent: "coffee" },
  shortBreak: { label: "Short break", emoji: "🍵", accent: "tea" },
  longBreak: { label: "Long break", emoji: "🌿", accent: "tea" },
};

/**
 * Resolve the current phase to a generic drink palette, exposed as CSS custom
 * properties. Drink visuals (and any phase-tinted UI) must only ever use
 * `var(--drink)`, `var(--drink-deep)`, `var(--drink-foam)` — never phase logic
 * or hardcoded colors. Swapping designs/palettes then never touches components.
 */
export function drinkPaletteStyle(
  phase: TimerPhase,
  focusAccent: DrinkAccent = "coffee"
): CSSProperties {
  // Focus shows the selected drink's palette; breaks are always calm tea green
  const accent = phase === "focus" ? focusAccent : "tea";
  return {
    "--drink": `var(--color-${accent})`,
    "--drink-deep": `var(--color-${accent}-deep)`,
    "--drink-foam": `var(--color-${accent}-foam)`,
  } as CSSProperties;
}

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

function emojiFavicon(emoji: string): string {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${emoji}</text></svg>`
  )}`;
}

/** Swap the favicon to the given emoji while mounted; restore on unmount.
 *
 *  React 19 / Next 15 MANAGE head <link> tags — a one-shot mutation gets
 *  overwritten when React re-renders the head. So: apply, then keep a
 *  MutationObserver on <head> that re-applies whenever React re-asserts
 *  the original icon. The `href !== ours` guard prevents observer loops. */
function usePhaseFavicon(emoji: string) {
  useEffect(() => {
    const href = emojiFavicon(emoji);

    const apply = () => {
      const links = document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"], link[rel="shortcut icon"]'
      );
      if (links.length === 0) {
        const el = document.createElement("link");
        el.rel = "icon";
        el.type = "image/svg+xml";
        el.href = href;
        el.dataset.pomodoroFavicon = "true";
        document.head.appendChild(el);
        return;
      }
      for (const el of links) {
        if (el.href !== href) {
          el.type = "image/svg+xml";
          el.href = href;
        }
      }
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href"],
    });

    return () => {
      observer.disconnect();
      document
        .querySelectorAll<HTMLLinkElement>("link[data-pomodoro-favicon]")
        .forEach((el) => el.remove());
      for (const el of document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"], link[rel="shortcut icon"]'
      )) {
        el.removeAttribute("type");
        el.href = "/favicon.ico";
      }
    };
  }, [emoji]);
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
  const [progress, setProgress] = useState<Progress>({ totalXp: 0, totalFocusMin: 0 });
  const [lastLevelUp, setLastLevelUp] = useState<number | null>(null);

  const endAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Refs mirror state the interval callback needs — avoids stale closures.
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const totalMsRef = useRef(totalMs);
  totalMsRef.current = totalMs;
  const configRef = useRef(config);
  configRef.current = config;

  // ---------- API sync (logged-in only) ----------
  const { isAuth } = useSelector((state: RootState) => state.user);
  const isAuthRef = useRef(isAuth);
  isAuthRef.current = isAuth;

  const { data: serverProgress } = useFocusProgress();
  const flushSession = useFlushSession();
  const syncConfig = useSyncConfig();
  useDrainPendingFlush();

  // Stable refs so callbacks don't need these in their dep arrays.
  const flushRef = useRef(flushSession.mutate);
  flushRef.current = flushSession.mutate;
  const syncConfigRef = useRef(syncConfig.mutate);
  syncConfigRef.current = syncConfig.mutate;

  // UUID generated at session start, reused on retry (idempotency §4).
  const sessionIdRef = useRef<string | null>(null);

  /** XP: 1/min of the completed session + cycle bonus on the Nth of the day.
   *  Level derived from XP; crossing a threshold fires the toast + badge glow. */
  const awardFocusXp = useCallback(
    (sessionMs: number, completedToday: number, sessionsPerCycle: number) => {
      const minutes = Math.max(1, Math.round(sessionMs / 60_000));
      const bonus = completedToday % sessionsPerCycle === 0 ? CYCLE_BONUS_XP : 0;
      const beforeLevel = levelFromXp(getProgress().totalXp);
      const next = addProgress(minutes + bonus, minutes);
      setProgress(next);

      const afterLevel = levelFromXp(next.totalXp);
      if (afterLevel > beforeLevel) {
        const unlocked = drinksUnlockedBetween(beforeLevel, afterLevel);
        toast({
          title: `Level ${afterLevel}! 🎉`,
          description: unlocked.length
            ? `New drink unlocked: ${unlocked.map((d) => d.name).join(", ")}`
            : `${xpForLevel(afterLevel + 1) - next.totalXp} XP to the next level`,
        });
        setLastLevelUp(afterLevel);
        if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
        levelUpTimerRef.current = setTimeout(() => setLastLevelUp(null), 4000);
      }
    },
    []
  );

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
      const completed = recordCompletedFocus();
      setTodayCount(completed);
      awardFocusXp(totalMsRef.current, completed, configRef.current.sessionsPerCycle);

      if (isAuthRef.current) {
        flushRef.current({
          clientSessionId: sessionIdRef.current ?? crypto.randomUUID(),
          durationMin: Math.max(1, Math.round(totalMsRef.current / 60_000)),
          tzOffset: -new Date().getTimezoneOffset(),
        });
      }
      sessionIdRef.current = null;
    }
    setStatus("finished");
  }, [clearTick, awardFocusXp]);

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
      requestNotifyPermission(); // user gesture — the only acceptable moment to ask
      if (cfg.soundOn) playClick();
      const total = durationMs(cfg, next);
      endAtRef.current = Date.now() + total;
      // Generate UUID once per session start — reused on any retry (§4 idempotency).
      const clientSessionId = next === "focus" ? crypto.randomUUID() : undefined;
      if (clientSessionId) sessionIdRef.current = clientSessionId;
      setPhase(next);
      setTotalMs(total);
      setRemainingMs(total);
      setStatus("running");
      saveActiveSession({
        phase: next,
        endAt: endAtRef.current,
        pausedRemainingMs: null,
        totalMs: total,
        clientSessionId,
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
    if (configRef.current.soundOn) playClick();
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
    if (configRef.current.soundOn) playClick();
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

  /** Reset the CURRENT phase's timer — stays in the same mode. */
  const reset = useCallback(() => switchPhase(phase), [switchPhase, phase]);
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
      if (isAuthRef.current && partial.drinkId) {
        syncConfigRef.current({
          drinkId: merged.drinkId,
          tzOffset: -new Date().getTimezoneOffset(),
        });
      }
    },
    [status, phase]
  );

  // Mount: load config + today's count + progress, restore interrupted session.
  useEffect(() => {
    const cfg = getConfig();
    setConfigState(cfg);
    setTodayCount(getTodayCompleted());
    setProgress(getProgress());
    if (cfg.soundOn) preloadSounds();

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
      // Restore the session UUID so a resumed → completed session still flushes correctly.
      if (active.clientSessionId) sessionIdRef.current = active.clientSessionId;
      setRemainingMs(active.pausedRemainingMs);
      setStatus("paused");
    } else if (active.endAt > Date.now()) {
      if (active.clientSessionId) sessionIdRef.current = active.clientSessionId;
      endAtRef.current = active.endAt;
      setRemainingMs(active.endAt - Date.now());
      setStatus("running");
      startTick();
    } else {
      // Finished while the page was closed — still counts (XP included).
      clearActiveSession();
      if (active.phase === "focus") {
        const completed = recordCompletedFocus();
        setTodayCount(completed);
        awardFocusXp(active.totalMs, completed, cfg.sessionsPerCycle);
        if (isAuthRef.current) {
          flushRef.current({
            clientSessionId: active.clientSessionId ?? crypto.randomUUID(),
            durationMin: Math.max(1, Math.round(active.totalMs / 60_000)),
            tzOffset: -new Date().getTimezoneOffset(),
          });
        }
      }
      setRemainingMs(0);
      setStatus("finished");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Server hydration — overwrite local XP / todayCount with authoritative server
  // values. Runs once when GET /progress resolves; guests never reach this.
  useEffect(() => {
    if (!serverProgress) return;
    setProgress({ totalXp: serverProgress.totalXp, totalFocusMin: serverProgress.totalFocusMin });
    setTodayCount(serverProgress.todayCount);
  }, [serverProgress]);

  // Tab title: live countdown + phase emoji/label while running, "done" marker
  // when finished, base title otherwise. TitleManager owns the title on other
  // routes; this effect owns it while the page is mounted, restored on unmount.
  // Focus shows the selected drink's emoji; breaks keep their phase emoji
  const activeEmoji =
    phase === "focus" ? getDrinkDef(config.drinkId).emoji : PHASE_META[phase].emoji;

  useEffect(() => {
    const { label } = PHASE_META[phase];
    if (status === "running") {
      document.title = `${formatRemaining(remainingMs)} ${activeEmoji} ${label} | KPro`;
    } else if (status === "finished") {
      document.title = `Done! ${activeEmoji} | KPro`;
    } else if (status === "paused") {
      document.title = `⏸ ${formatRemaining(remainingMs)} ${activeEmoji} ${label} | KPro`;
    } else {
      // idle — still show which mode is selected
      document.title = `${activeEmoji} ${label} | KPro`;
    }
  }, [status, remainingMs, phase, activeEmoji]);

  usePhaseFavicon(activeEmoji);
  useCompletionSignal(status, phase, config.soundOn);
  // Keep the phone screen awake while a session is counting down
  useWakeLock(status === "running");

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

  // Auto-switch MODE after completion (2s pause so the "Done!" moment + signals
  // register): focus → the appropriate break tab, break → focus tab. The timer
  // itself never auto-starts — beginning any countdown is a deliberate click.
  useEffect(() => {
    if (status !== "finished") return;
    const t = setTimeout(() => {
      switchPhase(phaseRef.current === "focus" ? nextBreakKind : "focus");
    }, 2000);
    return () => clearTimeout(t);
  }, [status, nextBreakKind, switchPhase]);

  return {
    phase,
    status,
    remainingMs,
    totalMs,
    progress: totalMs > 0 ? remainingMs / totalMs : 0,
    config,
    todayCount,
    nextBreakKind,
    xp: progress,
    level: levelFromXp(progress.totalXp),
    lastLevelUp,
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
