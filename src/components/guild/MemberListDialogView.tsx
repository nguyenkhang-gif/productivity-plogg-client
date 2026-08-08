"use client";

import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppDataTable, ColumnConfig } from "@/components/ui/data-table";
import { GuildMember } from "@/core/types/guild";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  columns: ColumnConfig<GuildMember>[];
  items: GuildMember[];
  loading: boolean;
}

export default function MemberListDialogView({
  open,
  onOpenChange,
  count,
  columns,
  items,
  loading,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          title="Thành viên"
          aria-label="Thành viên"
          className="p-1 text-text-muted transition-colors hover:text-text-primary"
        >
          <Users size={15} />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[80vw] border-border bg-card text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            Thành viên — {count}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
          <AppDataTable<GuildMember>
            columns={columns}
            items={items}
            loading={loading}
            rowKey={(m) => m.userId}
            dense
            emptyMessage="Chưa có thành viên nào."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
