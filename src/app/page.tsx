"use client";

import { HomeOverview } from "@/components/home/HomeOverview";
import Skills from "@/components/home/Skills";

export default function Home() {
  return (
    <div className="h-full items-center flex flex-col px-3">
      <HomeOverview/>
      <Skills />
    </div>
  );
}
