"use client";

import { ArrowRight } from "lucide-react";
import type { TimerPhase, TimerStatus } from "@/core/hooks/pomodoro/usePomodoroTimer";

// pomofocus.io-style action button: white, bold uppercase label in the drink
// color, resting on a hard 6px bottom shadow. Pressed = sunk 6px, no shadow.
const BASE =
  "h-14 min-w-44 px-8 rounded-md bg-white text-xl font-bold uppercase tracking-wider transition-all duration-150 select-none";
const RAISED =
  "shadow-[0_6px_0_rgba(0,0,0,0.35)] active:shadow-none active:translate-y-1.5";
const PRESSED = "shadow-none translate-y-1.5";

function ActionButton({
  pressed = false,
  onClick,
  children,
}: {
  pressed?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`${BASE} ${pressed ? PRESSED : RAISED}`}
      style={{ color: "var(--drink)" }}
    >
      {children}
    </button>
  );
}

interface TimerControlsProps {
  status: TimerStatus;
  phase: TimerPhase;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStartBreak: () => void;
  onSkipBreak: () => void;
}

export default function TimerControls({
  status, phase,
  onStart, onPause, onResume, onReset, onStartBreak, onSkipBreak,
}: TimerControlsProps) {
  const isBreak = phase !== "focus";

  // Finished focus → offer break or next focus; finished break → back to focus
  if (status === "finished") {
    return (
      <div className="flex items-center gap-3">
        {isBreak ? (
          <ActionButton onClick={onSkipBreak}>Focus</ActionButton>
        ) : (
          <>
            <ActionButton onClick={onStartBreak}>Break</ActionButton>
            <button
              onClick={onReset}
              className="h-14 px-4 text-text-muted hover:text-text-primary font-semibold transition-colors"
              aria-label="Skip break"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {status === "idle" && <ActionButton onClick={onStart}>Start</ActionButton>}
      {status === "running" && (
        <ActionButton pressed onClick={onPause}>
          Pause
        </ActionButton>
      )}
      {status === "paused" && (
        <ActionButton onClick={onResume}>Resume</ActionButton>
      )}
    </div>
  );
}
