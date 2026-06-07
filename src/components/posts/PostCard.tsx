"use client";

import { useState } from "react";
import { Post } from "@/core/types/post";
import { PostCategory } from "@/core/enums";
import { Trash2, Pencil, CalendarDays, MoreHorizontal, MessageCircle, Clock, Share2, Bookmark, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useConstants } from "@/core/hooks/useConstants";
import { useToast } from "@/core/hooks/use-toast";
import ReactionButton from "./ReactionButton";
import { timeAgo } from "@/core/lib/timeAgo";
import { readingTime } from "@/core/lib/readingTime";
import { apiBookmarkPost, apiUnbookmarkPost } from "@/core/services/api/posts";
import { styles } from "@/core/config/styles";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onDelete: (id: string) => void;
  onOpenDetail?: (post: Post) => void;
  onTagClick?: (tag: string) => void;
}

const CATEGORY_STYLES: Record<PostCategory, string> = {
  [PostCategory.Note]:        "bg-slate-700/50 text-slate-300",
  [PostCategory.Achievement]: "bg-amber-500/20 text-amber-300",
  [PostCategory.Question]:    "bg-violet-500/20 text-violet-300",
  [PostCategory.Tutorial]:    "bg-emerald-500/20 text-emerald-300",
};

const CATEGORY_LABELS: Record<PostCategory, string> = {
  [PostCategory.Note]:        "Ghi chú",
  [PostCategory.Achievement]: "Thành tích",
  [PostCategory.Question]:    "Câu hỏi",
  [PostCategory.Tutorial]:    "Hướng dẫn",
};

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// Backend may return tags as {id, name, slug} objects or plain strings
function normalizeTag(tag: unknown): string {
  if (typeof tag === "string") return tag;
  if (tag && typeof tag === "object") {
    const t = tag as Record<string, unknown>;
    return String(t.slug ?? t.name ?? t.id ?? "");
  }
  return String(tag ?? "");
}

export default function PostCard({ post, currentUserId, onDelete, onOpenDetail, onTagClick }: PostCardProps) {
  const { Post: PostConstants } = useConstants();
  const router = useRouter();
  const { toast } = useToast();
  const isOwner = post.author?.id === currentUserId || post.authorId === currentUserId;
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked ?? false);

  const isLong = post.content.length > PostConstants.COLLAPSE_THRESHOLD;
  const displayContent =
    isLong && !expanded
      ? post.content.slice(0, PostConstants.COLLAPSE_THRESHOLD).trimEnd() + "..."
      : post.content;

  async function handleShare() {
    await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    toast({ description: "Đã sao chép liên kết" });
  }

  async function handleBookmark() {
    const prev = bookmarked;
    setBookmarked(!prev);
    try {
      if (prev) {
        await apiUnbookmarkPost(post.id);
      } else {
        await apiBookmarkPost(post.id);
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setBookmarked(prev);
      if (status === 404 || status === undefined) {
        toast({ description: "Tính năng sắp ra mắt" });
      }
    }
  }

  return (
    <article className={styles.card}>
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 pt-4 pb-3 ${onOpenDetail ? "cursor-pointer" : ""}`}
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
            <p className="text-text-primary text-sm font-semibold leading-tight">
              {post.author?.fullName ?? "Unknown"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`flex items-center gap-1 ${styles.muted} text-xs`}
                title={new Date(post.createdAt).toLocaleString("vi-VN")}
              >
                <CalendarDays size={11} />
                {timeAgo(post.createdAt)}
              </span>
              {post.content.length > 100 && (
                <span className={`flex items-center gap-1 ${styles.muted} text-xs`}>
                  <Clock size={11} />
                  {readingTime(post.content)}
                </span>
              )}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className={`p-2 rounded-full hover:bg-white/5 ${styles.muted} hover:text-text-primary transition-colors`}
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-overlay border border-border rounded-xl shadow-2xl z-10 min-w-[130px] overflow-hidden">
                <button
                  onClick={() => { router.push(`/create-post?edit=${post.id}`); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 transition-colors"
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

      {/* Category badge */}
      {post.category && (
        <div
          className={`px-5 pb-2 ${onOpenDetail ? "cursor-pointer" : ""}`}
          onClick={() => onOpenDetail?.(post)}
        >
          <span className={`${styles.badge} ${CATEGORY_STYLES[post.category as PostCategory]}`}>
            {CATEGORY_LABELS[post.category as PostCategory]}
          </span>
        </div>
      )}

      {/* Content */}
      <div
        className={`px-5 pb-2 ${onOpenDetail ? "cursor-pointer" : ""}`}
        onClick={() => onOpenDetail?.(post)}
      >
        <div className="prose prose-sm max-w-none
          [&_p]:text-text-secondary [&_p]:leading-relaxed [&_p]:my-1.5
          [&_h1]:text-text-primary [&_h2]:text-text-primary [&_h3]:text-text-primary
          [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-semibold
          [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:mt-2 [&_h3]:mb-1
          [&_strong]:text-text-primary [&_strong]:font-semibold
          [&_em]:text-text-secondary [&_em]:italic
          [&_a]:text-accent-text [&_a]:no-underline hover:[&_a]:underline
          [&_code]:text-sky-300 [&_code]:bg-slate-800/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
          [&_pre]:bg-slate-900/80 [&_pre]:border [&_pre]:border-border [&_pre]:rounded-xl [&_pre]:p-4
          [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-text-muted [&_blockquote]:italic
          [&_ul]:text-text-secondary [&_ol]:text-text-secondary
          [&_li]:marker:text-text-muted
          [&_hr]:border-border">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
        </div>

        {isLong && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className={`${styles.link} text-sm font-medium mt-1 mb-3`}
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-3" onClick={(e) => e.stopPropagation()}>
          {post.tags.map((raw, i) => {
            const tag = normalizeTag(raw);
            return tag ? (
              <button key={`${tag}-${i}`} onClick={() => onTagClick?.(tag)} className={styles.tag}>
                #{tag}
              </button>
            ) : null;
          })}
        </div>
      )}

      {/* Images */}
      {post.imageUrls?.length > 0 && (
        <div
          className={`grid gap-0.5 ${post.imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"} ${onOpenDetail ? "cursor-pointer" : ""}`}
          onClick={() => onOpenDetail?.(post)}
        >
          {post.imageUrls.slice(0, PostConstants.MAX_IMAGES).map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
      <div className={`flex items-center gap-4 px-5 py-3 border-t ${styles.divider}`}>
        <ReactionButton post={post} />
        <button onClick={() => onOpenDetail?.(post)} className={styles.footerAction}>
          <MessageCircle size={15} />
          <span>{post.commentCount ?? 0}</span>
        </button>
        <span className={`flex items-center gap-1 ${styles.muted} text-xs ml-1`}>
          <Eye size={13} />
          {formatCount(post.viewCount ?? 0)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
            className={`flex items-center gap-1.5 text-sm transition-colors ${bookmarked ? "text-accent-text" : styles.muted + " hover:text-accent-text"}`}
          >
            <Bookmark size={15} className={bookmarked ? "fill-accent-text" : ""} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className={styles.footerAction}
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
