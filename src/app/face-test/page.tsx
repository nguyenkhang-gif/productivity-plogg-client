// import TestFace from "@/components/face/TestFace";
import ChatFrame from "@/components/face/chat/ChatFrame";
import React from "react";

const TestFacePage = () => {

  return (
    <main className="w-100 h-full">
      {/* bọc trong div fixed */}

      <div
        style={{
          position: "fixed",
          top: "80px", // cách mép dưới 20px
          right: "10px", // cách mép trái 20px
          // width: "500px", // giảm kích thước tổng thể
          // height: "400px", // giữ tỉ lệ khung)
          zIndex: 9999, // đảm bảo nổi trên cùng
        }}
      >
       
      </div>
      <ChatFrame />
      {/* <div
        style={{
          position: "fixed",
          bottom: "100px", // cách mép dưới 20px
          right: "-50px", // cách mép trái 20px
          width: "500px", // giảm kích thước tổng thể
          height: "400px", // giữ tỉ lệ khung
          pointerEvents: "none", // không chặn click phần tử khác (tuỳ nhu cầu)
          zIndex: 9999, // đảm bảo nổi trên cùng
        }}
      >
        <TestFace />
      </div> */}
    </main>
  );
};

export default TestFacePage;
