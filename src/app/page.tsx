"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosInstance";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export default function Home() {
  const count = useSelector((state: RootState) => state.counter.count);
  const user = useSelector((state: RootState) => state.user);
  console.log("user", user);
  console.log("count", count);

  console.log("inital render");
  const handleAddChaper = async () => {
    console.log("handle add");
    try {
      const data = await axiosInstance.post("/auth/refresh-token");
      console.log("data", data.data);
    } catch (e) {
      console.error("add chapter bug ", e);
    }
  };

  return (
    <div className="h-full items-center justify-center flex">
      <Card
        className="w-[80%] h-[80%] px-2"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.5)", // Nền trắng với opacity 0.5
        }}
      >
        <CardHeader>
          <CardTitle>epub converter</CardTitle>
        </CardHeader>
        <div className="flex w-[90%]">
          {/* Thay đổi từ Input sang textarea */}
          <textarea
            className="w-full mr-3 p-2 border border-gray-300 rounded"
            rows={4} // Số dòng hiển thị
            placeholder="Enter text here..."
          />
          <Button className="w-[200px]" onClick={handleAddChaper}>
            Add
          </Button>
        </div>
      </Card>
    </div>
  );
}
