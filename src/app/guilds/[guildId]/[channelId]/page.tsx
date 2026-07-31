import ChatPane from "@/components/guild/ChatPane";
import React from "react";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ guildId: string; channelId: string }>;
}) {
  const { guildId, channelId } = await params;
  return <ChatPane guildId={guildId} channelId={channelId} />;
}
