"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash } from "lucide-react";
import {
  useGetChannels,
  useGetGuildDetail,
} from "@/core/services/client/guild";
import { Channel } from "@/core/types/guild";
import { styles } from "@/core/config/styles";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { usePermissions } from "@/core/hooks/guild/usePermissions";
import { PERMISSIONS } from "@/core/config/permissions";
import CreateChannelDialog from "./CreateChannelDialog";
import ChannelActions from "./ChannelActions";

export default function ChannelSidebar({ guildId }: { guildId: string }) {
  const { data: channels, isLoading } = useGetChannels(guildId);
  useGetGuildDetail(guildId); // nạp guild detail (myPermissions) vào Redux khi mở guild
  const pathname = usePathname();
  const guild = useSelector((s: RootState) =>
    s.guild.guilds.find((g) => g.id === guildId),
  );
  const { can } = usePermissions(guildId);
  const canManageChannels = can(PERMISSIONS.MANAGE_CHANNELS);

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
  // sort theo position; tiebreaker createdAt cho ổn định khi position trùng
  const byPos = (a: Channel, b: Channel) =>
    a.position - b.position || a.createdAt.localeCompare(b.createdAt);

  // Categories (channel cha) + text channels chưa có category
  const categories = list.filter((c) => c.type === "CATEGORY").sort(byPos);
  const textChannels = list.filter((c) => c.type === "TEXT");
  const uncategorized = textChannels.filter((c) => !c.parentId).sort(byPos);
  const childrenOf = (catId: string) =>
    textChannels.filter((c) => c.parentId === catId).sort(byPos);

  const ChannelLink = ({ ch }: { ch: Channel }) => {
    const active = pathname === `/guilds/${guildId}/${ch.id}`;
    return (
      <div
        className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors
          ${
            active
              ? "bg-accent-subtle text-text-primary"
              : "text-text-muted hover:bg-surface hover:text-text-secondary"
          }`}
      >
        <Link
          href={`/guilds/${guildId}/${ch.id}`}
          title={ch.name}
          className="flex min-w-0 flex-1 items-center gap-1.5"
        >
          <Hash size={16} className="shrink-0" />
          <span className="truncate">{ch.name}</span>
        </Link>
        {canManageChannels && ch.type === "TEXT" && (
          <ChannelActions guildId={guildId} channel={ch} />
        )}
      </div>
    );
  };

  return (
    <aside className="w-60 shrink-0 bg-card border-r border-border flex flex-col py-3">
      <div className="px-3 py-3 border-b border-border flex items-center gap-2 shrink-0">
        <span className="text-lg">{guild?.icon}</span>
        <h2 className="font-semibold text-text-primary truncate">
          {guild?.name ?? "…"}
        </h2>
        {canManageChannels && (
          <span className="ml-auto shrink-0">
            <CreateChannelDialog guildId={guildId} />
          </span>
        )}
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
