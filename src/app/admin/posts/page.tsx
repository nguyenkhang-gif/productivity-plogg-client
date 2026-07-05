"use client";

import { useState } from "react";
import { useToast } from "@/core/hooks/use-toast";
import {
  useGetAdminPosts,
  useApprovePost,
  useRejectPost,
  useAdminDeletePost,
} from "@/core/services/client/posts";
import { PostModerationStatus, PostVisibility } from "@/core/enums";
import {
  Loader2,
  ShieldCheck,
  Check,
  X,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { styles } from "@/core/config/styles";
import { useDebounce } from "@/core/hooks/useDebounce";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AdminPostDetailDialog from "@/components/admin/AdminPostDetailDialog";

const MODERATION_OPTIONS = [
  { label: "All status", value: "" },
  { label: "Pending", value: PostModerationStatus.Pending },
  { label: "Approved", value: PostModerationStatus.Approved },
  { label: "Rejected", value: PostModerationStatus.Rejected },
];

const VISIBILITY_OPTIONS = [
  { label: "All visibility", value: "" },
  { label: "Public", value: PostVisibility.Public },
  { label: "Friends", value: PostVisibility.Friends },
  { label: "Private", value: PostVisibility.Private },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

const statusBadge: Record<string, string> = {
  [PostModerationStatus.Approved]: "bg-emerald-500/15 text-emerald-400",
  [PostModerationStatus.Pending]: "bg-yellow-500/15 text-yellow-400",
  [PostModerationStatus.Rejected]: "bg-red-500/15 text-red-400",
};

const visibilityBadge: Record<string, string> = {
  [PostVisibility.Public]: "bg-blue-500/15 text-blue-400",
  [PostVisibility.Friends]: "bg-purple-500/15 text-purple-400",
  [PostVisibility.Private]: "bg-zinc-500/15 text-zinc-400",
};

const selectCls =
  "text-sm bg-white/5 border border-border rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:border-accent";

export default function AdminPostsPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [moderationStatus, setModerationStatus] = useState("");
  const [visibility, setVisibility] = useState("");
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title?: string } | null>(null);
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);

  const search = useDebounce(searchInput, 400);

  const { data, isLoading } = useGetAdminPosts({
    page,
    limit,
    search: search || undefined,
    moderationStatus: moderationStatus || undefined,
    visibility: visibility || undefined,
  });

  const approveMut = useApprovePost();
  const rejectMut = useRejectPost();
  const deleteMut = useAdminDeletePost();

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const approvingId = approveMut.isPending ? approveMut.variables : null;
  const rejectingId = rejectMut.isPending ? rejectMut.variables?.postId : null;
  const deletingId = deleteMut.isPending ? deleteMut.variables : null;

  const resetPage = () => setPage(1);

  const handleApprove = (postId: string) =>
    approveMut.mutate(postId, {
      onSuccess: () => toast({ description: "Post approved" }),
      onError: () => toast({ description: "Failed to approve", variant: "destructive" }),
    });

  const handleReject = (postId: string) =>
    rejectMut.mutate(
      { postId, reason: rejectReasons[postId]?.trim() || undefined },
      {
        onSuccess: () => {
          setRejectReasons((r) => { const n = { ...r }; delete n[postId]; return n; });
          toast({ description: "Post rejected" });
        },
        onError: () => toast({ description: "Failed to reject", variant: "destructive" }),
      }
    );

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast({ description: "Post deleted" });
      },
      onError: () => toast({ description: "Failed to delete", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ShieldCheck size={20} className="text-accent-text" />
        <h1 className="text-xl font-semibold text-text-primary">Posts</h1>
        {pagination && (
          <span className={`${styles.muted} text-sm`}>({pagination.total})</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            placeholder="Search by title..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); resetPage(); }}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white/5 border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={moderationStatus}
          onChange={(e) => { setModerationStatus(e.target.value); resetPage(); }}
          className={selectCls}
        >
          {MODERATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-background">{o.label}</option>
          ))}
        </select>
        <select
          value={visibility}
          onChange={(e) => { setVisibility(e.target.value); resetPage(); }}
          className={selectCls}
        >
          {VISIBILITY_OPTIONS.map((o) => (
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
        ) : items.length === 0 ? (
          <p className={`${styles.muted} text-sm py-16 text-center`}>No posts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted text-left bg-white/[0.02]">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Author</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Visibility</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((post) => {
                  const busy =
                    approvingId === post.id ||
                    rejectingId === post.id ||
                    deletingId === post.id;
                  const isPending = post.moderationStatus === PostModerationStatus.Pending;

                  return (
                    <tr key={post.id} className="hover:bg-white/[0.025] transition-colors">
                      <td
                        className="px-4 py-3 max-w-[240px] truncate text-text-primary cursor-pointer hover:text-accent-text transition-colors"
                        onClick={() => setPreviewPostId(post.id)}
                        title="View details"
                      >
                        {post.title || <span className="text-text-muted italic">Untitled</span>}
                      </td>
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        {post.author?.fullName ?? post.author?.username ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {post.moderationStatus && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[post.moderationStatus] ?? ""}`}>
                            {post.moderationStatus}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {post.visibility && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${visibilityBadge[post.visibility] ?? ""}`}>
                            {post.visibility}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(post.id)}
                                disabled={busy}
                                title="Approve"
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 disabled:opacity-40 transition-colors"
                              >
                                <Check size={14} />
                              </button>
                              <div className="flex items-center gap-1">
                                <input
                                  placeholder="Reason..."
                                  value={rejectReasons[post.id] ?? ""}
                                  onChange={(e) =>
                                    setRejectReasons((r) => ({ ...r, [post.id]: e.target.value }))
                                  }
                                  className="w-28 text-xs bg-white/5 border border-border rounded px-2 py-1 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                                />
                                <button
                                  onClick={() => handleReject(post.id)}
                                  disabled={busy}
                                  title="Reject"
                                  className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 disabled:opacity-40 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </>
                          )}
                          <button
                            onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
                            disabled={busy}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-600/20 text-text-muted hover:text-red-400 disabled:opacity-40 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
      {pagination && (
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
              {((page - 1) * limit) + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total}
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

            {/* Page number pills */}
            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
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
              disabled={page === pagination.totalPages}
              title="Next page"
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(pagination.totalPages)}
              disabled={page === pagination.totalPages}
              title="Last page"
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted disabled:opacity-30 transition-colors"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
      <AdminPostDetailDialog
        postId={previewPostId}
        onClose={() => setPreviewPostId(null)}
      />

      {deleteTarget && (
        <ConfirmDialog
          title="Delete post?"
          subtitle={deleteTarget.title || "Untitled"}
          message="This action cannot be undone. The post will be permanently removed."
          confirmLabel="Delete"
          isLoading={deleteMut.isPending}
          loadingLabel="Deleting..."
          icon={Trash2}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
