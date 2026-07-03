"use client";

import Navbar from "@/components/layouts/Navbar";
import RouteGuard from "@/components/layouts/RouteGuard";
import TitleManager from "@/components/layouts/TitleManager";
import { useLayoutVisibility } from "@/components/layouts/useLayoutVisibility";
import {
  NavVisibilityProvider,
  useNavVisibility,
} from "@/components/layouts/NavVisibilityContext";
// import UserChatBubble from "@/components/chat/UserChatBubble"; // temporarily disabled
import { cn } from "@/core/lib/utils";
import React from "react";

function LayoutFrame({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { hideNav } = useLayoutVisibility();
  const { navHidden } = useNavVisibility();
  const navVisible = !hideNav && !navHidden;

  return (
    <RouteGuard>
      <TitleManager />
      {!hideNav && <Navbar />}
      <div
        className={cn("h-full transition-[padding] duration-300 ease-in-out", {
          "pt-14": navVisible,
          "pt-0": !navVisible,
        })}
      >
        {children}
      </div>
      {/* <UserChatBubble /> temporarily disabled */}
    </RouteGuard>
  );
}

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavVisibilityProvider>
      <LayoutFrame>{children}</LayoutFrame>
    </NavVisibilityProvider>
  );
}
