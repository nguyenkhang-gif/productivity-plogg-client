"use client";

import { useState } from "react";
import { Settings, Trash2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
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
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RoleManagerDialog from "./RoleManagerDialog";
import { usePermissions } from "@/core/hooks/guild/usePermissions";
import { PERMISSIONS } from "@/core/config/permissions";
import {
  useUpdateGuild,
  useDeleteGuild,
  useLeaveGuild,
} from "@/core/services/client/guild";

export default function GuildActions({ guildId }: { guildId: string }) {
  const router = useRouter();
  const guild = useSelector((s: RootState) =>
    s.guild.guilds.find((g) => g.id === guildId),
  );
  const myId = useSelector((s: RootState) => s.user.profile?.id);
  const { can } = usePermissions(guildId);

  const canManageGuild = can(PERMISSIONS.MANAGE_GUILD);
  const canManageRoles = can(PERMISSIONS.MANAGE_ROLES);
  const isOwner = !!myId && guild?.ownerId === myId;

  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [name, setName] = useState(guild?.name ?? "");
  const [icon, setIcon] = useState(guild?.icon ?? "");

  const updateGuild = useUpdateGuild();
  const deleteGuild = useDeleteGuild();
  const leaveGuild = useLeaveGuild();
  // gear luôn hiện cho mọi member (tối thiểu để "Rời server")

  const openDialog = () => {
    setName(guild?.name ?? "");
    setIcon(guild?.icon ?? "");
    setOpen(true);
  };

  const submitEdit = () => {
    const n = name.trim();
    if (!n) return;
    updateGuild.mutate(
      { id: guildId, body: { name: n, icon: icon.trim() || undefined } },
      { onSuccess: () => setOpen(false) },
    );
  };

  const inputCls =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            onClick={openDialog}
            title="Cài đặt server"
            aria-label="Cài đặt server"
            className="p-1 text-text-muted transition-colors hover:text-text-primary"
          >
            <Settings size={15} />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-sm border-border bg-card text-text-primary">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Cài đặt server</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            {canManageGuild ? (
              <>
                <label className="text-xs font-medium text-text-muted">
                  Tên server
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
                <label className="text-xs font-medium text-text-muted">
                  Icon (emoji)
                  <input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    maxLength={8}
                    placeholder="🚀"
                    className={inputCls}
                  />
                </label>
              </>
            ) : (
              <p className="text-sm text-text-muted">
                Bạn không có quyền sửa thông tin server.
              </p>
            )}

            {/* quản lý role */}
            {canManageRoles && (
              <div className="mt-1 border-t border-border pt-3">
                <RoleManagerDialog guildId={guildId} />
              </div>
            )}

            {/* vùng nguy hiểm */}
            <div className="mt-2 border-t border-border pt-3">
              {isOwner ? (
                // owner không rời được — phải xóa server
                <button
                  onClick={() => {
                    setOpen(false); // đóng settings để ConfirmDialog không bị Radix overlay chặn
                    setConfirming(true);
                  }}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                >
                  <Trash2 size={15} /> Xóa server
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    setLeaving(true);
                  }}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                >
                  <LogOut size={15} /> Rời server
                </button>
              )}
            </div>
          </div>

          {canManageGuild && (
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={submitEdit}
                disabled={!name.trim() || updateGuild.isPending}
                className="bg-accent text-white hover:bg-blue-500"
              >
                {updateGuild.isPending ? "Đang lưu…" : "Lưu"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {confirming && (
        <ConfirmDialog
          title="Xóa server?"
          subtitle={guild?.name}
          message="Toàn bộ channel và tin nhắn sẽ bị xóa vĩnh viễn. Không thể hoàn tác."
          confirmLabel="Xóa server"
          icon={Trash2}
          isLoading={deleteGuild.isPending}
          loadingLabel="Đang xóa…"
          onConfirm={() =>
            deleteGuild.mutate(guildId, {
              onSuccess: () => {
                setConfirming(false);
                setOpen(false);
                router.push("/guilds"); // rời guild đã xóa
              },
            })
          }
          onCancel={() => setConfirming(false)}
        />
      )}

      {leaving && (
        <ConfirmDialog
          title="Rời server?"
          subtitle={guild?.name}
          message="Bạn sẽ không còn thấy channel và tin nhắn của server này. Có thể tham gia lại sau nếu được mời."
          confirmLabel="Rời server"
          icon={LogOut}
          isLoading={leaveGuild.isPending}
          loadingLabel="Đang rời…"
          onConfirm={() =>
            leaveGuild.mutate(guildId, {
              onSuccess: () => {
                setLeaving(false);
                setOpen(false);
                router.push("/guilds");
              },
            })
          }
          onCancel={() => setLeaving(false)}
        />
      )}
    </>
  );
}
