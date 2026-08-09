"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Khang Nguyen",
  "/posts": "Posts",
  "/create-post": "Create Post",
  "/epub": "Epub Gen",
  "/profile": "Profile",
  "/friends": "Friends",
  "/upload": "Files",
  "/auth": "Login",
  "/cbz": "CBZ",
  "/focusCoffee": "Coffee Focus",
};

export default function TitleManager() {
  const pathname = usePathname();

  useEffect(() => {
    const base = PAGE_TITLES[pathname] ?? null;
    document.title = base ? `${base} | KPro` : "KPro";
  }, [pathname]);

  return null;
}
