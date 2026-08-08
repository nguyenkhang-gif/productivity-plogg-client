"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PermissionCheckboxList from "./PermissionCheckboxList";
import { permsToFlags, flagsToPerms } from "@/core/config/permissions";
import { Role } from "@/core/types/guild";

export interface RolePayload {
  name: string;
  color: string;
  position?: number;
  permissions: string;
}

interface Props {
  role: Role | null; // null = tạo mới
  saving: boolean;
  deleting?: boolean;
  onSave: (body: RolePayload) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const inputCls =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none";

export default function RoleEditor({
  role,
  saving,
  deleting,
  onSave,
  onDelete,
  onCancel,
}: Props) {
  const [name, setName] = useState(role?.name ?? "");
  const [color, setColor] = useState(role?.color ?? "#99aab5");
  const [position, setPosition] = useState<string>(
    role?.position != null ? String(role.position) : "",
  );
  const [flags, setFlags] = useState<bigint[]>(
    permsToFlags(role?.permissions ?? "0"),
  );

  const isDefault = !!role?.isDefault;

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    onSave({
      name: n,
      color,
      position: position === "" ? undefined : Number(position),
      permissions: flagsToPerms(flags),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-3">
        <label className="flex-1 text-xs font-medium text-text-muted">
          Tên role
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            disabled={isDefault} // @everyone không đổi tên
            autoFocus
            className={inputCls}
          />
        </label>
        <div className="flex flex-col text-xs font-medium text-text-muted">
          Màu
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Chọn màu"
              className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-1"
            />
            <input
              value={color}
              onChange={(e) => {
                let v = e.target.value.trim();
                if (v && !v.startsWith("#")) v = `#${v}`;
                setColor(v);
              }}
              maxLength={7}
              placeholder="#99aab5"
              aria-label="Mã màu hex"
              className="w-24 rounded-lg border border-border bg-surface px-2 py-2 font-mono text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      <label className="text-xs font-medium text-text-muted">
        Thứ tự (position — cao hơn = quyền lực hơn)
        <input
          type="number"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="tự động"
          disabled={isDefault} // @everyone luôn 0
          className={inputCls}
        />
      </label>

      <div>
        <p className="mb-1 text-xs font-medium text-text-muted">Quyền hạn</p>
        <PermissionCheckboxList value={flags} onChange={setFlags} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        {role && onDelete && !isDefault && (
          <button
            onClick={onDelete}
            disabled={deleting}
            className="mr-auto flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            <Trash2 size={15} /> {deleting ? "Đang xóa…" : "Xóa role"}
          </button>
        )}
        {isDefault && (
          <span className="mr-auto text-xs text-text-muted">
            @everyone — không xóa được
          </span>
        )}
        <Button variant="ghost" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          onClick={submit}
          disabled={!name.trim() || saving}
          className="bg-accent text-white hover:bg-blue-500"
        >
          {saving ? "Đang lưu…" : "Lưu"}
        </Button>
      </div>
    </div>
  );
}
