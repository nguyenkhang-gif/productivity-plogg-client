import React from "react";
import {
  CallControls,
  SpeakerLayout,
  StreamTheme,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import StreamProvider from "@/core/providers/stream-provider";

export default function Room() {
  return (
    <StreamProvider
      // apiKey="your-api-key" // Lấy từ Stream dashboard
      // userId="test-user" // ID test, tạm đặt
      // token="your-authentication-token" // BE tạo bằng API Secret
      // callId="test-room" // room ID
    >
      <StreamTheme>
        <SpeakerLayout />
        <CallControls />
      </StreamTheme>
    </StreamProvider>
  );
}
