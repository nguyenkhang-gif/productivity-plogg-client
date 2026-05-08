"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { Post } from "@/core/redux/post";
import { Comment } from "@/core/redux/comment";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import ReactMarkdown from "react-markdown";
import { CalendarDays, Heart, Loader2, Pencil, Send, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetComments, useCreateComment, useDeleteComment } from "@/core/services/client/comments";

interface PostDetailDialogProps {
  post: Post | null;
  open: boolean;
  onClose: () => void;
}

function CommentItem({
  comment,
  currentUserId,
  postId,
}: {
  comment: Comment;
  currentUserId: string;
  postId: string;
}) {
  const isOwner = comment.authorId === currentUserId || comment.author?.id === currentUserId;
  const { mutate: deleteComment, isPending } = useDeleteComment(postId);

  return (
    <div className="flex gap-3 group">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">
        {comment.author?.fullName?.[0]?.toUpperCase() ?? "U"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white/[0.04] rounded-2xl rounded-tl-sm px-4 py-2.5">
          <p className="text-slate-200 text-xs font-semibold mb-0.5">
            {comment.author?.fullName ?? "Unknown"}
          </p>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
        <p className="text-slate-600 text-xs mt-1 ml-1">
          {new Date(comment.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      {isOwner && (
        <button
          onClick={() => deleteComment(comment.id)}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 self-start mt-1 p-1.5 rounded-full text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const { profile } = useSelector((state: RootState) => state.user);
  const commentsByPostId = useSelector((state: RootState) => state.comment.byPostId);
  const hasMoreByPostId = useSelector((state: RootState) => state.comment.hasMoreByPostId);
  const comments = commentsByPostId[postId] ?? [];
  const hasMore = hasMoreByPostId[postId] ?? false;

  const [text, setText] = useState("");
  const loaderRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { isLoading, isFetchingNextPage, fetchNextPage } = useGetComments(postId);
  const { mutate: createComment, isPending: isPosting } = useCreateComment(postId);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetchingNextPage, fetchNextPage]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isPosting) return;
    createComment({ content: trimmed }, { onSuccess: () => setText("") });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3 px-1">
        Bình luận
      </p>

      {/* Comment list */}
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-6">Chưa có bình luận nào.</p>
        ) : (
          comments.map((c) => (
            <CommentItem key={c.id} comment={c} currentUserId={profile.id} postId={postId} />
          ))
        )}

        <div ref={loaderRef} className="flex justify-center py-2">
          {isFetchingNextPage && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
          {!hasMore && comments.length > 0 && (
            <p className="text-slate-700 text-xs">Đã xem hết bình luận</p>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.05]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          {profile.fullName?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div className="flex-1 flex gap-2 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Viết bình luận... (Enter để gửi)"
            rows={1}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:border-blue-500/50 transition-colors"
            style={{ minHeight: "36px", maxHeight: "100px" }}
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isPosting}
            className="flex-shrink-0 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            {isPosting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailDialog({ post, open, onClose }: PostDetailDialogProps) {
  const router = useRouter();
  const { profile } = useSelector((state: RootState) => state.user);
  if (!post) return null;

  const isOwner = post.author?.id === profile.id || post.authorId === profile.id;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
        <DialogContent className="max-w-5xl w-full h-[90vh] p-0 bg-[#141824] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col gap-0 [&>button]:hidden">
          <VisuallyHidden.Root>
            <DialogTitle>Chi tiết bài viết</DialogTitle>
          </VisuallyHidden.Root>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {post.author?.profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.profilePic} alt={post.author.fullName} className="w-full h-full object-cover" />
                ) : (
                  post.author?.fullName?.[0]?.toUpperCase() ?? "U"
                )}
              </div>
              <div>
                <p className="text-slate-100 text-sm font-semibold leading-tight">
                  {post.author?.fullName ?? "Unknown"}
                </p>
                <span className="flex items-center gap-1 text-slate-500 text-xs">
                  <CalendarDays size={11} />
                  {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={() => { onClose(); router.push(`/create-post?edit=${post.id}`); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Pencil size={13} /> Chỉnh sửa
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body: two-column layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: post content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 border-r border-white/[0.06]">
              {post.imageUrls?.length > 0 && (
                <div className={`grid gap-0.5 mb-5 rounded-xl overflow-hidden ${post.imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {post.imageUrls.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full " />
                  ))}
                </div>
              )}

              <article className="prose prose-sm max-w-none
                [&_p]:text-slate-300 [&_p]:leading-relaxed [&_p]:my-1.5
                [&_h1]:text-slate-100 [&_h2]:text-slate-100 [&_h3]:text-slate-100
                [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-semibold
                [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:mt-2 [&_h3]:mb-1
                [&_strong]:text-slate-200 [&_em]:text-slate-300 [&_em]:italic
                [&_a]:text-blue-400 [&_a]:no-underline hover:[&_a]:underline
                [&_code]:text-sky-300 [&_code]:bg-slate-800/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
                [&_pre]:bg-slate-900/80 [&_pre]:border [&_pre]:border-white/[0.06] [&_pre]:rounded-xl [&_pre]:p-4
                [&_blockquote]:border-l-2 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:text-slate-400 [&_blockquote]:italic
                [&_ul]:text-slate-300 [&_ol]:text-slate-300
                [&_li]:marker:text-slate-500
                [&_hr]:border-white/[0.06]">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </article>

              <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-white/[0.05] text-slate-500 text-sm">
                <Heart size={14} className="text-red-400/80" />
                <span className="text-slate-400">{post.likesCount}</span>
              </div>
            </div>

            {/* Right: comments */}
            <div className="w-80 flex-shrink-0 flex flex-col px-4 py-5 overflow-hidden">
              <CommentSection postId={post.id} />
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
