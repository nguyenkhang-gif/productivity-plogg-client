"use client";

import Navbar from "@/components/layouts/Navbar";
import RouteGuard from "@/components/layouts/RouteGuard";
import LeftSidebar from "@/components/posts/sidebar/LeftSidebar";
import TitleManager from "@/components/layouts/TitleManager";
import { useLayoutVisibility } from "@/components/layouts/useLayoutVisibility";
import {
  NavVisibilityProvider,
  useNavVisibility,
} from "@/components/layouts/NavVisibilityContext";
// import UserChatBubble from "@/components/chat/UserChatBubble"; // temporarily disabled
import { cn } from "@/core/lib/utils";
import VaultLogoutWatcher from "@/components/vault/VaultLogoutWatcher";
import React from "react";

function LayoutFrame({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { hideNav, showLeftSidebar } = useLayoutVisibility();
  const { navHidden } = useNavVisibility();
  const navVisible = !hideNav && !navHidden;

  return (
    <RouteGuard>
      <TitleManager />
      <VaultLogoutWatcher />
      {!hideNav && <Navbar />}
      <div
        className={cn("h-full transition-[padding] duration-300 ease-in-out", {
          "pt-14": navVisible,
          "pt-0": !navVisible,
        })}
      >
        {showLeftSidebar ? (
          // Shell 2 cột cho các route khai `leftSidebar` trong config/navigation.ts.
          // min-w-0: grid item mặc định min-width:auto → thiếu nó thì panel scroll
          // ngang (epub) đẩy phình cột thay vì scroll trong khung.
          <div className="min-h-screen bg-page w-full px-4 xl:px-8 pt-4 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-4 xl:gap-6 items-start">
              <LeftSidebar />
              <div className="min-w-0">{children}</div>
            </div>
          </div>
        ) : (
          children
        )}
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
