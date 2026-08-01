"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateGuild } from "@/core/services/client/guild";

export default function CreateGuildDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const createGuild = useCreateGuild();

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    createGuild.mutate(
      { name: n, icon: icon.trim() || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setIcon("");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          title="Tạo server"
          aria-label="Tạo server"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-emerald-400 transition-all hover:rounded-xl hover:bg-emerald-500 hover:text-white"
        >
          <Plus size={22} />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-sm border-border bg-card text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Tạo server mới</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <label className="text-xs font-medium text-text-muted">
            Tên server
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
              placeholder="Ví dụ: My Server"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </label>

          <label className="text-xs font-medium text-text-muted">
            Icon (emoji, tùy chọn)
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={8}
              placeholder="🚀"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </label>

          {createGuild.isError && (
            <p className="text-xs text-red-400">
              Không tạo được server. Thử lại nhé.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={submit}
            disabled={!name.trim() || createGuild.isPending}
            className="bg-accent text-white hover:bg-blue-500"
          >
            {createGuild.isPending ? "Đang tạo…" : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
