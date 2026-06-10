"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/core/redux/store";
import { Post } from "@/core/types/post";
import { Flame, Activity, Tag, Users } from "lucide-react";
import { styles } from "@/core/config/styles";

interface RightSidebarProps {
  posts: Post[];
  onTagClick?: (tag: string) => void;
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={13} className="text-accent-text flex-shrink-0" />
      <span className="text-xs font-semibold text-text-secondary tracking-wide uppercase">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border my-4" />;
}

const normalizeTag = (raw: unknown): string => {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") {
    const t = raw as Record<string, unknown>;
    return String(t.slug ?? t.name ?? t.id ?? "");
  }
  return String(raw ?? "");
};

export default function RightSidebar({ posts, onTagClick }: RightSidebarProps) {
  const { profile } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  const trending = [...posts].sort((a, b) => b.reactCount - a.reactCount).slice(0, 5);

  const myPosts = posts.filter((p) => p.authorId === profile.id || p.author?.id === profile.id);
  const totalReactions = myPosts.reduce((sum, p) => sum + (p.reactCount ?? 0), 0);

  const tagFreq: Record<string, number> = {};
  for (const post of posts) {
    for (const raw of post.tags ?? []) {
      const tag = normalizeTag(raw);
      if (tag) tagFreq[tag] = (tagFreq[tag] ?? 0) + 1;
    }
  }
  const topTags = Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);

  return (
    <aside className="hidden lg:flex flex-col gap-4 sticky top-[72px]">
      <div className={`${styles.card} p-4`}>
        {/* Trending */}
        <SectionHeader icon={Flame} label="Nổi bật" />
        {trending.length === 0 ? (
          <p className={`text-xs ${styles.muted}`}>Chưa có bài viết.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {trending.map((post) => (
              <button key={post.id} onClick={() => router.push(`/posts/${post.id}`)} className="text-left group">
                <p className="text-xs text-text-secondary leading-snug group-hover:text-accent-text transition-colors line-clamp-2">
                  {post.content.slice(0, 72).replace(/[#*`]/g, "")}…
                </p>
                <span className={`text-[10px] ${styles.muted} mt-0.5 block`}>
                  {post.reactCount} lượt thích
                </span>
              </button>
            ))}
          </div>
        )}

        <Divider />

        {/* Activity */}
        <SectionHeader icon={Activity} label="Hoạt động của bạn" />
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-text-primary leading-none">{myPosts.length}</p>
            <p className={`text-[10px] ${styles.muted} mt-0.5`}>bài viết</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-text-primary leading-none">{totalReactions}</p>
            <p className={`text-[10px] ${styles.muted} mt-0.5`}>lượt thích</p>
          </div>
        </div>

        <Divider />

        {/* Tag cloud */}
        <SectionHeader icon={Tag} label="Chủ đề" />
        {topTags.length === 0 ? (
          <p className={`text-xs ${styles.muted}`}>Chưa có tag nào.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {topTags.map((tag) => (
              <button key={tag} onClick={() => onTagClick?.(tag)} className={styles.tag}>
                #{tag}
              </button>
            ))}
          </div>
        )}

        <Divider />

        {/* People you may know */}
        <SectionHeader icon={Users} label="Gợi ý kết bạn" />
        <p className={`text-xs ${styles.muted}`}>Tính năng sắp ra mắt.</p>
      </div>
    </aside>
  );
}
