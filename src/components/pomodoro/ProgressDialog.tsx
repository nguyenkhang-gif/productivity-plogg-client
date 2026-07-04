"use client";

import { Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LevelBadge from "./LevelBadge";
import DrinkPicker from "./DrinkPicker";
import type { Progress } from "@/core/lib/pomodoro/coffeeFocusStore";

interface ProgressDialogProps {
  xp: Progress;
  level: number;
  lastLevelUp: number | null;
  selectedDrinkId: string;
  onSelectDrink: (id: string) => void;
}

export default function ProgressDialog({
  xp,
  level,
  lastLevelUp,
  selectedDrinkId,
  onSelectDrink,
}: ProgressDialogProps) {
  const focusHours = Math.floor(xp.totalFocusMin / 60);
  const focusMins = xp.totalFocusMin % 60;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          title="Progress & drinks"
          aria-label="Progress and drinks"
          className={`p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-raised transition-all ${
            lastLevelUp !== null ? "animate-pulse text-[var(--drink)]" : ""
          }`}
        >
          <Trophy className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto bg-card border-border text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Your progress</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* level + XP bar */}
          <div className="flex justify-center">
            <LevelBadge totalXp={xp.totalXp} lastLevelUp={lastLevelUp} />
          </div>

          {/* lifetime stats */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-surface-raised rounded-lg py-3">
              <p className="text-lg font-bold text-text-primary tabular-nums">
                {xp.totalXp.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-text-muted">total XP</p>
            </div>
            <div className="bg-surface-raised rounded-lg py-3">
              <p className="text-lg font-bold text-text-primary tabular-nums">
                {focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`}
              </p>
              <p className="text-xs font-semibold text-text-muted">focused, lifetime</p>
            </div>
          </div>

          {/* drink collection */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Drinks
            </p>
            <div className="flex justify-center">
              <DrinkPicker
                level={level}
                selectedId={selectedDrinkId}
                onSelect={onSelectDrink}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
