"use client";

import Navbar from "@/components/layouts/Navbar";
import RouteGuard from "@/components/layouts/RouteGuard";
import TitleManager from "@/components/layouts/TitleManager";
import { useLayoutVisibility } from "@/components/layouts/useLayoutVisibility";
import UserChatBubble from "@/components/chat/UserChatBubble";
import { cn } from "@/core/lib/utils";
import React from "react";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { hideNav, isAuthPage, isMeetingRoom, isGuestLanding } = useLayoutVisibility();

  return (
    <RouteGuard>
      <TitleManager />
      {!hideNav && <Navbar />}
      <div className={cn("h-full", { "pt-14": !hideNav, "pt-0": hideNav })}>
        {children}
      </div>
      {!isAuthPage && !isMeetingRoom && !isGuestLanding && <UserChatBubble />}
    </RouteGuard>
  );
}
