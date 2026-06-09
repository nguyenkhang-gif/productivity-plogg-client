"use client";

import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

import { RootState } from "@/core/redux/store";

export function useLayoutVisibility() {
  const pathname = usePathname();
  const isAuth = useSelector((state: RootState) => state.user.isAuth);

  const isAuthPage = pathname.startsWith("/auth");
  const isMeetingRoom = pathname.startsWith("/meetings/room");
  const isGuestLanding = pathname === "/" && !isAuth;
  const hideNav = false;

  return { isAuthPage, isMeetingRoom, isGuestLanding, hideNav };
}
