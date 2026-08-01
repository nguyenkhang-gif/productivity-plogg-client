"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Channel } from "@/core/types/guild";
import {
  useUpdateChannel,
  useDeleteChannel,
} from "@/core/services/client/guild";

export default function ChannelActions({
  guildId,
  channel,
}: {
  guildId: string;
  channel: Channel;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState(channel.name);
  const [topic, setTopic] = useState(channel.topic ?? "");

  const updateChannel = useUpdateChannel(guildId);
  const deleteChannel = useDeleteChannel(guildId);

  const openEdit = () => {
    setName(channel.name);
    setTopic(channel.topic ?? "");
    setEditing(true);
  };

  const submitEdit = () => {
    const n = name.trim();
    if (!n) return;
    updateChannel.mutate(
      { channelId: channel.id, body: { name: n, topic: topic.trim() } },
      { onSuccess: () => setEditing(false) },
    );
  };

  const inputCls =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none";

  return (
    <>
      {/* nút hover */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.preventDefault();
            openEdit();
          }}
          title="Sửa channel"
          className="p-0.5 text-text-muted hover:text-text-primary"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setConfirming(true);
          }}
          title="Xóa channel"
          className="p-0.5 text-text-muted hover:text-red-400"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* dialog sửa */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-sm border-border bg-card text-text-primary">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Sửa channel</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <label className="text-xs font-medium text-text-muted">
              Tên channel
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitEdit();
                }}
                className={inputCls}
              />
            </label>
            {channel.type === "TEXT" && (
              <label className="text-xs font-medium text-text-muted">
                Chủ đề
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={1024}
                  placeholder="Mô tả ngắn"
                  className={inputCls}
                />
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Hủy
            </Button>
            <Button
              onClick={submitEdit}
              disabled={!name.trim() || updateChannel.isPending}
              className="bg-accent text-white hover:bg-blue-500"
            >
              {updateChannel.isPending ? "Đang lưu…" : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* xác nhận xóa */}
      {confirming && (
        <ConfirmDialog
          title="Xóa channel?"
          subtitle={`#${channel.name}`}
          message="Toàn bộ tin nhắn trong channel sẽ bị xóa. Không thể hoàn tác."
          confirmLabel="Xóa"
          icon={Trash2}
          isLoading={deleteChannel.isPending}
          loadingLabel="Đang xóa…"
          onConfirm={() =>
            deleteChannel.mutate(channel.id, {
              onSuccess: () => setConfirming(false),
            })
          }
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
