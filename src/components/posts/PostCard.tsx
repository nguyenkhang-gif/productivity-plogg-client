"use client";

import { useState } from "react";
import { Post } from "@/core/redux/post";
import { Heart, Trash2, Pencil, CalendarDays, MoreHorizontal, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useConstants } from "@/core/hooks/useConstants";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onDelete: (id: string) => void;
  onOpenDetail?: (post: Post) => void;
}

export default function PostCard({ post, currentUserId, onDelete, onOpenDetail }: PostCardProps) {
  const { Post: PostConstants } = useConstants();
  const router = useRouter();
  const isOwner = post.author?.id === currentUserId || post.authorId === currentUserId;
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isLong = post.content.length > PostConstants.COLLAPSE_THRESHOLD;
  const displayContent =
    isLong && !expanded
      ? post.content.slice(0, PostConstants.COLLAPSE_THRESHOLD).trimEnd() + "..."
      : post.content;

  return (
    <article className="bg-[#141824] border border-white/[0.06] rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 pt-5 pb-4 ${onOpenDetail ? "cursor-pointer" : ""}`}
        onClick={() => onOpenDetail?.(post)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md overflow-hidden">
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
            <span className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
              <CalendarDays size={11} />
              {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {isOwner && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-slate-200 transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-[#1e2436] border border-white/[0.08] rounded-xl shadow-2xl z-10 min-w-[130px] overflow-hidden">
                <button
                  onClick={() => { router.push(`/create-post?edit=${post.id}`); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <Pencil size={14} /> Chỉnh sửa
                </button>
                <button
                  onClick={() => { onDelete(post.id); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={14} /> Xóa bài
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={`px-5 pb-2 ${onOpenDetail ? "cursor-pointer" : ""}`}
        onClick={() => onOpenDetail?.(post)}
      >
        <div className="prose prose-sm max-w-none
          [&_p]:text-slate-300 [&_p]:leading-relaxed [&_p]:my-1.5
          [&_h1]:text-slate-100 [&_h2]:text-slate-100 [&_h3]:text-slate-100
          [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-semibold
          [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:mt-2 [&_h3]:mb-1
          [&_strong]:text-slate-200 [&_strong]:font-semibold
          [&_em]:text-slate-300 [&_em]:italic
          [&_a]:text-blue-400 [&_a]:no-underline hover:[&_a]:underline
          [&_code]:text-sky-300 [&_code]:bg-slate-800/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
          [&_pre]:bg-slate-900/80 [&_pre]:border [&_pre]:border-white/[0.06] [&_pre]:rounded-xl [&_pre]:p-4
          [&_blockquote]:border-l-2 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:text-slate-400 [&_blockquote]:italic
          [&_ul]:text-slate-300 [&_ol]:text-slate-300
          [&_li]:marker:text-slate-500
          [&_hr]:border-white/[0.06]">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
        </div>

        {isLong && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((e) => !e); }}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-1 mb-3 transition-colors"
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </div>

      {/* Images */}
      {post.imageUrls?.length > 0 && (
        <div
          className={`grid gap-0.5 ${post.imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"} ${onOpenDetail ? "cursor-pointer" : ""}`}
          onClick={() => onOpenDetail?.(post)}
        >
          {post.imageUrls.slice(0, PostConstants.MAX_IMAGES).map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt="" className="w-full object-cover max-h-80" />
              {i === PostConstants.MAX_IMAGES - 1 && post.imageUrls.length > PostConstants.MAX_IMAGES && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-2xl">
                  +{post.imageUrls.length - PostConstants.MAX_IMAGES}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-1.5 text-slate-500 text-sm hover:text-red-400 transition-colors cursor-pointer select-none">
          <Heart size={15} className="text-red-400/80" />
          <span className="text-slate-400">{post.likesCount}</span>
        </div>
        <button
          onClick={() => onOpenDetail?.(post)}
          className="flex items-center gap-1.5 text-slate-500 text-sm hover:text-blue-400 transition-colors"
        >
          <MessageCircle size={15} />
          <span>{post.commentCount ?? 0}</span>
        </button>
      </div>
    </article>
  );
}
