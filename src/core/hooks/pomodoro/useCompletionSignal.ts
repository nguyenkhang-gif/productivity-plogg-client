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

const BELL_SRC = "/sounds/bell.mp3";
const CLICK_SRC = "/sounds/buttonPress.mp3";

// One Audio element per file, created lazily and reused across plays. This
// module is only bundled with the pomodoro route (Next.js code-splitting),
// so other pages never load these assets.
const audioCache: Record<string, HTMLAudioElement> = {};

function getAudio(src: string): HTMLAudioElement {
  if (!audioCache[src]) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audioCache[src] = audio;
  }
  return audioCache[src];
}

/** Warm the audio cache when the pomodoro page mounts, so the first
 *  bell/click plays without a network round-trip. */
export function preloadSounds() {
  if (typeof window === "undefined") return;
  getAudio(BELL_SRC);
  getAudio(CLICK_SRC);
}

/** Play an audio asset; fall back to the synthesized sound if it fails
 *  (missing file, unsupported codec, autoplay policy). */
function playFile(src: string, volume: number, fallback: () => void) {
  try {
    const audio = getAudio(src);
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(fallback);
  } catch {
    fallback();
  }
}

function playChime() {
  playFile(BELL_SRC, 0.7, synthChime);
}

/** Soft two-tone ding synthesized with Web Audio — fallback when the
 *  bell.mp3 asset can't play. */
function synthChime() {
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

export function playClick() {
  playFile(CLICK_SRC, 0.5, synthClick);
}

/** Short, quiet UI click (~30ms) — fallback when buttonPress.mp3 can't play. */
function synthClick() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
    setTimeout(() => ctx.close().catch(() => {}), 200);
  } catch {
    // audio blocked — silent click is fine
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
