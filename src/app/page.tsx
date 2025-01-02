"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";

export default function Home() {
  const count = useSelector((state: RootState) => state.counter.count);
  console.log("count pls", count);
  
  return (
    <div className="h-full items-center justify-center flex">
      <Card
        className="w-[80%] h-[80%] px-2 "
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.5)", // Nền trắng với opacity 0.5
        }}
      >
        <CardHeader>
          <CardTitle>epub converter</CardTitle>
        </CardHeader>
        <div className="flex w-[90%] ">
          <Input className="w-full mr-3" />
          <Button
            className="w-[200px] "
            onClick={() => {
              console.log("handle add ");
            }}
          >
            Add
          </Button>
        </div>
      </Card>
    </div>
  );
}
