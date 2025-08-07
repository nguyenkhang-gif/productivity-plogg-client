"use client";

import { HomeOverview } from "@/components/home/HomeOverview";
import Skills from "@/components/home/Skills";

// import { RootState } from "@/redux/store";
// import { useSelector } from "react-redux";

export default function Home() {
  // const count = useSelector((state: RootState) => state.counter.count);
  // const user = useSelector((state: RootState) => state.user);
  // console.log(user);
  // console.log(count);
  return (
    <div className="h-full items-center flex flex-col px-3">
      <HomeOverview/>
      <Skills />
    </div>
  );
}
