/**
 * Progression: XP curve + drink metadata (docs/coffeFocus/phase-5-progression.md).
 *
 * Rules:
 * - 1 XP per focus minute, completed sessions only, no cap
 * - +20 XP cycle bonus on the sessionsPerCycle-th completed focus of the day
 * - Level is ALWAYS derived from totalXp — never stored
 *
 * Drink components live in src/components/pomodoro/drinkComponents.ts so hooks
 * can use this metadata without importing UI.
 */

export const CYCLE_BONUS_XP = 20;

/** Cumulative XP required to reach a level: 50·n·(n−1). Lv2=100, Lv3=300, Lv10=4500. */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpForLevel(level + 1)) level++;
  return level;
}

export type DrinkAccent = "coffee" | "tea";

export interface DrinkDef {
  id: string;
  name: string;
  emoji: string;
  unlockLevel: number;
  /** Palette used during focus — maps to --color-<accent>* theme tokens */
  accent: DrinkAccent;
}

export const DRINK_DEFS: DrinkDef[] = [
  { id: "coffee", name: "Coffee", emoji: "☕", unlockLevel: 1, accent: "coffee" },
  { id: "greenTea", name: "Green Tea", emoji: "🍵", unlockLevel: 3, accent: "tea" },
  // future: boba (Lv5), espresso, cocoa, matcha...
];

/** Unknown/missing id falls back to coffee — also covers a stored id whose
 *  drink was removed in a later version. */
export function getDrinkDef(id: string | undefined): DrinkDef {
  return DRINK_DEFS.find((d) => d.id === id) ?? DRINK_DEFS[0];
}

export function drinksUnlockedBetween(fromLevel: number, toLevel: number): DrinkDef[] {
  return DRINK_DEFS.filter((d) => d.unlockLevel > fromLevel && d.unlockLevel <= toLevel);
}
