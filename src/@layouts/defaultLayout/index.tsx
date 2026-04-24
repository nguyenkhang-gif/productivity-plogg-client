import Navbar from "@/components/layouts/Navbar";
import { cn } from "@/core/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Kiểm tra xem path có bắt đầu bằng /auth không
  const isAuthPage = pathname.startsWith("/auth");
  const isMeetingPage = pathname.split("/").includes("meetings");

  return (
    <>
      {/* Ẩn luôn Navbar nếu là trang Auth (tùy chọn) */}
      {!isAuthPage && <Navbar />}
      
      <div
        className={cn("h-full", {
          "pt-20": !isAuthPage && !isMeetingPage, // Padding mặc định
          "pt-16": isMeetingPage && !isAuthPage,  // Padding cho trang meetings
          "pt-0": isAuthPage,                     // Không padding cho trang auth
        })}
      >
        {children}
      </div>
    </>
  );
}