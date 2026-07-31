/** staleTime presets cho React Query (đơn vị: milliseconds) */
export const STALE_TIME = {
  SHORT: 30 * 1000, // 30s  — data thay đổi nhanh (requests, notifications)
  DEFAULT: 60 * 1000, // 1 phút — global default trong reactQuery.ts
  MEDIUM: 2 * 60 * 1000, // 2 phút — list ít đổi (guilds, friends)
  LONG: 10 * 60 * 1000, // 10 phút — data gần như tĩnh
} as const;
