"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { hasPermission } from "@/core/config/permissions";

/**
 * Quyền của user hiện tại trong 1 guild, tính từ `guild.myPermissions`
 * (bitmask string do GET /guilds/:id trả về — cần useGetGuildDetail đã fetch).
 *
 * Dùng để ẩn/hiện nút (UX). Backend vẫn tự enforce.
 */
export function usePermissions(guildId?: string) {
  const myPermissions = useSelector(
    (s: RootState) => s.guild.guilds.find((g) => g.id === guildId)?.myPermissions,
  );

  const perms = useMemo(() => {
    try {
      return BigInt(myPermissions ?? "0");
    } catch {
      return BigInt(0);
    }
  }, [myPermissions]);

  const can = useMemo(() => (flag: bigint) => hasPermission(perms, flag), [perms]);

  return { can, perms };
}
