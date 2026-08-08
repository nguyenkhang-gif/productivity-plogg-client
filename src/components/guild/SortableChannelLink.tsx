"use client";

import Link from "next/link";
import { Hash, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Channel } from "@/core/types/guild";
import ChannelActions from "./ChannelActions";

interface Props {
  guildId: string;
  channel: Channel;
  active: boolean;
  canManage: boolean;
}

export default function SortableChannelLink({
  guildId,
  channel,
  active,
  canManage,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: channel.id, disabled: !canManage });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors
        ${
          active
            ? "bg-accent-subtle text-text-primary"
            : "text-text-muted hover:bg-surface hover:text-text-secondary"
        }`}
    >
      {canManage && (
        <button
          {...attributes}
          {...listeners}
          title="Kéo để sắp xếp"
          aria-label="Kéo để sắp xếp"
          className="cursor-grab touch-none text-text-muted opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </button>
      )}
      <Link
        href={`/guilds/${guildId}/${channel.id}`}
        title={channel.name}
        className="flex min-w-0 flex-1 items-center gap-1.5"
      >
        <Hash size={16} className="shrink-0" />
        <span className="truncate">{channel.name}</span>
      </Link>
      {canManage && channel.type === "TEXT" && (
        <ChannelActions guildId={guildId} channel={channel} />
      )}
    </div>
  );
}
