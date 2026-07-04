"use client";

import { motion } from "framer-motion";
import type {
  TimerPhase,
  TimerStatus,
} from "@/core/hooks/pomodoro/usePomodoroTimer";

const PHASES: TimerPhase[] = ["focus", "shortBreak", "longBreak"];

// "Pomodoro" reads better than "Focus" as a tab name
const TAB_LABEL: Record<TimerPhase, string> = {
  focus: "Pomodoro",
  shortBreak: "Short break",
  longBreak: "Long break",
};

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
      {PHASES.map((id) => {
        const active = phase === id;
        return (
          <button
            key={id}
            onClick={() => handleSwitch(id)}
            className={`relative px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
              active ? "text-white" : "text-text-muted hover:text-text-primary"
            }`}
          >
            {active && (
              <motion.span
                layoutId="phase-pill"
                className="absolute inset-0 rounded-full transition-colors duration-500"
                style={{ backgroundColor: "var(--drink)" }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{TAB_LABEL[id]}</span>
          </button>
        );
      })}
    </div>
  );
}
