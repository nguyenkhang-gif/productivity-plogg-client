import {
  BookOpen,
  LayoutDashboard,
  MessagesSquare,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Registry route duy nhất của app: path + quyền truy cập + nơi xuất hiện trên nav
 * + layout shell.
 *
 * Thêm route mới → khai báo ở đây, KHÔNG thêm mảng link rời bên trong component.
 * Consumer đọc qua selector bên dưới, không đọc `APP_ROUTES` trực tiếp.
 *
 * Xem docs/architecture/route-registry.md.
 */

export type RouteAccess = "private" | "public" | "guest-only";

/** Quyền tối thiểu để THẤY link. Chỉ dùng cho UI — backend vẫn tự enforce. */
export type RouteRole = "any" | "moderator" | "admin";

/** Nơi một route xuất hiện trên UI điều hướng. */
export type NavSurface = "navbar" | "navbar-tools" | "sidebar" | "admin-tab";

export interface AppRoute {
  path: string;
  /** true = khớp chính xác, false/undefined = prefix match. Chỉ ảnh hưởng access. */
  exact?: boolean;
  access: RouteAccess;
  /** mặc định "any" */
  role?: RouteRole;
  /** không có label = route không xuất hiện ở nav nào. Một route MỘT tên, dùng chung mọi surface. */
  label?: string;
  icon?: LucideIcon;
  surfaces?: NavSurface[];
  /**
   * true = trang render trong shell 2 cột kèm LeftSidebar.
   * Khớp CHÍNH XÁC path (xem `hasLeftSidebar`), khác với `exact` của access.
   */
  leftSidebar?: boolean;
}

/**
 * Thứ tự trong mảng = thứ tự hiển thị trên nav (mọi surface đọc cùng một mảng).
 *
 * Ràng buộc duy nhất: route cụ thể phải đứng TRƯỚC route prefix bao nó
 * (vd /admin/posts trước /admin), vì `findRoute` lấy entry khớp đầu tiên.
 */
export const APP_ROUTES: AppRoute[] = [
  {
    path: "/",
    exact: true,
    access: "public",
    label: "Home",
    surfaces: ["navbar"],
  },
  {
    path: "/posts",
    access: "private",
    label: "Posts",
    icon: LayoutDashboard,
    surfaces: ["navbar", "sidebar"],
    // chỉ /posts có sidebar; /posts/:id có hero full-bleed nên đứng ngoài shell
    leftSidebar: true,
  },
  {
    path: "/epub",
    access: "public",
    label: "Epub Gen",
    icon: BookOpen,
    surfaces: ["navbar-tools", "sidebar"],
    leftSidebar: true,
  },
  {
    path: "/focusCoffee",
    access: "public",
    label: "Coffee Focus",
    surfaces: ["navbar-tools"],
  },
  {
    path: "/friends",
    access: "private",
    label: "Bạn bè",
    icon: Users,
    surfaces: ["sidebar"],
  },
  {
    path: "/upload",
    access: "private",
    label: "Files",
    icon: Upload,
    surfaces: ["navbar-tools", "sidebar"],
    leftSidebar: true,
  },
  // Discord/Guild — trước đây không có mặt ở nav nào, chỉ vào được bằng URL
  {
    path: "/guilds",
    access: "private",
    label: "Server",
    icon: MessagesSquare,
    surfaces: ["sidebar"],
  },
  {
    path: "/admin/posts",
    exact: true,
    access: "private",
    role: "moderator",
    label: "Admin",
    icon: ShieldCheck,
    surfaces: ["navbar", "sidebar"],
  },
  {
    path: "/admin/users",
    exact: true,
    access: "private",
    role: "admin",
    label: "Users",
    icon: UserCog,
  },
  // prefix /admin phải nằm SAU hai route cụ thể ở trên
  { path: "/admin", access: "private", role: "moderator" },

  // ---- Route không xuất hiện ở nav nào ----
  { path: "/auth", exact: true, access: "guest-only" },
  { path: "/auth/callback", exact: true, access: "public" },
  { path: "/buttons", access: "public" },
  { path: "/create-post", access: "private" },
  { path: "/profile", access: "private" },
  { path: "/invite", access: "private" },
  { path: "/moderation", access: "private" },
];

/** Route không khớp rule nào → private. */
export const DEFAULT_ACCESS: RouteAccess = "private";

function matchPath(route: AppRoute, pathname: string): boolean {
  return route.exact
    ? pathname === route.path
    : pathname === route.path || pathname.startsWith(route.path + "/");
}

export function findRoute(pathname: string): AppRoute | null {
  return APP_ROUTES.find((r) => matchPath(r, pathname)) ?? null;
}

/**
 * Trang có được bọc trong shell 2 cột (LeftSidebar + nội dung) không.
 *
 * Cố tình khớp CHÍNH XÁC: một route cha có sidebar không kéo theo route con của nó
 * (vd /posts có, /posts/:id không — trang chi tiết dùng hero full-bleed).
 */
export function hasLeftSidebar(pathname: string): boolean {
  return APP_ROUTES.some((r) => r.leftSidebar && pathname === r.path);
}

export interface NavContext {
  isAuth: boolean;
  role: RouteRole;
}

const ROLE_RANK: Record<RouteRole, number> = { any: 0, moderator: 1, admin: 2 };

/**
 * Link hiển thị trên một surface, đã lọc theo trạng thái đăng nhập và quyền.
 * Dùng qua hook `useNavItems` thay vì gọi trực tiếp trong component.
 */
export function navItems(surface: NavSurface, ctx: NavContext): AppRoute[] {
  return APP_ROUTES.filter((r) => {
    if (!r.label || !r.surfaces?.includes(surface)) return false;
    if (r.access === "private" && !ctx.isAuth) return false;
    if (r.access === "guest-only" && ctx.isAuth) return false;
    return meetsRole(ctx.role, r.path);
  });
}

/**
 * User có đủ quyền cho route này không (theo `role` khai trong registry).
 * Dùng cho nav phụ không đi qua `navItems` — vd tab bar trong /admin.
 */
export function meetsRole(userRole: RouteRole, path: string): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[findRoute(path)?.role ?? "any"];
}
