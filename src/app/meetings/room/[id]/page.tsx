"use client";
import React, { useEffect, useState } from "react";
import { use } from "react"; // React 19+
import { useGetCallById } from "@/core/hooks/meetings/useGetCallById";
import {
  Call,
  StreamCall,
  StreamTheme,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import MeetingSetUp from "@/components/meetings/MeetingSetUp";
import MeetingRoom from "@/components/meetings/MeetingRoom";
import '@stream-io/video-react-sdk/dist/css/styles.css'
export default function RoomDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const client = useStreamVideoClient();

  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [callDetails, setCallDetails] = useState<Call>();

  // unwrap params once
  useEffect(() => {
    let mounted = true;
    params.then(({ id }) => {
      if (mounted) setCurrentCallId(id);
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  const { call, isCallLoading } = useGetCallById(currentCallId || "");

  // save call into state when loaded
  useEffect(() => {
    if (call && !isCallLoading) {
      setCallDetails(call);
    }
  }, [call, isCallLoading]);

  const createMeeting = () => {
    if (!client) return;
    try {
      const id = crypto.randomUUID();
      const newCall = client.call("default", id);

      const startAt = values.dateTime.toISOString();
      const description = values.description || "instant meet";

      newCall.getOrCreate({
        data: {
          starts_at: startAt,
          custom: { description },
        },
      });

      if (newCall.id !== currentCallId) {
        router.replace(`/meetings/room/${newCall.id}`);
      }

      setCallDetails(newCall);
    } catch (e) {
      console.error("Error creating meeting", e);
    }
  };

  if (isCallLoading || !call) {
    return <div>Loading...</div>;
  }

  return (
    <main className="h-full w-full">
      <button onClick={createMeeting}>JoinCall</button>
      {callDetails && (
        <StreamCall call={callDetails}>
          <StreamTheme>
            {!isSetupComplete ? (
              <MeetingSetUp setIsSetupComplete={setIsSetupComplete} />
            ) : (
              <MeetingRoom />
            )}
          </StreamTheme>
        </StreamCall>
      )}
    </main>
  );
}
