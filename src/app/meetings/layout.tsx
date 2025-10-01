// app/(dashboard)/layout.tsx hoặc app/layout.tsx
"use client";

import SideBar from "@/components/meetings/SideBar";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect } from "react";
import StreamProvider from "@/core/providers/stream-provider";

const HomeLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname.split("/")[2]) {
      router.push("/meetings/home");
    }
  }, []);

  return (
    <StreamProvider>
      <div className="flex flex-1 h-full">
        <SideBar />
        <section className="flex flex-1 flex-col px-0 py-3 max-md:pb-14 sm:px-6 h-full">
          <div className="w-full h-full">{children}</div>
        </section>
      </div>
    </StreamProvider>
  );
};

export default HomeLayout;
