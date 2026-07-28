import { PostModerationStatus, PostVisibility, UserRole } from "@/core/enums";
import { ShieldCheck, Users } from "lucide-react";

export const ADMIN_LIMIT_OPTIONS = [10, 20, 50, 100];

export const ADMIN_TABS = [
  { href: "/admin/posts", label: "Posts", icon: ShieldCheck, adminOnly: false },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

export const USER_ROLE_OPTIONS = [
  { label: "All roles", value: "" },
  { label: "User", value: UserRole.User },
  { label: "Moderator", value: UserRole.Moderator },
  { label: "Admin", value: UserRole.Admin },
];

export const MEMBERSHIP_OPTIONS = [
  { label: "All plans", value: "" },
  { label: "Basic", value: "basic" },
  { label: "Advance", value: "advance" },
  { label: "Premium", value: "premium" },
];

export const ROLE_BADGE: Record<string, string> = {
  [UserRole.Admin]: "bg-red-500/15 text-red-400",
  [UserRole.Moderator]: "bg-amber-500/15 text-amber-400",
  [UserRole.User]: "bg-white/10 text-text-secondary",
};

export const MEMBERSHIP_BADGE: Record<string, string> = {
  premium: "bg-yellow-500/15 text-yellow-400",
  advance: "bg-blue-500/15 text-blue-400",
  basic: "bg-white/10 text-text-muted",
};

export const POST_MODERATION_OPTIONS = [
  { label: "All status", value: "" },
  { label: "Pending", value: PostModerationStatus.Pending },
  { label: "Approved", value: PostModerationStatus.Approved },
  { label: "Rejected", value: PostModerationStatus.Rejected },
];

export const POST_VISIBILITY_OPTIONS = [
  { label: "All visibility", value: "" },
  { label: "Public", value: PostVisibility.Public },
  { label: "Friends", value: PostVisibility.Friends },
  { label: "Private", value: PostVisibility.Private },
];

export const POST_STATUS_BADGE: Record<string, string> = {
  [PostModerationStatus.Approved]: "bg-emerald-500/15 text-emerald-400",
  [PostModerationStatus.Pending]: "bg-yellow-500/15 text-yellow-400",
  [PostModerationStatus.Rejected]: "bg-red-500/15 text-red-400",
};

export const POST_VISIBILITY_BADGE: Record<string, string> = {
  [PostVisibility.Public]: "bg-blue-500/15 text-blue-400",
  [PostVisibility.Friends]: "bg-purple-500/15 text-purple-400",
  [PostVisibility.Private]: "bg-zinc-500/15 text-zinc-400",
};
