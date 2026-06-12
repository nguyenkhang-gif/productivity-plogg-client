"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { Post } from "@/core/types/post";
import { useGetPostsFeed, useDeletePost } from "@/core/services/client/posts";
import { PenSquare, Loader2, X } from "lucide-react";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import LeftSidebar from "@/components/posts/sidebar/LeftSidebar";
import RightSidebar from "@/components/posts/sidebar/RightSidebar";
import { SortOrder } from "@/core/enums";
import { styles } from "@/core/config/styles";
import { useInfiniteScroll } from "@/core/hooks/useInfiniteScroll";

const PRELOAD_BEFORE_END = 3;

export default function PostsPage() {
  const { profile } = useSelector((state: RootState) => state.user);
  const [sort, setSort] = useState<SortOrder>(SortOrder.Newest);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetPostsFeed();

  const posts: Post[] = data?.pages.flatMap((p) => p.posts) ?? [];
  const hasMore = data?.pages.at(-1)?.hasMore ?? false;

  const sortedPosts = [...posts].sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sort === SortOrder.Newest ? -diff : diff;
  });

  const normalizeTag = (raw: unknown): string => {
    if (typeof raw === "string") return raw;
    if (raw && typeof raw === "object") {
      const t = raw as Record<string, unknown>;
      return String(t.slug ?? t.name ?? t.id ?? "");
    }
    return String(raw ?? "");
  };

  const filteredPosts = tagFilter
    ? sortedPosts.filter((p) => p.tags?.some((raw) => normalizeTag(raw) === tagFilter))
    : sortedPosts;

  const sentinelIndex =
    filteredPosts.length > PRELOAD_BEFORE_END
      ? filteredPosts.length - PRELOAD_BEFORE_END - 1
      : -1;

  const { mutate: deletePost } = useDeletePost();

  const sentinelRef = useInfiniteScroll({ fetchNextPage, hasNextPage: hasMore, isFetchingNextPage, threshold: 0 });

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-text-muted">
        Không thể tải bài viết. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page pt-4 pb-8">
      <div className="w-full px-4 xl:px-8">
        {/* 3-column grid — sidebars flush to viewport edges on wide screens */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] xl:grid-cols-[280px_1fr_280px] gap-4 xl:gap-6 items-start">
          <LeftSidebar posts={sortedPosts} />

          {/* Center feed */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 h-10">
              <h1 className="text-xl md:text-2xl font-bold text-text-primary shrink-0">Bảng tin</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/[0.04] border border-border rounded-xl overflow-hidden text-sm">
                  <button
                    onClick={() => setSort(SortOrder.Newest)}
                    className={`px-2.5 md:px-3 py-1.5 transition-colors text-xs md:text-sm ${sort === SortOrder.Newest ? "bg-accent text-white" : `${styles.muted} hover:text-text-primary`}`}
                  >
                    Mới nhất
                  </button>
                  <button
                    onClick={() => setSort(SortOrder.Oldest)}
                    className={`px-2.5 md:px-3 py-1.5 transition-colors text-xs md:text-sm ${sort === SortOrder.Oldest ? "bg-accent text-white" : `${styles.muted} hover:text-text-primary`}`}
                  >
                    Cũ nhất
                  </button>
                </div>
                <Link href="/create-post" className={styles.btnPrimary}>
                  <PenSquare size={14} /> <span className="hidden sm:inline">Viết bài</span><span className="sm:hidden">Viết</span>
                </Link>
              </div>
            </div>
            {/* Active tag filter chip */}
            {tagFilter && (
              <div className="flex items-center gap-2">
                <span className={`text-sm ${styles.muted}`}>Lọc theo:</span>
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent-subtle text-accent-text">
                  #{tagFilter}
                  <button onClick={() => setTagFilter(null)} className="hover:text-accent-hover transition-colors">
                    <X size={11} />
                  </button>
                </span>
              </div>
            )}

            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)
            ) : filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-text-muted">
                <PenSquare size={48} className="opacity-30" />
                <p>{tagFilter ? `Không có bài nào với tag #${tagFilter}` : "Chưa có bài viết nào."}</p>
                {!tagFilter && (
                  <Link href="/create-post" className={`${styles.link} text-sm`}>
                    Tạo bài viết đầu tiên →
                  </Link>
                )}
              </div>
            ) : (
              <>
                {filteredPosts.map((post, index) => (
                  <div
                    key={post.id}
                    style={{ contentVisibility: "auto", containIntrinsicSize: "0 500px" }}
                  >
                    {index === sentinelIndex && <div ref={sentinelRef} aria-hidden />}
                    <PostCard
                      post={post}
                      currentUserId={profile.id}
                      onDelete={(id) => deletePost(id)}
                      onTagClick={setTagFilter}
                    />
                  </div>
                ))}

                <div className="flex justify-center py-6">
                  {isFetchingNextPage && <Loader2 className="w-6 h-6 text-accent animate-spin" />}
                  {!hasMore && filteredPosts.length > 0 && (
                    <p className={`${styles.muted} text-sm`}>Đã xem hết bài viết</p>
                  )}
                </div>
              </>
            )}
          </div>

          <RightSidebar
            posts={sortedPosts}
            onTagClick={setTagFilter}
          />
        </div>
      </div>
    </div>
  );
}
