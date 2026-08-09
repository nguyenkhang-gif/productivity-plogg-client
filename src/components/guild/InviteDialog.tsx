"use client";

import { useState } from "react";
import { UserPlus, Copy, Check, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/core/hooks/use-toast";
import { useCreateInvite } from "@/core/services/client/invite";

export default function InviteDialog({ guildId }: { guildId: string }) {
  const { toast } = useToast();
  const create = useCreateInvite(guildId);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const link =
    code && typeof window !== "undefined"
      ? `${window.location.origin}/invite/${code}`
      : "";

  const generate = () =>
    create.mutate(undefined, {
      onSuccess: (data) => setCode(data.code),
      onError: () =>
        toast({ description: "Tạo link mời thất bại", variant: "destructive" }),
    });

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ description: "Đã copy link mời" });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setCode(null); // reset khi đóng
      }}
    >
      <DialogTrigger asChild>
        <button
          title="Mời thành viên"
          aria-label="Mời thành viên"
          className="p-1 text-text-muted transition-colors hover:text-text-primary"
        >
          <UserPlus size={15} />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-sm border-border bg-card text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Mời thành viên</DialogTitle>
        </DialogHeader>

        {code ? (
          <div className="flex flex-col gap-3 py-1">
            <p className="text-sm text-text-muted">
              Chia sẻ link này để mời người khác vào server:
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={link}
                onFocus={(e) => e.target.select()}
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
              <Button
                onClick={copy}
                className="shrink-0 bg-accent text-white hover:bg-blue-500"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </Button>
            </div>
            <button
              onClick={generate}
              disabled={create.isPending}
              className="self-start text-xs text-text-muted hover:text-text-primary disabled:opacity-50"
            >
              {create.isPending ? "Đang tạo…" : "Tạo link mới"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <Link2 size={28} className="text-text-muted opacity-60" />
            <p className="text-center text-sm text-text-muted">
              Tạo một link mời để chia sẻ với người bạn muốn thêm vào server.
            </p>
            <Button
              onClick={generate}
              disabled={create.isPending}
              className="bg-accent text-white hover:bg-blue-500"
            >
              {create.isPending ? "Đang tạo…" : "Tạo link mời"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
