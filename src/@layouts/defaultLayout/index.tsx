import Navbar from "@/components/layouts/Navbar";
import { cn } from "@/core/lib/utils";
import { RootState } from "@/core/redux/store";
import { usePathname } from "next/navigation";
import React from "react";
import { useSelector } from "react-redux";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const userInfo = useSelector((state: RootState) => state.user);


  console.log("userInfo in layout: ");
  console.log("userInfo in layout: ", userInfo);
  
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
