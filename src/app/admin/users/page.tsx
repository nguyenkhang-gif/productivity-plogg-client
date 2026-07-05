"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useRole } from "@/core/hooks/useRole";
import { useToast } from "@/core/hooks/use-toast";
import { useGetAdminUsers, useChangeUserRole } from "@/core/services/client/users";
import { UserRole } from "@/core/enums";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  Loader2,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Shield,
} from "lucide-react";
import { styles } from "@/core/config/styles";
import { useDebounce } from "@/core/hooks/useDebounce";

const ROLE_OPTIONS = [
  { label: "All roles", value: "" },
  { label: "User", value: UserRole.User },
  { label: "Moderator", value: UserRole.Moderator },
  { label: "Admin", value: UserRole.Admin },
];

const MEMBERSHIP_OPTIONS = [
  { label: "All plans", value: "" },
  { label: "Basic", value: "basic" },
  { label: "Advance", value: "advance" },
  { label: "Premium", value: "premium" },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

const ROLE_BADGE: Record<string, string> = {
  [UserRole.Admin]: "bg-red-500/15 text-red-400",
  [UserRole.Moderator]: "bg-amber-500/15 text-amber-400",
  [UserRole.User]: "bg-white/10 text-text-secondary",
};

const MEMBERSHIP_BADGE: Record<string, string> = {
  premium: "bg-yellow-500/15 text-yellow-400",
  advance: "bg-blue-500/15 text-blue-400",
  basic: "bg-white/10 text-text-muted",
};

const selectCls =
  "text-sm bg-white/5 border border-border rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:border-accent";

export default function AdminUsersPage() {
  const { isAdmin } = useRole();
  const { profile } = useSelector((state: RootState) => state.user);
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [role, setRole] = useState("");
  const [membership, setMembership] = useState("");

  const search = useDebounce(searchInput, 400);
  const resetPage = () => setPage(1);

  const { data, isLoading, isError } = useGetAdminUsers({
    page,
    limit,
    search: search || undefined,
    role: role || undefined,
    membership: membership || undefined,
  });

  const changeRoleMut = useChangeUserRole();

  if (!isAdmin) {
    return (
      <div className="py-16 text-center">
        <p className={styles.muted}>You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (userId === profile?.id) {
      toast({ description: "You cannot change your own role.", variant: "destructive" });
      return;
    }
    changeRoleMut.mutate(
      { userId, role: newRole },
      {
        onSuccess: () => toast({ description: `Role updated to ${newRole}` }),
        onError: () => toast({ description: "Failed to update role", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users size={20} className="text-accent-text" />
        <h1 className="text-xl font-semibold text-text-primary">Users</h1>
        {data && <span className={`${styles.muted} text-sm`}>({total})</span>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            placeholder="Search by name, username, email..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); resetPage(); }}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white/5 border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); resetPage(); }}
          className={selectCls}
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-background">{o.label}</option>
          ))}
        </select>
        <select
          value={membership}
          onChange={(e) => { setMembership(e.target.value); resetPage(); }}
          className={selectCls}
        >
          {MEMBERSHIP_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-background">{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-border bg-white/[0.02] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center gap-2 py-16 justify-center">
            <Loader2 size={18} className="animate-spin text-accent-text" />
            <span className={`${styles.muted} text-sm`}>Loading...</span>
          </div>
        ) : isError ? (
          <p className="text-sm py-16 text-center text-red-400">Failed to load users.</p>
        ) : items.length === 0 ? (
          <p className={`${styles.muted} text-sm py-16 text-center`}>No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted text-left bg-white/[0.02]">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Last seen</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((user) => {
                  const isSelf = user.id === profile?.id;
                  const isChanging =
                    changeRoleMut.isPending &&
                    changeRoleMut.variables?.userId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.025] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar src={user.profilePic} name={user.fullName} size="sm" />
                          <div className="min-w-0">
                            <p className="text-text-primary font-medium truncate leading-tight">
                              {user.fullName}
                            </p>
                            <p className="text-text-muted text-xs truncate">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MEMBERSHIP_BADGE[user.membership] ?? "bg-white/10 text-text-muted"}`}>
                          {user.membership}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                        {user.lastSeen
                          ? new Date(user.lastSeen).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isSelf ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[user.role] ?? ""}`}>
                            {user.role}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Shield size={13} className="text-text-muted shrink-0" />
                            <select
                              value={user.role}
                              disabled={isChanging}
                              onChange={(e) =>
                                handleRoleChange(user.id, e.target.value as UserRole)
                              }
                              className={`text-xs bg-white/5 border border-border rounded-lg px-2 py-1 focus:outline-none focus:border-accent disabled:opacity-50 ${ROLE_BADGE[user.role] ?? ""}`}
                            >
                              {[UserRole.User, UserRole.Moderator, UserRole.Admin].map((r) => (
                                <option key={r} value={r} className="bg-background text-text-primary">
                                  {r}
                                </option>
                              ))}
                            </select>
                            {isChanging && <Loader2 size={13} className="animate-spin text-accent-text" />}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination card */}
      {data && (
        <div className="rounded-xl border border-border bg-white/[0.02] px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: rows per page */}
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>Rows per page</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); resetPage(); }}
              className="bg-white/5 border border-border rounded-lg px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-accent"
            >
              {LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n} className="bg-background">{n}</option>
              ))}
            </select>
            <span className="text-text-muted/60">
              {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
            </span>
          </div>

          {/* Right: page buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              title="First page"
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted disabled:opacity-30 transition-colors"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              title="Previous page"
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-text-muted text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`min-w-[30px] h-[30px] rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? "bg-accent text-white"
                          : "hover:bg-white/10 text-text-muted"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              title="Next page"
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              title="Last page"
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted disabled:opacity-30 transition-colors"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
