"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { PomodoroConfig } from "@/core/lib/pomodoro/coffeeFocusStore";

const FIELDS: { key: keyof PomodoroConfig; label: string; min: number; max: number }[] = [
  { key: "focusMin", label: "Focus (minutes)", min: 1, max: 120 },
  { key: "shortBreakMin", label: "Short break (minutes)", min: 1, max: 60 },
  { key: "longBreakMin", label: "Long break (minutes)", min: 1, max: 60 },
  { key: "sessionsPerCycle", label: "Sessions before long break", min: 2, max: 12 },
];

interface SettingsPanelProps {
  config: PomodoroConfig;
  isActive: boolean; // running or paused — new values apply from the next session
  onSave: (partial: Partial<PomodoroConfig>) => void;
}

export default function SettingsPanel({ config, isActive, onSave }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PomodoroConfig>(config);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(config); // fresh draft each time it opens
    setOpen(next);
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Math.round(value)));

  const handleSave = () => {
    const cleaned = { ...draft };
    for (const { key, min, max } of FIELDS) {
      cleaned[key] = clamp(
        Number.isFinite(draft[key]) ? draft[key] : config[key],
        min,
        max
      );
    }
    onSave(cleaned);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          title="Timer settings"
          aria-label="Timer settings"
          className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-card border-border text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Timer settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {FIELDS.map(({ key, label, min, max }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <Label htmlFor={`cfg-${key}`} className="text-sm text-text-secondary">
                {label}
              </Label>
              <Input
                id={`cfg-${key}`}
                type="number"
                min={min}
                max={max}
                value={draft[key]}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, [key]: e.target.valueAsNumber }))
                }
                className="w-20 bg-surface border-border text-text-primary text-center"
              />
            </div>
          ))}

          {isActive && (
            <p className="text-xs text-text-muted">
              A session is in progress — new durations apply from the next one.
            </p>
          )}

          <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 font-semibold">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
