"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateChannel } from "@/core/services/client/guild";

export default function CreateChannelDialog({ guildId }: { guildId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"TEXT" | "CATEGORY">("TEXT");
  const [parentId, setParentId] = useState("");
  const [topic, setTopic] = useState("");
  const createChannel = useCreateChannel(guildId);

  // category để chọn làm cha (chỉ khi tạo TEXT channel)
  const categories = useSelector((s: RootState) =>
    (s.guild.channelsByGuild[guildId] ?? []).filter((c) => c.type === "CATEGORY"),
  );

  const reset = () => {
    setName("");
    setType("TEXT");
    setParentId("");
    setTopic("");
  };

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    createChannel.mutate(
      {
        name: n,
        type,
        parentId: type === "TEXT" && parentId ? parentId : undefined,
        topic: topic.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      },
    );
  };

  const inputCls =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          title="Tạo channel"
          aria-label="Tạo channel"
          className="p-1 text-text-muted transition-colors hover:text-text-primary"
        >
          <Plus size={16} />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-sm border-border bg-card text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Tạo channel</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {/* type */}
          <div className="flex gap-2">
            {(["TEXT", "CATEGORY"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  type === t
                    ? "border-accent bg-accent-subtle text-text-primary"
                    : "border-border text-text-muted hover:text-text-secondary"
                }`}
              >
                {t === "TEXT" ? "Text channel" : "Category"}
              </button>
            ))}
          </div>

          <label className="text-xs font-medium text-text-muted">
            Tên channel
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
              placeholder={type === "TEXT" ? "general" : "TÊN NHÓM"}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              className={inputCls}
            />
          </label>

          {/* parent category — chỉ cho TEXT và khi có category */}
          {type === "TEXT" && categories.length > 0 && (
            <label className="text-xs font-medium text-text-muted">
              Nhóm (tùy chọn)
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className={inputCls}
              >
                <option value="">— Không —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* topic — chỉ TEXT */}
          {type === "TEXT" && (
            <label className="text-xs font-medium text-text-muted">
              Chủ đề (tùy chọn)
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={1024}
                placeholder="Mô tả ngắn về channel"
                className={inputCls}
              />
            </label>
          )}

          {createChannel.isError && (
            <p className="text-xs text-red-400">
              Không tạo được channel. Thử lại nhé.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={submit}
            disabled={!name.trim() || createChannel.isPending}
            className="bg-accent text-white hover:bg-blue-500"
          >
            {createChannel.isPending ? "Đang tạo…" : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
