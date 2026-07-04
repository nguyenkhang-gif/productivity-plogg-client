"use client";

import { useEffect } from "react";
import { PanelTopClose, PanelTopOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CoffeeCup from "@/components/pomodoro/CoffeeCup";
import PhaseSwitcher from "@/components/pomodoro/PhaseSwitcher";
import SettingsPanel from "@/components/pomodoro/SettingsPanel";
import TimerControls from "@/components/pomodoro/TimerControls";
import NotesSection from "@/components/pomodoro/NotesSection";
import { useNavVisibility } from "@/components/layouts/NavVisibilityContext";
import {
  usePomodoroTimer,
  formatRemaining,
  PHASE_META,
  drinkPaletteStyle,
} from "@/core/hooks/pomodoro/usePomodoroTimer";

export default function FocusCoffePage() {
  const {
    phase, status, remainingMs, progress, config, todayCount, nextBreakKind,
    start, pause, resume, reset, startBreak, skipBreak, switchPhase, updateConfig,
  } = usePomodoroTimer();
  const { navHidden, toggleNav, setNavHidden } = useNavVisibility();

  // Mobile landscape (short viewport) → hide the nav by default; rotating back
  // to portrait restores it. Manual toggle still works until the next rotation.
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape) and (max-height: 500px)");
    const apply = () => setNavHidden(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [setNavHidden]);

  return (
    <div
      className="relative min-h-[calc(100vh-3.5rem)] bg-page flex items-center justify-center px-4 py-6 md:py-10"
      style={drinkPaletteStyle(phase)}
    >
      {/* nav visibility toggle */}
      <button
        onClick={toggleNav}
        title={navHidden ? "Show navbar" : "Hide navbar for more focus"}
        aria-label={navHidden ? "Show navbar" : "Hide navbar"}
        className="absolute top-3 right-3 p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
      >
        {navHidden ? (
          <PanelTopOpen className="h-5 w-5" />
        ) : (
          <PanelTopClose className="h-5 w-5" />
        )}
      </button>

      <Card className="w-full max-w-md landscape:max-w-3xl bg-card border-border text-text-primary shadow-xl">
        <CardContent className="flex flex-col gap-4 md:gap-6 p-5 md:p-8">
          <div className="flex flex-col landscape:flex-row items-center justify-center gap-4 md:gap-6 landscape:gap-10">
          {/* left half (landscape) / top (portrait): identity + cup */}
          <div className="flex flex-col items-center gap-2 landscape:flex-1">
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-lg font-bold text-text-primary tracking-wide">
                Coffee Focus
              </h1>
              <p
                className="text-sm font-semibold transition-colors duration-500"
                style={{ color: "var(--drink)" }}
              >
                {status === "finished"
                  ? phase === "focus"
                    ? "Cup's empty — nice work! ☕"
                    : "Break's over — ready for another?"
                  : `${PHASE_META[phase].emoji} ${PHASE_META[phase].label}`}
              </p>
            </div>

            <CoffeeCup progress={progress} status={status} phase={phase} />
          </div>

          {/* right half (landscape) / bottom (portrait): all the buttons */}
          <div className="flex flex-col items-center gap-4 md:gap-6 landscape:flex-1">
            <PhaseSwitcher phase={phase} status={status} onSwitch={switchPhase} />

            <p
              className="text-5xl md:text-7xl font-mono font-extrabold text-text-primary tabular-nums"
              aria-live="polite"
            >
              {formatRemaining(remainingMs)}
            </p>

            <div className="flex items-center gap-2">
              <TimerControls
                status={status}
                phase={phase}
                onStart={start}
                onPause={pause}
                onResume={resume}
                onReset={reset}
                onStartBreak={() => startBreak(nextBreakKind)}
                onSkipBreak={skipBreak}
              />
              <SettingsPanel
                config={config}
                isActive={status === "running" || status === "paused"}
                onSave={updateConfig}
              />
            </div>

            {/* daily counter — option C */}
            <p className="text-sm font-semibold text-text-muted">
              {todayCount} ☕ today
            </p>
          </div>
          </div>

          {/* distraction pad — full width under both halves */}
          <NotesSection />
        </CardContent>
      </Card>
    </div>
  );
}
