import { tokenProvider } from "@/actions/stream.action";
import { RootState } from "@/core/redux/store";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import React, { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY as string;
const userId = "testuser123";
const StreamProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const userInfo = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    if (!apiKey) return;

    const user = {
      id: userInfo._id,
      name:""
    };

    // Đảm bảo tokenProvider luôn trả về string
    const safeTokenProvider = async () => {
      const newuserId = userInfo._id??userId 
      const token = await tokenProvider(newuserId);
      if (!token) {
        throw new Error("Token not found");
      }
      return token;
    };

    const client = new StreamVideoClient({
      apiKey,
      user,
      tokenProvider: safeTokenProvider,
    });

    setVideoClient(client);

    return () => {
      client.disconnectUser?.();
    };
  }, []);

  if(!videoClient){
    return <div>Loading.....</div>
  }
  return videoClient ? (
    <StreamVideo client={videoClient}>{children}</StreamVideo>
  ) : null;
};

export default StreamProvider;
