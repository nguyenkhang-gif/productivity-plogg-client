"use client";

import { useRouter } from "next/navigation";
import { Loader2, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/core/hooks/use-toast";
import { useGetInvite, useJoinInvite } from "@/core/services/client/invite";

export default function InvitePreview({ code }: { code: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data, isLoading, isError } = useGetInvite(code);
  const join = useJoinInvite();

  const handleJoin = () =>
    join.mutate(code, {
      onSuccess: ({ guildId }) => router.push(`/guilds/${guildId}`),
      onError: () =>
        toast({ description: "Tham gia thất bại", variant: "destructive" }),
    });

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-text-muted">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Đang tải lời mời…</span>
          </div>
        ) : isError || !data ? (
          <EmptyState
            icon={LinkIcon}
            title="Link mời không hợp lệ"
            description="Link đã hết hạn hoặc không tồn tại."
            className="py-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/guilds")}
              className="mt-2"
            >
              Về trang server
            </Button>
          </EmptyState>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-3xl">
              {data.guild.icon || data.guild.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Bạn được mời tham gia
            </p>
            <h1 className="text-xl font-semibold text-text-primary">
              {data.guild.name}
            </h1>
            <p className="text-sm text-text-muted">
              {data.guild.memberCount.toLocaleString("vi-VN")} thành viên
            </p>
            <div className="mt-2 flex w-full gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push("/guilds")}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleJoin}
                disabled={join.isPending}
                className="flex-1 bg-accent text-white hover:bg-blue-500"
              >
                {join.isPending ? "Đang vào…" : "Tham gia"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
