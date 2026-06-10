// Decorative values with no CSS variable token equivalent.
// Token-equivalent colors (text, bg, border) live in globals.css and tailwind.config.ts.
export const LANDING_THEME = {
  // Terminal green — used for prompt symbols, cursor, status indicators
  terminal: "#00ff9d",
  terminalMuted: "rgba(0, 255, 157, 0.15)",

  // Accent variants used in inline styles and framer-motion animations
  accent: "#0E78F9",
  accentBorder: "rgba(14, 120, 249, 0.4)",
  accentMuted: "rgba(14, 120, 249, 0.1)",
  accentGlow: "rgba(14, 120, 249, 0.25)",

  // Semi-transparent overlays with no static token equivalent
  overlayBg: "rgba(0, 0, 0, 0.45)",
} as const;
