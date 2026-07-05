"use client";

import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useGetAdminPostById } from "@/core/services/client/posts";
import { PostModerationStatus, PostVisibility } from "@/core/enums";
import UserAvatar from "@/components/ui/UserAvatar";
import { X, Loader2, Globe, Users, Lock, Eye, MessageCircle, Heart } from "lucide-react";
import { timeAgo } from "@/core/lib/timeAgo";

interface Props {
  postId: string | null;
  onClose: () => void;
}

const statusBadge: Record<string, string> = {
  [PostModerationStatus.Approved]: "bg-emerald-500/15 text-emerald-400",
  [PostModerationStatus.Pending]: "bg-yellow-500/15 text-yellow-400",
  [PostModerationStatus.Rejected]: "bg-red-500/15 text-red-400",
};

const VisibilityIcon = ({ v }: { v?: string }) => {
  if (v === PostVisibility.Public) return <Globe size={13} className="text-blue-400" />;
  if (v === PostVisibility.Friends) return <Users size={13} className="text-purple-400" />;
  return <Lock size={13} className="text-zinc-400" />;
};

export default function AdminPostDetailDialog({ postId, onClose }: Props) {
  const { data: post, isLoading } = useGetAdminPostById(postId);

  useEffect(() => {
    if (!postId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [postId, onClose]);

  if (!postId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-[#1C1F2E] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span className="text-sm font-medium text-text-primary">Post detail</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2 justify-center py-16">
              <Loader2 size={18} className="animate-spin text-accent-text" />
            </div>
          ) : !post ? (
            <p className="text-center text-sm text-text-muted py-16">Post not found.</p>
          ) : (
            <>
              {/* Author row */}
              <div className="flex items-center gap-3">
                <UserAvatar src={post.author?.profilePic} name={post.author?.fullName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary leading-tight">
                    {post.author?.fullName}
                  </p>
                  <p className="text-xs text-text-muted">@{post.author?.username} · {timeAgo(post.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <VisibilityIcon v={post.visibility} />
                  {post.moderationStatus && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[post.moderationStatus] ?? ""}`}>
                      {post.moderationStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              {post.title && (
                <h2 className="text-lg font-semibold text-text-primary leading-snug">
                  {post.title}
                </h2>
              )}

              {/* Content */}
              <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Images */}
              {post.imageUrls?.length > 0 && (
                <div className={`grid gap-2 ${post.imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {post.imageUrls.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="w-full rounded-xl object-cover max-h-64"
                    />
                  ))}
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-text-muted pt-1 border-t border-border">
                <span className="flex items-center gap-1"><Heart size={12} /> {post.reactCount}</span>
                <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.commentCount}</span>
                {post.viewCount != null && (
                  <span className="flex items-center gap-1"><Eye size={12} /> {post.viewCount}</span>
                )}
                {post.rejectionReason && (
                  <span className="ml-auto text-red-400">Rejected: {post.rejectionReason}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
