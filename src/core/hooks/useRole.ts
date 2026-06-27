"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { UserRole } from "@/core/enums";

/**
 * Helper guard UI theo role — tránh lặp `profile.role === 'admin'` khắp nơi.
 * Đọc `profile.role` từ Redux (set khi useAuth bootstrap).
 */
export function useRole() {
  const { profile } = useSelector((state: RootState) => state.user);
  const role = profile.role as UserRole;

  return {
    role,
    isUser: role === UserRole.User,
    isModerator: role === UserRole.Moderator,
    isAdmin: role === UserRole.Admin,
    canModerate: role === UserRole.Moderator || role === UserRole.Admin,
    canManageRoles: role === UserRole.Admin,
  };
}
