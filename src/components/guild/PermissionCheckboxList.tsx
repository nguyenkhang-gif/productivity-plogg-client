"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { PERMISSION_LIST, PERMISSIONS } from "@/core/config/permissions";

interface Props {
  /** flag đang bật */
  value: bigint[];
  disabled?: boolean;
  onChange: (flags: bigint[]) => void;
}

export default function PermissionCheckboxList({
  value,
  disabled,
  onChange,
}: Props) {
  const isAdmin = value.includes(PERMISSIONS.ADMINISTRATOR);

  const toggle = (flag: bigint, checked: boolean) => {
    const next = checked
      ? [...value, flag]
      : value.filter((f) => f !== flag);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-0.5">
      {PERMISSION_LIST.map((p) => {
        const checked = value.includes(p.flag);
        const isAdminRow = p.flag === PERMISSIONS.ADMINISTRATOR;
        // ADMINISTRATOR bật → các quyền khác bị bypass (mờ, không cần tick)
        const dimmed = isAdmin && !isAdminRow;
        return (
          <label
            key={p.label}
            className={`flex items-start gap-2.5 rounded-md px-2 py-1.5 text-sm ${
              disabled ? "cursor-default" : "cursor-pointer hover:bg-surface"
            } ${dimmed ? "opacity-40" : ""}`}
          >
            <Checkbox
              className="mt-0.5"
              checked={checked}
              disabled={disabled || dimmed}
              onCheckedChange={(v) => toggle(p.flag, v === true)}
            />
            <span className="flex flex-col">
              <span className="text-text-secondary">{p.label}</span>
              <span className="text-xs text-text-muted">{p.description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
