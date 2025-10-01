"use client";
import { VideoPreview, useCall } from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

const MeetingSetUp = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const call = useCall();

  useEffect(() => {
    if (isMicOn) {
      call?.microphone.enable();
    } else {
      call?.microphone.disable();
    }
  }, [isMicOn, call?.microphone]);

  useEffect(() => {
    if (isCamOn) {
      call?.camera.enable();
    } else {
      call?.camera.disable();
    }
  }, [isCamOn, call?.camera]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-2xl font-bold">Set up</h1>
      <VideoPreview />

      <div className="flex gap-4 mt-4">
        {/* Mic Toggle */}
        <Button
          size="icon"
          className={`border-none ${isMicOn ? "bg-green-500" : "bg-red-500"}`}
          onClick={() => setIsMicOn((prev) => !prev)}
        >
          {isMicOn ? (
            <Mic className="h-5 w-5" />
          ) : (
            <MicOff className="h-5 w-5" />
          )}
        </Button>

        {/* Camera Toggle */}
        <Button
          size="icon"
          className={`border-none ${isCamOn ? "bg-green-500" : "bg-red-500"}`}
          onClick={() => setIsCamOn((prev) => !prev)}
        >
          {isCamOn ? (
            <Video className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5" />
          )}
        </Button>
        <Button
          className="rounded-md bg-green-500 px-4 py-2.5"
          onClick={() => {
            call?.join();
            setIsSetupComplete(true);
          }}
        >
          Join meeting
        </Button>
      </div>
    </div>
  );
};

export default MeetingSetUp;
