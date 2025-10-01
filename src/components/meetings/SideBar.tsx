"use client";
import { sideBarLinks } from "@/constants";
import { cn } from "@/core/lib/utils";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const SideBar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-100 w-fit flex-col justify-between bg-dark-1 p-6 pt-3  text-white max-sm:hidden lg:w-[264px]">
      <div className="flex flex- flex-col ">
        {sideBarLinks.map((link) => {
          const isActive = pathname.includes(link.route);

          const Icon = link.icon
          return (
            <Link
              href={`/meetings${link.route}`}
              key={link.label}
              className={cn(
                "flex gap-4 items-center p-4 rounded-lg justify-start",
                {
                  "bg-blue-1": isActive,
                }
              )}
            >
              <Icon/> 
              {link.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SideBar;
