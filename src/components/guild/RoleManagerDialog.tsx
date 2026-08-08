"use client";

import { useState } from "react";
import { Shield, Plus, ChevronLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import RoleEditor, { RolePayload } from "./RoleEditor";
import { useToast } from "@/core/hooks/use-toast";
import {
  useGetRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/core/services/client/guild";
import { Role } from "@/core/types/guild";

// undefined = màn list · null = tạo mới · Role = sửa role đó
type EditState = Role | null | undefined;

export default function RoleManagerDialog({ guildId }: { guildId: string }) {
  const { toast } = useToast();
  const { data: roles, isLoading } = useGetRoles(guildId);
  const create = useCreateRole(guildId);
  const update = useUpdateRole(guildId);
  const del = useDeleteRole(guildId);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EditState>(undefined);

  const list = [...(roles ?? [])].sort((a, b) => b.position - a.position);
  const backToList = () => setEditing(undefined);

  const handleSave = (body: RolePayload) => {
    if (editing === null) {
      create.mutate(body, {
        onSuccess: () => {
          toast({ description: `Đã tạo role "${body.name}"` });
          backToList();
        },
        onError: () =>
          toast({ description: "Tạo role thất bại", variant: "destructive" }),
      });
    } else if (editing) {
      update.mutate(
        { roleId: editing.id, body },
        {
          onSuccess: () => {
            toast({ description: `Đã cập nhật role "${body.name}"` });
            backToList();
          },
          onError: () =>
            toast({ description: "Cập nhật role thất bại", variant: "destructive" }),
        },
      );
    }
  };

  const handleDelete = () => {
    if (!editing) return;
    del.mutate(editing.id, {
      onSuccess: () => {
        toast({ description: `Đã xóa role "${editing.name}"` });
        backToList();
      },
      onError: () =>
        toast({ description: "Xóa role thất bại", variant: "destructive" }),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setEditing(undefined);
      }}
    >
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
          <Shield size={15} /> Quản lý role
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md border-border bg-card text-text-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-primary">
            {editing !== undefined && (
              <button
                onClick={backToList}
                className="text-text-muted hover:text-text-primary"
                aria-label="Quay lại"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {editing === undefined
              ? "Quản lý role"
              : editing === null
                ? "Tạo role"
                : `Sửa role`}
          </DialogTitle>
        </DialogHeader>

        {editing !== undefined ? (
          <RoleEditor
            role={editing}
            saving={create.isPending || update.isPending}
            deleting={del.isPending}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={backToList}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setEditing(null)}
              className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-text-secondary hover:border-accent hover:text-text-primary"
            >
              <Plus size={16} /> Tạo role mới
            </button>

            <div className="max-h-[50vh] overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="flex flex-col gap-1.5 py-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 animate-pulse rounded-md bg-surface" />
                  ))}
                </div>
              ) : list.length === 0 ? (
                <EmptyState icon={Shield} title="Chưa có role nào" className="py-8" />
              ) : (
                <div className="flex flex-col gap-0.5">
                  {list.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setEditing(r)}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-surface"
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: r.color }}
                      />
                      <span className="flex-1 truncate text-text-secondary">
                        {r.name}
                      </span>
                      {r.isDefault && (
                        <span className="shrink-0 text-xs text-text-muted">
                          mặc định
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
