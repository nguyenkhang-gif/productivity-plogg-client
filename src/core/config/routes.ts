/**
 * Access control cho route — tương tự Vue Router meta.
 *
 * access:
 *   "private"    — phải login mới vào được, chưa login → redirect /auth
 *   "public"     — ai cũng vào được
 *   "guest-only" — chỉ dành cho chưa login (vd: /auth), đã login → redirect /
 *
 * Danh sách route nằm ở `config/navigation.ts` (registry chung: access + nav + layout).
 * File này chỉ giữ phần quyết định redirect cho RouteGuard.
 */

import {
  APP_ROUTES,
  DEFAULT_ACCESS,
  findRoute,
  meetsRole,
  type RouteAccess,
  type RouteRole,
} from "./navigation";
import { buildLoginUrl, readReturnToFromSearch } from "@/core/auth/return-to";

export type { RouteAccess };
export { APP_ROUTES as routes };

const REDIRECT_WHEN_AUTHED = "/";

function matchRoute(pathname: string): RouteAccess {
  return findRoute(pathname)?.access ?? DEFAULT_ACCESS;
}

/**
 * `role` là bắt buộc để không ai quên truyền rồi vô tình đá nhầm moderator ra
 * khỏi /admin. An toàn vì `setCredentials` set profile và isLoading=false trong
 * cùng một action — RouteGuard chỉ gọi hàm này sau khi isLoading đã false.
 *
 * `search` (vd `window.location.search`) dùng cho đường dẫn quay lại (#8):
 *  - private + chưa login → `/auth?redirect=<pathname + search>` để login xong quay về
 *  - guest-only + đã login → ưu tiên `?redirect=` hợp lệ; nếu không, rule này
 *    sẽ thắng race với SignInCard và đá user về `/`, làm mất link invite
 */
export function resolveRedirect(
  pathname: string,
  isAuth: boolean,
  role: RouteRole,
  search = ""
): string | null {
  const access = matchRoute(pathname);

  if (access === "private" && !isAuth) return buildLoginUrl(`${pathname}${search}`);
  if (access === "guest-only" && isAuth) {
    return readReturnToFromSearch(search) ?? REDIRECT_WHEN_AUTHED;
  }

  // Đã login nhưng thiếu quyền (vd user thường mở /admin) → về trang chủ.
  // Chỉ ẩn UI; backend vẫn phải tự enforce.
  if (isAuth && !meetsRole(role, pathname)) return REDIRECT_WHEN_AUTHED;

  return null; // không cần redirect
}
