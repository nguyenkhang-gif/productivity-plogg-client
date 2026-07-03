"use client";

import type { TimerPhase, TimerStatus } from "@/core/hooks/pomodoro/usePomodoroTimer";

const PHASES: { id: TimerPhase; label: string }[] = [
  { id: "focus", label: "Pomodoro" },
  { id: "shortBreak", label: "Short break" },
  { id: "longBreak", label: "Long break" },
];

interface PhaseSwitcherProps {
  phase: TimerPhase;
  status: TimerStatus;
  onSwitch: (phase: TimerPhase) => void;
}

export default function PhaseSwitcher({ phase, status, onSwitch }: PhaseSwitcherProps) {
  const handleSwitch = (next: TimerPhase) => {
    if (next === phase) return;
    // Switching abandons the running session — ask before throwing it away
    if (status === "running" || status === "paused") {
      if (!window.confirm("The current timer will be reset. Switch anyway?")) return;
    }
    onSwitch(next);
  };

  return (
    <div className="flex items-center gap-1 bg-surface-raised rounded-full p-1">
      {PHASES.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => handleSwitch(id)}
          className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-colors ${
            phase === id
              ? "bg-coffee text-white"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
