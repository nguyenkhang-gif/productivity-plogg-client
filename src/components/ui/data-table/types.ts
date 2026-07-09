import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export function getNestedValue<T>(row: T, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null) return acc;
    return (acc as Record<string, unknown>)[key];
  }, row);
}

export interface ColumnConfig<T> {
  key: string; // supports dot-path, e.g. "author.fullName"
  header: string;
  format?: "text" | "badge" | "date";
  /** Overrides default rendering entirely for this column. */
  render?: (row: T) => ReactNode;
  /** Used when format === "badge": maps the raw value to a Tailwind class string. */
  badgeMap?: Record<string, string>;
  /** Used when format === "date". Defaults to toLocaleDateString(). */
  dateFormat?: (value: unknown) => string;
  className?: string | ((row: T) => string);
  align?: "left" | "center" | "right";
  nowrap?: boolean;
  onCellClick?: (row: T) => void;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  type: "text" | "select";
  label?: string;
  placeholder?: string;
  value: string;
  options?: FilterOption[]; // required when type === "select"
  onChange: (value: string) => void;
}

export interface RowActionConfig<T> {
  key: string;
  icon: LucideIcon;
  label?: string;
  tooltip?: string;
  variant?: "default" | "success" | "danger";
  onClick: (row: T) => void;
  show?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
