import GuildRail from "@/components/guild/GuildRail";

export default function GuildsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <GuildRail />
      <div className="flex flex-1 min-w-0 min-h-0">{children}</div>
    </div>
  );
}