"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { Shield } from "lucide-react";
import { GuildMember, Role } from "@/core/types/guild";

interface Props {
  member: GuildMember;
  roles: Role[];
  isPending: boolean;
  error?: boolean;
  onAssign: (roleId: string) => void;
  onRemove: (roleId: string) => void;
  onClose: () => void;
}

export default function AssignRoleDialog({
  member,
  roles,
  isPending,
  error,
  onAssign,
  onRemove,
  onClose,
}: Props) {
  // tất cả role gán được (non-default), sắp theo position giảm dần
  const options = roles
    .filter((r) => !r.isDefault)
    .sort((a, b) => b.position - a.position);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm border-border bg-card text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            Role — {member.nickname ?? member.username}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <p className="rounded-md bg-red-600/15 px-3 py-2 text-sm text-red-400">
            Không gán được role (có thể role cao hơn quyền của bạn).
          </p>
        )}

        {options.length === 0 ? (
          <EmptyState icon={Shield} title="Chưa có role nào" className="py-8" />
        ) : (
          <div className="flex flex-col gap-0.5 py-1">
            {options.map((r) => {
              const assigned = member.roleIds.includes(r.id);
              return (
                <label
                  key={r.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-surface"
                >
                  <Checkbox
                    checked={assigned}
                    disabled={isPending}
                    // tick → gán, bỏ tick → gỡ
                    onCheckedChange={(v) =>
                      v ? onAssign(r.id) : onRemove(r.id)
                    }
                  />
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="text-text-secondary">{r.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
