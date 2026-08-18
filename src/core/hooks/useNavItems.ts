"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@/core/redux/store";
import { useRole } from "@/core/hooks/useRole";
import {
  navItems,
  type AppRoute,
  type NavSurface,
  type RouteRole,
} from "@/core/config/navigation";

/** Role của user hiện tại quy về thang quyền của registry. */
export function useRouteRole(): RouteRole {
  const { isAdmin, canModerate } = useRole();
  return isAdmin ? "admin" : canModerate ? "moderator" : "any";
}

/**
 * Link nav của một surface, đã lọc theo đăng nhập + quyền.
 * Dùng thay cho mảng link viết tay trong component (Navbar, LeftSidebar).
 */
export function useNavItems(surface: NavSurface): AppRoute[] {
  const isAuth = useSelector((s: RootState) => s.user.isAuth);
  const role = useRouteRole();

  return useMemo(
    () => navItems(surface, { isAuth, role }),
    [surface, isAuth, role],
  );
}
