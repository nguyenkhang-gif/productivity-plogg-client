"use client";

import { Lock } from "lucide-react";
import { DRINK_DEFS } from "@/core/lib/pomodoro/progression";

interface DrinkPickerProps {
  level: number;
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function DrinkPicker({ level, selectedId, onSelect }: DrinkPickerProps) {
  // Nothing to choose while there's only one drink unlocked and one locked —
  // still show it: seeing the locked drink IS the motivation.
  return (
    <div className="flex items-center gap-2">
      {DRINK_DEFS.map((drink) => {
        const locked = level < drink.unlockLevel;
        const selected = drink.id === selectedId;
        return (
          <button
            key={drink.id}
            onClick={() => !locked && onSelect(drink.id)}
            disabled={locked}
            title={
              locked
                ? `${drink.name} — unlocks at level ${drink.unlockLevel}`
                : drink.name
            }
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
              selected
                ? "border-[var(--drink)] bg-surface-raised"
                : locked
                ? "border-transparent opacity-40 cursor-not-allowed"
                : "border-transparent hover:bg-surface-raised"
            }`}
          >
            <span className="text-lg leading-none">{drink.emoji}</span>
            <span className="text-[10px] font-semibold text-text-muted whitespace-nowrap">
              {locked ? (
                <span className="flex items-center gap-0.5">
                  <Lock className="h-2.5 w-2.5" />
                  Lv {drink.unlockLevel}
                </span>
              ) : (
                drink.name
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
