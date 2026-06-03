"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { Post } from "@/core/types/post";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import ReactMarkdown from "react-markdown";
import { CalendarDays, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import CommentSection from "./CommentSection";
import ReactionButton from "./ReactionButton";

interface PostDetailDialogProps {
  post: Post | null;
  open: boolean;
  onClose: () => void;
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
        <DialogContent className="max-w-full sm:max-w-5xl w-full h-full sm:h-[90vh] p-0 bg-[#141824] border-0 sm:border border-white/[0.06] rounded-none sm:rounded-2xl overflow-hidden flex flex-col gap-0 [&>button]:hidden">
          <VisuallyHidden.Root>
            <DialogTitle>Chi tiết bài viết</DialogTitle>
          </VisuallyHidden.Root>

          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                {post.author?.profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.profilePic} alt={post.author.fullName} className="w-full h-full object-cover" />
                ) : (
                  post.author?.fullName?.[0]?.toUpperCase() ?? "U"
                )}
              </div>
              <div className="min-w-0">
                <p className="text-slate-100 text-sm font-semibold leading-tight truncate">
                  {post.author?.fullName ?? "Unknown"}
                </p>
                <span className="flex items-center gap-1 text-slate-500 text-xs">
                  <CalendarDays size={11} />
                  {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              {isOwner && (
                <button
                  onClick={() => { onClose(); router.push(`/create-post?edit=${post.id}`); }}
                  className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs rounded-lg border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Pencil size={13} /> <span className="hidden sm:inline">Chỉnh sửa</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 md:p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body: stack on mobile, two-column on md+ */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 border-b md:border-b-0 md:border-r border-white/[0.06]">
              {post.imageUrls?.length > 0 && (
                <div className={`grid gap-0.5 mb-5 rounded-xl overflow-hidden ${post.imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {post.imageUrls.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt="" className="w-full" />
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

              <div className="mt-6 pt-4 border-t border-white/[0.05]">
                <ReactionButton post={post} />
              </div>
            </div>

            {/* Comments */}
            <div className="w-full max-h-[40vh] md:max-h-none md:w-80 md:flex-shrink-0 flex flex-col px-4 py-4 md:py-5 overflow-hidden">
              <CommentSection postId={post.id} />
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
