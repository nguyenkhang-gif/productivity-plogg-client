"use client";

import { usePathname } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useGetChannels,
  useGetGuildDetail,
  useReorderChannels,
} from "@/core/services/client/guild";
import { Channel } from "@/core/types/guild";
import { styles } from "@/core/config/styles";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { usePermissions } from "@/core/hooks/guild/usePermissions";
import { PERMISSIONS } from "@/core/config/permissions";
import CreateChannelDialog from "./CreateChannelDialog";
import GuildActions from "./GuildActions";
import MemberListDialog from "./MemberListDialog";
import SortableChannelLink from "./SortableChannelLink";

export default function ChannelSidebar({ guildId }: { guildId: string }) {
  const { data: channels, isLoading } = useGetChannels(guildId);
  useGetGuildDetail(guildId); // nạp guild detail (myPermissions) vào Redux khi mở guild
  const pathname = usePathname();
  const guild = useSelector((s: RootState) =>
    s.guild.guilds.find((g) => g.id === guildId),
  );
  const { can } = usePermissions(guildId);
  const canManageChannels = can(PERMISSIONS.MANAGE_CHANNELS);
  const reorder = useReorderChannels(guildId);

  // click phải kéo >5px mới tính drag → không phá click điều hướng
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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
  // sort theo position; tiebreaker createdAt cho ổn định khi position trùng
  const byPos = (a: Channel, b: Channel) =>
    a.position - b.position || a.createdAt.localeCompare(b.createdAt);

  // Categories (channel cha) + text channels chưa có category
  const categories = list.filter((c) => c.type === "CATEGORY").sort(byPos);
  const textChannels = list.filter((c) => c.type === "TEXT");
  const uncategorized = textChannels.filter((c) => !c.parentId).sort(byPos);
  const childrenOf = (catId: string) =>
    textChannels.filter((c) => c.parentId === catId).sort(byPos);

  // orderedIds ĐẦY ĐỦ (BE yêu cầu toàn bộ channel guild): uncategorized rồi từng category + con
  const buildFullOrder = (
    uncat: Channel[],
    childrenByCat: Record<string, Channel[]>,
  ): string[] => [
    ...uncat.map((c) => c.id),
    ...categories.flatMap((cat) => [
      cat.id,
      ...(childrenByCat[cat.id] ?? childrenOf(cat.id)).map((c) => c.id),
    ]),
  ];

  // chỉ cho reorder TRONG cùng 1 group (uncategorized hoặc con của 1 category)
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const groupOf = (id: string): Channel[] | null => {
      if (uncategorized.some((c) => c.id === id)) return uncategorized;
      for (const cat of categories) {
        const kids = childrenOf(cat.id);
        if (kids.some((c) => c.id === id)) return kids;
      }
      return null;
    };

    const group = groupOf(activeId);
    // over phải cùng group với active, không thì bỏ qua
    if (!group || !group.some((c) => c.id === overId)) return;

    const from = group.findIndex((c) => c.id === activeId);
    const to = group.findIndex((c) => c.id === overId);
    const newGroup = arrayMove(group, from, to);

    // thay group cũ bằng group mới khi dựng lại full order
    const isUncat = group === uncategorized;
    const childrenByCat: Record<string, Channel[]> = {};
    for (const cat of categories) {
      const kids = childrenOf(cat.id);
      childrenByCat[cat.id] = kids === group ? newGroup : kids;
    }
    const orderedIds = buildFullOrder(
      isUncat ? newGroup : uncategorized,
      childrenByCat,
    );
    reorder.mutate(orderedIds);
  };

  const renderLink = (ch: Channel) => (
    <SortableChannelLink
      key={ch.id}
      guildId={guildId}
      channel={ch}
      active={pathname === `/guilds/${guildId}/${ch.id}`}
      canManage={canManageChannels}
    />
  );

  return (
    <aside className="w-60 shrink-0 bg-card border-r border-border flex flex-col py-3">
      <div className="px-3 py-3 border-b border-border flex items-center gap-2 shrink-0">
        <span className="text-lg">{guild?.icon}</span>
        <h2 className="font-semibold text-text-primary truncate">
          {guild?.name ?? "…"}
        </h2>
        <span className="ml-auto flex shrink-0 items-center">
          <MemberListDialog guildId={guildId} />
          <GuildActions guildId={guildId} />
          {canManageChannels && <CreateChannelDialog guildId={guildId} />}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin py-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* text channel không thuộc category */}
          {uncategorized.length > 0 && (
            <div className="px-2 flex flex-col gap-0.5 mb-2">
              <SortableContext
                items={uncategorized.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {uncategorized.map(renderLink)}
              </SortableContext>
            </div>
          )}

          {/* các category + channel con */}
          {categories.map((cat) => {
            const kids = childrenOf(cat.id);
            return (
              <div key={cat.id} className="px-2 mb-2">
                <p className="px-1 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  {cat.name}
                </p>
                <div className="flex flex-col gap-0.5">
                  <SortableContext
                    items={kids.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {kids.map(renderLink)}
                  </SortableContext>
                </div>
              </div>
            );
          })}
        </DndContext>

        {list.length === 0 && (
          <p className={`${styles.muted} text-sm text-center px-3 mt-4`}>
            Chưa có channel nào.
          </p>
        )}
      </div>
    </aside>
  );
}
