"use client";

import { useEffect, useRef } from "react";
import type { TimerPhase, TimerStatus } from "./usePomodoroTimer";

/** Ask once, from a user gesture (first Start click) — never on page load. */
export function requestNotifyPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}

/** Soft two-tone ding synthesized with Web Audio — no sound file to ship.
 *  Swap for an <audio> element later if a custom chime (gurgle?) is wanted. */
function playChime() {
  try {
    const ctx = new AudioContext();
    const ding = (freq: number, at: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + at;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.9);
    };
    ding(880, 0); // A5
    ding(1174.66, 0.18); // D6
    setTimeout(() => ctx.close().catch(() => {}), 1500);
  } catch {
    // audio blocked or unsupported — the visual signals still fire
  }
}

/**
 * Fires when a running session completes:
 * - chime (if soundOn)
 * - background tab + permission granted → Web Notification
 * - background tab + no permission → title flash until the tab is refocused
 */
export function useCompletionSignal(
  status: TimerStatus,
  phase: TimerPhase,
  soundOn: boolean
) {
  const prevStatusRef = useRef(status);

  useEffect(() => {
    const cameFromRunning = prevStatusRef.current === "running";
    prevStatusRef.current = status;
    if (status !== "finished" || !cameFromRunning) return;

    if (soundOn) playChime();

    if (!document.hidden) return; // user is watching — the UI itself is the signal

    const body =
      phase === "focus"
        ? "Session complete — take a break! ☕"
        : "Break's over — back to focus 🌿";

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Coffee Focus", { body });
      } catch {
        // some browsers throw for page-scoped notifications — fall through
      }
      return;
    }

    // Fallback: flash the tab title until the user comes back
    let on = false;
    const flash = setInterval(() => {
      document.title = on ? "☕ Done!" : "⏰ Done!";
      on = !on;
    }, 1000);
    const stop = () => {
      clearInterval(flash);
      document.title = "Done! ☕ | KPro";
      document.removeEventListener("visibilitychange", stop);
    };
    document.addEventListener("visibilitychange", stop);
    return stop;
  }, [status, phase, soundOn]);
}
