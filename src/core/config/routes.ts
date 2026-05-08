/**
 * Route access config — tương tự Vue Router meta.
 *
 * access:
 *   "private"    — phải login mới vào được, chưa login → redirect /auth
 *   "public"     — ai cũng vào được
 *   "guest-only" — chỉ dành cho chưa login (vd: /auth), đã login → redirect /
 */

type RouteAccess = "private" | "public" | "guest-only";

interface RouteConfig {
  path: string;
  access: RouteAccess;
  exact?: boolean; // true = khớp chính xác, false/undefined = prefix match
}

export const routes: RouteConfig[] = [
  // Guest-only: đã login thì redirect về /
  { path: "/auth", access: "guest-only", exact: true },

  // Public: ai cũng xem được
  { path: "/portfolio", access: "public" },

  // Private: phải login
  { path: "/", access: "private", exact: true },
  { path: "/create-post", access: "private" },
  { path: "/posts", access: "private" },
  { path: "/epub", access: "private" },

  { path: "/face-test", access: "private" },
  { path: "/profile", access: "private" },
];

/** Default nếu path không khớp rule nào */
const DEFAULT_ACCESS: RouteAccess = "private";

const REDIRECT_WHEN_AUTHED = "/posts";
const REDIRECT_WHEN_NOT_AUTHED = "/auth";

function matchRoute(pathname: string): RouteAccess {
  for (const route of routes) {
    const matched = route.exact
      ? pathname === route.path
      : pathname === route.path || pathname.startsWith(route.path + "/");

    if (matched) return route.access;
  }
  return DEFAULT_ACCESS;
}

export function resolveRedirect(
  pathname: string,
  isAuth: boolean
): string | null {
  const access = matchRoute(pathname);

  if (access === "private" && !isAuth) return REDIRECT_WHEN_NOT_AUTHED;
  if (access === "guest-only" && isAuth) return REDIRECT_WHEN_AUTHED;

  return null; // không cần redirect
}
