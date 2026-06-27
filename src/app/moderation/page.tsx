"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useRole } from "@/core/hooks/useRole";
import { useToast } from "@/core/hooks/use-toast";
import {
  useGetPendingPosts,
  useApprovePost,
  useRejectPost,
} from "@/core/services/client/posts";
import PostCard from "@/components/posts/PostCard";
import { Loader2, ShieldCheck, Check, X } from "lucide-react";
import { styles } from "@/core/config/styles";

export default function ModerationPage() {
  const { canModerate } = useRole();
  const { profile } = useSelector((state: RootState) => state.user);
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPendingPosts(page);
  const approveMut = useApprovePost();
  const rejectMut = useRejectPost();
  const [reasons, setReasons] = useState<Record<string, string>>({});

  if (!canModerate) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className={styles.muted}>You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  const items = data?.items ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  // Only the row whose mutation is in flight gets disabled.
  const approvingId = approveMut.isPending ? approveMut.variables : null;
  const rejectingId = rejectMut.isPending ? rejectMut.variables?.postId : null;

  const clearReason = (postId: string) =>
    setReasons((r) => {
      const next = { ...r };
      delete next[postId];
      return next;
    });

  const handleApprove = (postId: string) =>
    approveMut.mutate(postId, {
      onSuccess: () => toast({ description: "Post approved" }),
      onError: () =>
        toast({ description: "Failed to approve post", variant: "destructive" }),
    });

  const handleReject = (postId: string) =>
    rejectMut.mutate(
      { postId, reason: reasons[postId]?.trim() || undefined },
      {
        onSuccess: () => {
          clearReason(postId);
          toast({ description: "Post rejected" });
        },
        onError: () =>
          toast({ description: "Failed to reject post", variant: "destructive" }),
      }
    );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={20} className="text-accent-text" />
        <h1 className="text-xl font-semibold text-text-primary">Moderation queue</h1>
        {data && (
          <span className={`${styles.muted} text-sm`}>({data.pagination.total})</span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-8 justify-center">
          <Loader2 size={18} className="animate-spin text-accent-text" />
          <span className={`${styles.muted} text-sm`}>Loading...</span>
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <p className={`${styles.muted} text-sm py-8 text-center`}>
          No posts pending review.
        </p>
      )}

      {items.map((post) => {
        const busy = approvingId === post.id || rejectingId === post.id;
        return (
          <div key={post.id} className="space-y-2">
            <PostCard post={post} currentUserId={profile.id} onDelete={() => {}} />
            <div className="flex gap-2 items-center">
              <button
                onClick={() => handleApprove(post.id)}
                disabled={busy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Check size={15} /> Approve
              </button>
              <input
                placeholder="Rejection reason..."
                value={reasons[post.id] ?? ""}
                onChange={(e) =>
                  setReasons((r) => ({ ...r, [post.id]: e.target.value }))
                }
                className="flex-1 text-sm bg-white/5 border border-border rounded-lg px-3 py-1.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
              <button
                onClick={() => handleReject(post.id)}
                disabled={busy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <X size={15} /> Reject
              </button>
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`${styles.muted} disabled:opacity-30 hover:text-text-primary px-2`}
          >
            ←
          </button>
          <span className="text-sm text-text-secondary">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={`${styles.muted} disabled:opacity-30 hover:text-text-primary px-2`}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
