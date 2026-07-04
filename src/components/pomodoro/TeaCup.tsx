"use client";

import type { DrinkVisualProps } from "./CoffeeCup";

// Handle-less tea cup (yunomi). Same contract as every drink visual:
// colors only via --drink* vars, liquid height follows `progress`.
const CUP_X = 34;
const CUP_Y = 34;
const CUP_W = 44;
const CUP_H = 52;

export default function TeaCup({ progress, status, phase }: DrinkVisualProps) {
  const level = phase === "focus" ? Math.max(0, Math.min(1, progress)) : 1;
  const liquidH = CUP_H * level;
  const liquidY = CUP_Y + CUP_H - liquidH;
  const empty = level <= 0.01;

  return (
    <svg
      viewBox="4 0 104 120"
      className="w-36 h-32 md:w-52 md:h-48"
      role="img"
      aria-label={`Tea cup ${Math.round(level * 100)}% full`}
    >
      <defs>
        <clipPath id="teacup-interior">
          <rect x={CUP_X} y={CUP_Y} width={CUP_W} height={CUP_H} rx={10} />
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
          {[46, 56, 66].map((x, i) => (
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
        cy={102}
        rx={34}
        ry={6}
        className="fill-surface-raised"
        stroke="var(--color-border)"
        strokeWidth={1}
      />

      {/* cup body — slightly tapered, no handle */}
      <path
        d="M 32 32
           L 80 32
           L 77 84
           Q 76 90 68 90
           L 44 90
           Q 36 90 35 84
           Z"
        className="fill-surface-raised"
        stroke="var(--color-text-muted)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* tea — height follows remaining time */}
      <g clipPath="url(#teacup-interior)">
        <rect
          x={CUP_X}
          y={liquidY}
          width={CUP_W}
          height={liquidH}
          fill="var(--drink)"
          style={{ transition: "y 0.5s linear, height 0.5s linear, fill 0.6s ease" }}
        />
        <rect
          x={CUP_X}
          y={CUP_Y + CUP_H - 8}
          width={CUP_W}
          height={8}
          fill="var(--drink-deep)"
          opacity={empty ? 0 : 0.6}
          style={{ transition: "opacity 0.5s linear, fill 0.6s ease" }}
        />
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

      {/* paused overlay */}
      {status === "paused" && (
        <g fill="var(--color-text-primary)" opacity={0.85}>
          <rect x={48} y={52} width={5} height={18} rx={2} />
          <rect x={59} y={52} width={5} height={18} rx={2} />
        </g>
      )}
    </svg>
  );
}
