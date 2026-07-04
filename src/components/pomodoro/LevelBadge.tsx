"use client";

import { levelFromXp, xpForLevel } from "@/core/lib/pomodoro/progression";

interface LevelBadgeProps {
  totalXp: number;
  /** non-null right after leveling up → brief glow */
  lastLevelUp: number | null;
}

export default function LevelBadge({ totalXp, lastLevelUp }: LevelBadgeProps) {
  const level = levelFromXp(totalXp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const into = totalXp - floor;
  const span = ceil - floor;

  return (
    <div
      className={`flex items-center gap-2 rounded-full bg-surface-raised px-3 py-1.5 transition-shadow duration-500 ${
        lastLevelUp !== null ? "animate-pulse shadow-[0_0_16px_var(--drink)]" : ""
      }`}
    >
      <span
        className="text-xs font-bold whitespace-nowrap"
        style={{ color: "var(--drink)" }}
      >
        Lv {level}
      </span>
      <div className="w-20 h-1.5 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${Math.min(100, (into / span) * 100)}%`,
            backgroundColor: "var(--drink)",
          }}
        />
      </div>
      <span className="text-[10px] font-semibold text-text-muted whitespace-nowrap tabular-nums">
        {into}/{span} XP
      </span>
    </div>
  );
}
