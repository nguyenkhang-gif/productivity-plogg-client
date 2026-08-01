"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash } from "lucide-react";
import { useGetChannels } from "@/core/services/client/guild";
import { Channel } from "@/core/types/guild";
import { styles } from "@/core/config/styles";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";

export default function ChannelSidebar({ guildId }: { guildId: string }) {
  const { data: channels, isLoading } = useGetChannels(guildId);
  const pathname = usePathname();
  const guild = useSelector((s: RootState) =>
    s.guild.guilds.find((g) => g.id === guildId),
  );

  if (isLoading) {
    return (
      <aside className="w-60 shrink-0 bg-card border-r border-border p-3 flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 rounded-md bg-surface animate-pulse" />
        ))}
      </aside>
    );
  }

  const list = channels ?? [];
  // Categories (channel cha) + text channels chưa có category
  const categories = list
    .filter((c) => c.type === "CATEGORY")
    .sort((a, b) => a.position - b.position);
  const textChannels = list.filter((c) => c.type === "TEXT");
  const uncategorized = textChannels
    .filter((c) => !c.parentId)
    .sort((a, b) => a.position - b.position);
  const childrenOf = (catId: string) =>
    textChannels
      .filter((c) => c.parentId === catId)
      .sort((a, b) => a.position - b.position);

  const ChannelLink = ({ ch }: { ch: Channel }) => {
    const active = pathname === `/guilds/${guildId}/${ch.id}`;
    return (
      <Link
        href={`/guilds/${guildId}/${ch.id}`}
        title={ch.name}
        className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors
          ${
            active
              ? "bg-accent-subtle text-text-primary"
              : "text-text-muted hover:bg-surface hover:text-text-secondary"
          }`}
      >
        <Hash size={16} className="shrink-0" />
        <span className="truncate">{ch.name}</span>
      </Link>
    );
  };

  return (
    <aside className="w-60 shrink-0 bg-card border-r border-border flex flex-col py-3">
      <div className="px-3 py-3 border-b border-border flex items-center gap-2 shrink-0">
        <span className="text-lg">{guild?.icon}</span>
        <h2 className="font-semibold text-text-primary truncate">
          {guild?.name ?? "…"}
        </h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin py-3">
        {/* text channel không thuộc category */}
        {uncategorized.length > 0 && (
          <div className="px-2 flex flex-col gap-0.5 mb-2">
            {uncategorized.map((ch) => (
              <ChannelLink key={ch.id} ch={ch} />
            ))}
          </div>
        )}

        {/* các category + channel con */}
        {categories.map((cat) => (
          <div key={cat.id} className="px-2 mb-2">
            <p className="px-1 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {cat.name}
            </p>
            <div className="flex flex-col gap-0.5">
              {childrenOf(cat.id).map((ch) => (
                <ChannelLink key={ch.id} ch={ch} />
              ))}
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <p className={`${styles.muted} text-sm text-center px-3 mt-4`}>
            Chưa có channel nào.
          </p>
        )}
      </div>
    </aside>
  );
}
