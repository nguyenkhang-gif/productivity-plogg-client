"use client";

import { useState } from "react";
import { Crown, Trash2, Shield } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { ColumnConfig } from "@/components/ui/data-table";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import UserAvatar from "@/components/ui/UserAvatar";
import MemberListDialogView from "./MemberListDialogView";
import AssignRoleDialog from "./AssignRoleDialog";
import { useToast } from "@/core/hooks/use-toast";
import { usePermissions } from "@/core/hooks/guild/usePermissions";
import { PERMISSIONS } from "@/core/config/permissions";
import {
  useGetMembers,
  useGetRoles,
  useKickMember,
  useAssignRole,
  useRemoveRole,
} from "@/core/services/client/guild";
import { GuildMember, Role } from "@/core/types/guild";

// role hiển thị = role position cao nhất, bỏ @everyone (isDefault)
const topRole = (roles: Role[]): Role | undefined =>
  roles.filter((r) => !r.isDefault).sort((a, b) => b.position - a.position)[0];

export default function MemberListDialog({ guildId }: { guildId: string }) {
  const ownerId = useSelector(
    (s: RootState) => s.guild.guilds.find((g) => g.id === guildId)?.ownerId,
  );
  const myId = useSelector((s: RootState) => s.user.profile?.id);
  const { toast } = useToast();
  const { can } = usePermissions(guildId);
  const canKick = can(PERMISSIONS.KICK_MEMBERS);
  const canManageRoles = can(PERMISSIONS.MANAGE_ROLES);

  const { data: members, isLoading } = useGetMembers(guildId);
  const { data: roles } = useGetRoles(guildId);
  const kick = useKickMember(guildId);
  const assign = useAssignRole(guildId);
  const removeRole = useRemoveRole(guildId);
  const list = members ?? [];
  const roleMap = new Map((roles ?? []).map((r) => [r.id, r]));

  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<GuildMember | null>(null);
  const [assignTarget, setAssignTarget] = useState<GuildMember | null>(null);

  const columns: ColumnConfig<GuildMember>[] = [
    {
      key: "username",
      header: "Thành viên",
      render: (m) => {
        const name = m.nickname ?? m.username;
        return (
          <div className="flex items-center gap-2.5">
            <UserAvatar name={name} src={m.avatar} size="sm" />
            <span className="truncate text-text-secondary">{name}</span>
            {m.userId === ownerId && (
              <span className="flex items-center gap-1 text-xs text-yellow-500">
                <Crown size={12} /> Chủ server
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "_role",
      header: "Vai trò",
      render: (m) => {
        const memberRoles = m.roleIds
          .map((id) => roleMap.get(id))
          .filter((r): r is Role => !!r);
        const role = topRole(memberRoles);
        if (!role) return null;
        return (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: `${role.color}22`, color: role.color }}
          >
            {role.name}
          </span>
        );
      },
    },
    {
      key: "joinedAt",
      header: "Tham gia",
      format: "date",
      align: "right",
      nowrap: true,
    },
  ];

  // cột actions gộp: gán role (MANAGE_ROLES) + kick (KICK_MEMBERS).
  // Không thao tác lên owner. Thứ bậc role do BE enforce (403).
  if (canManageRoles || canKick) {
    columns.push({
      key: "_actions",
      header: "",
      align: "center",
      nowrap: true,
      // co sát nội dung + siết padding ngang (! để override px-4 mặc định của table)
      className: "w-px !pl-2 !pr-3",
      render: (m) => {
        const isOwner = m.userId === ownerId;
        const showAssign = canManageRoles && !isOwner;
        const showKick = canKick && !isOwner && m.userId !== myId;
        if (!showAssign && !showKick) return null;
        return (
          <div className="flex items-center justify-center gap-1">
            {showAssign && (
              <button
                title="Thêm role"
                aria-label="Thêm role"
                // AssignRoleDialog là Radix Dialog → lồng được, không cần đóng member dialog
                onClick={() => setAssignTarget(m)}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
              >
                <Shield size={15} />
              </button>
            )}
            {showKick && (
              <button
                title="Kick khỏi server"
                aria-label="Kick khỏi server"
                onClick={() => {
                  setOpen(false);
                  setTarget(m);
                }}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-600/20 hover:text-red-400"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        );
      },
    });
  }

  return (
    <>
      <MemberListDialogView
        open={open}
        onOpenChange={setOpen}
        count={list.length}
        columns={columns}
        items={list}
        loading={isLoading}
      />

      {target && (
        <ConfirmDialog
          title="Kick thành viên?"
          subtitle={target.nickname ?? target.username}
          message="Thành viên sẽ bị xóa khỏi server. Có thể tham gia lại nếu được mời."
          confirmLabel="Kick"
          icon={Trash2}
          isLoading={kick.isPending}
          loadingLabel="Đang kick…"
          onConfirm={() =>
            kick.mutate(target.userId, {
              onSuccess: () => setTarget(null),
            })
          }
          onCancel={() => setTarget(null)}
        />
      )}

      {assignTarget && (
        <AssignRoleDialog
          // lấy bản live từ list để roleIds cập nhật sau khi gán (dialog mở tiếp)
          member={
            list.find((m) => m.userId === assignTarget.userId) ?? assignTarget
          }
          roles={roles ?? []}
          isPending={assign.isPending || removeRole.isPending}
          error={assign.isError}
          onAssign={(roleId) =>
            assign.mutate(
              { userId: assignTarget.userId, roleId },
              {
                onSuccess: () => {
                  assign.reset();
                  toast({
                    description: `Đã gán role "${roleMap.get(roleId)?.name ?? ""}"`,
                  });
                },
                onError: () =>
                  toast({
                    description: "Gán role thất bại",
                    variant: "destructive",
                  }),
              },
            )
          }
          onRemove={(roleId) =>
            removeRole.mutate(
              { userId: assignTarget.userId, roleId },
              {
                onSuccess: () =>
                  toast({
                    description: `Đã gỡ role "${roleMap.get(roleId)?.name ?? ""}"`,
                  }),
                onError: () =>
                  toast({
                    description: "Gỡ role thất bại",
                    variant: "destructive",
                  }),
              },
            )
          }
          onClose={() => {
            assign.reset();
            setAssignTarget(null);
          }}
        />
      )}
    </>
  );
}
