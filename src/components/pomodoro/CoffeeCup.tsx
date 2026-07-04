"use client";

/**
 * Shared contract for every drink visual — Phase 5 formalizes this in a drinks
 * registry with unlockable drinks (docs/coffeFocus/phase-5-progression.md).
 *
 * Color convention: visuals never contain phase logic or hardcoded colors.
 * Liquid uses `var(--drink)` / `var(--drink-deep)` / `var(--drink-foam)` —
 * the parent sets these via `drinkPaletteStyle(phase)` (usePomodoroTimer.ts).
 * The only other rule: something must scale with `progress`.
 */
export interface DrinkVisualProps {
  /** 0–1 remaining time; 1 = full cup */
  progress: number;
  status: "idle" | "running" | "paused" | "finished";
  phase: "focus" | "shortBreak" | "longBreak";
}

// Cup interior (the area coffee can fill), in viewBox units
const CUP_X = 30;
const CUP_Y = 36;
const CUP_W = 52;
const CUP_H = 50;

export default function CoffeeCup({ progress, status, phase }: DrinkVisualProps) {
  // Focus: the cup is "drunk" as time passes. Breaks: freshly refilled cup.
  const level = phase === "focus" ? Math.max(0, Math.min(1, progress)) : 1;
  const liquidH = CUP_H * level;
  const liquidY = CUP_Y + CUP_H - liquidH;
  const empty = level <= 0.01;

  return (
    <svg
      viewBox="4 0 104 120"
      className="w-36 h-32 md:w-52 md:h-48"
      role="img"
      aria-label={`Coffee cup ${Math.round(level * 100)}% full`}
    >
      <defs>
        <clipPath id="cup-interior">
          <rect x={CUP_X} y={CUP_Y} width={CUP_W} height={CUP_H} rx={6} />
        </clipPath>
      </defs>

      {/* steam — rises while the drink is hot (not paused, not empty) */}
      {!empty && status !== "paused" && (
        <g
          stroke="var(--drink-foam)"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        >
          {[44, 56, 68].map((x, i) => (
            <path
              key={x}
              d={`M ${x} 26 c 2 -4, -2 -8, 1 -12`}
              className="cf-steam"
              style={{ animationDelay: `${i * 0.6}s` }}
            />
          ))}
        </g>
      )}

      {/* saucer */}
      <ellipse
        cx={56}
        cy={104}
        rx={40}
        ry={7}
        className="fill-surface-raised"
        stroke="var(--color-border)"
        strokeWidth={1}
      />

      {/* handle */}
      <path
        d="M 86 48 C 104 46, 104 74, 86 72"
        fill="none"
        stroke="var(--color-text-muted)"
        strokeWidth={5}
        strokeLinecap="round"
      />

      {/* cup body */}
      <rect
        x={26}
        y={32}
        width={60}
        height={58}
        rx={9}
        className="fill-surface-raised"
        stroke="var(--color-text-muted)"
        strokeWidth={2.5}
      />

      {/* coffee — height follows remaining time */}
      <g clipPath="url(#cup-interior)">
        <rect
          x={CUP_X}
          y={liquidY}
          width={CUP_W}
          height={liquidH}
          fill="var(--drink)"
          style={{ transition: "y 0.5s linear, height 0.5s linear, fill 0.6s ease" }}
        />
        {/* liquid depth shading at the bottom */}
        <rect
          x={CUP_X}
          y={CUP_Y + CUP_H - 8}
          width={CUP_W}
          height={8}
          fill="var(--drink-deep)"
          opacity={empty ? 0 : 0.6}
          style={{ transition: "opacity 0.5s linear, fill 0.6s ease" }}
        />
        {/* crema line riding the surface */}
        {!empty && (
          <rect
            x={CUP_X}
            y={liquidY}
            width={CUP_W}
            height={3}
            fill="var(--drink-foam)"
            opacity={0.9}
            style={{ transition: "y 0.5s linear, fill 0.6s ease" }}
          />
        )}
      </g>

      {/* paused overlay: two bars on the cup */}
      {status === "paused" && (
        <g fill="var(--color-text-primary)" opacity={0.85}>
          <rect x={48} y={52} width={5} height={18} rx={2} />
          <rect x={59} y={52} width={5} height={18} rx={2} />
        </g>
      )}
    </svg>
  );
}
