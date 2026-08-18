"use client";

import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

import { RootState } from "@/core/redux/store";
import { hasLeftSidebar } from "@/core/config/navigation";

export function useLayoutVisibility() {
  const pathname = usePathname();
  const isAuth = useSelector((state: RootState) => state.user.isAuth);

  const isAuthPage = pathname.startsWith("/auth");
  const isMeetingRoom = pathname.startsWith("/meetings/room");
  const isGuestLanding = pathname === "/" && !isAuth;
  const hideNav = false;

  // Sidebar cần profile + friendship nên chỉ dựng khi đã login — /epub là route
  // public, khách vẫn dùng được nhưng không render sidebar (tránh card rỗng + 401).
  const showLeftSidebar = isAuth && hasLeftSidebar(pathname);

  return {
    isAuthPage,
    isMeetingRoom,
    isGuestLanding,
    hideNav,
    showLeftSidebar,
  };
}
