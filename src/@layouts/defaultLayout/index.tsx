import Navbar from "@/components/layouts/Navbar";
import RouteGuard from "@/components/layouts/RouteGuard";
import UserChatBubble from "@/components/chat/UserChatBubble";
import { cn } from "@/core/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const isMeetingRoom = pathname.startsWith("/meetings/room");

  return (
    <RouteGuard>
      {!isAuthPage && <Navbar />}
      <div className={cn("h-full", { "pt-20": !isAuthPage, "pt-0": isAuthPage })}>
        {children}
      </div>
      {!isAuthPage && !isMeetingRoom && <UserChatBubble />}
    </RouteGuard>
  );
}
