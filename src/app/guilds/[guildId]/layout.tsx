import ChannelSidebar from "@/components/guild/ChannelSideBar";
import React from "react";

export default async function GuildLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  return (
    <>
      <ChannelSidebar guildId={guildId} />
      <div className="flex flex-1 min-w-0 min-h-0 flex-col">{children}</div>
    </>
  );
}
