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
import { ShieldCheck, Trash2 } from "lucide-react";
import { styles } from "@/core/config/styles";
import { useTableState } from "@/core/hooks/useTableState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AdminPostDetailDialog from "@/components/admin/AdminPostDetailDialog";
import PostRowActions from "@/components/admin/PostRowActions";
import { AppDataTable, AppFilterBar, ColumnConfig } from "@/components/ui/data-table";
import type { Post } from "@/core/types/post";

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

export default function AdminPostsPage() {
  const { toast } = useToast();

  const { page, setPage, limit, setLimit, searchInput, search, setSearch } = useTableState();
  const [moderationStatus, setModerationStatus] = useState("");
  const [visibility, setVisibility] = useState("");
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title?: string } | null>(null);
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);

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

  const columns: ColumnConfig<Post>[] = [
    {
      key: "title",
      header: "Title",
      className: "max-w-[240px] truncate text-text-primary",
      onCellClick: (post) => setPreviewPostId(post.id),
      render: (post) =>
        post.title || <span className="text-text-muted italic">Untitled</span>,
    },
    {
      key: "author",
      header: "Author",
      nowrap: true,
      className: "text-text-secondary",
      render: (post) => post.author?.fullName ?? post.author?.username ?? "—",
    },
    {
      key: "moderationStatus",
      header: "Status",
      nowrap: true,
      format: "badge",
      badgeMap: statusBadge,
    },
    {
      key: "visibility",
      header: "Visibility",
      nowrap: true,
      format: "badge",
      badgeMap: visibilityBadge,
    },
    {
      key: "createdAt",
      header: "Created",
      nowrap: true,
      className: "text-text-muted",
      format: "date",
    },
  ];

  const filtersConfig = [
    {
      key: "search",
      type: "text" as const,
      placeholder: "Search by title...",
      value: searchInput,
      onChange: setSearch,
    },
    {
      key: "moderationStatus",
      type: "select" as const,
      value: moderationStatus,
      options: MODERATION_OPTIONS,
      onChange: (value: string) => { setModerationStatus(value); setPage(1); },
    },
    {
      key: "visibility",
      type: "select" as const,
      value: visibility,
      options: VISIBILITY_OPTIONS,
      onChange: (value: string) => { setVisibility(value); setPage(1); },
    },
  ];

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
      <AppFilterBar filters={filtersConfig} />

      {/* Table + pagination */}
      <AppDataTable
        columns={columns}
        items={items}
        loading={isLoading}
        rowKey={(post) => post.id}
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
        limitOptions={LIMIT_OPTIONS}
        emptyMessage="No posts found."
        renderActions={(post) => (
          <PostRowActions
            busy={approvingId === post.id || rejectingId === post.id || deletingId === post.id}
            isPending={post.moderationStatus === PostModerationStatus.Pending}
            rejectReason={rejectReasons[post.id] ?? ""}
            onReasonChange={(value) => setRejectReasons((r) => ({ ...r, [post.id]: value }))}
            onApprove={() => handleApprove(post.id)}
            onReject={() => handleReject(post.id)}
            onDelete={() => setDeleteTarget({ id: post.id, title: post.title })}
          />
        )}
      />
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
