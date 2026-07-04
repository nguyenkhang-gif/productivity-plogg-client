import type { ComponentType } from "react";
import CoffeeCup, { type DrinkVisualProps } from "./CoffeeCup";
import TeaCup from "./TeaCup";

/**
 * Drink id → visual component. Metadata (name, unlock level, accent) lives in
 * src/core/lib/pomodoro/progression.ts so hooks never import UI. Adding a drink:
 * one entry in DRINK_DEFS there + one component here following DrinkVisualProps.
 */
export const DRINK_COMPONENTS: Record<string, ComponentType<DrinkVisualProps>> = {
  coffee: CoffeeCup,
  greenTea: TeaCup,
};

export function getDrinkComponent(id: string): ComponentType<DrinkVisualProps> {
  return DRINK_COMPONENTS[id] ?? CoffeeCup;
}
