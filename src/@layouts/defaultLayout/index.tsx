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

  return (
    <>
      <Navbar />
      <div
        className={cn("pt-20 h-full", {
          "pt-16": pathname.split("/").includes("meetings"),
        })}
      >
        {children}
      </div>
    </>
  );
}
