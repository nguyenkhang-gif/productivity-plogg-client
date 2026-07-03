"use client";

import { Play, Pause, RotateCcw, Coffee, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimerPhase, TimerStatus } from "@/core/hooks/pomodoro/usePomodoroTimer";

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
          <Button size="lg" onClick={onSkipBreak} className="bg-accent hover:bg-accent/90 h-12 px-6 font-semibold">
            <ArrowRight className="h-4 w-4 mr-2" />
            Back to focus
          </Button>
        ) : (
          <>
            <Button size="lg" onClick={onStartBreak} className="bg-coffee hover:bg-coffee-deep h-12 px-6 text-white font-semibold">
              <Coffee className="h-4 w-4 mr-2" />
              Take a break
            </Button>
            <Button size="lg" variant="ghost" onClick={onReset} className="text-text-muted hover:text-text-primary h-12 font-semibold">
              Skip
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {status === "idle" && (
        <Button size="lg" onClick={onStart} className="bg-accent hover:bg-accent/90 h-12 px-8 font-semibold">
          <Play className="h-4 w-4 mr-2" />
          Start
        </Button>
      )}

      {status === "running" && (
        <Button size="lg" onClick={onPause} variant="outline" className="border-border h-12 px-8 font-semibold">
          <Pause className="h-4 w-4 mr-2" />
          Pause
        </Button>
      )}

      {status === "paused" && (
        <Button size="lg" onClick={onResume} className="bg-accent hover:bg-accent/90 h-12 px-8 font-semibold">
          <Play className="h-4 w-4 mr-2" />
          Resume
        </Button>
      )}

      {status !== "idle" && (
        <Button
          size="lg"
          variant="ghost"
          onClick={isBreak ? onSkipBreak : onReset}
          className="text-text-muted hover:text-text-primary h-12 font-semibold"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      )}
    </div>
  );
}
