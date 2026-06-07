"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { Post } from "@/core/types/post";
import { useGetPostsFeed, useDeletePost } from "@/core/services/client/posts";
import { PenSquare, Loader2 } from "lucide-react";
import PostCard from "@/components/posts/PostCard";
import PostDetailDialog from "@/components/posts/PostDetailDialog";

const PRELOAD_BEFORE_END = 3; // bắt đầu load khi còn 3 post cuối chưa qua viewport

export default function PostsPage() {
  const { profile } = useSelector((state: RootState) => state.user);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetPostsFeed();

  const posts: Post[] = data?.pages.flatMap((p) => p.posts) ?? [];
  const hasMore = data?.pages.at(-1)?.hasMore ?? false;

  // selectedPost luôn phản ánh state mới nhất từ RQ cache
  const selectedPost = selectedPostId
    ? (posts.find((p) => p.id === selectedPostId) ?? null)
    : null;

  const sortedPosts = [...posts].sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sort === "newest" ? -diff : diff;
  });

  // index của post sẽ đặt sentinel (3 post trước cuối)
  const sentinelIndex =
    sortedPosts.length > PRELOAD_BEFORE_END
      ? sortedPosts.length - PRELOAD_BEFORE_END - 1
      : -1; // -1 = không đặt sentinel (ít hơn 3 post)

  const { mutate: deletePost } = useDeletePost();

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetchingNextPage, fetchNextPage, sortedPosts.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        Không thể tải bài viết. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page px-4 py-8">
      <PostDetailDialog
        post={selectedPost}
        open={!!selectedPost}
        onClose={() => setSelectedPostId(null)}
      />
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-white shrink-0">Bảng tin</h1>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden text-sm">
              <button
                onClick={() => setSort("newest")}
                className={`px-2.5 md:px-3 py-1.5 transition-colors text-xs md:text-sm ${sort === "newest" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Mới nhất
              </button>
              <button
                onClick={() => setSort("oldest")}
                className={`px-2.5 md:px-3 py-1.5 transition-colors text-xs md:text-sm ${sort === "oldest" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Cũ nhất
              </button>
            </div>
            <Link
              href="/create-post"
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-xs md:text-sm transition-colors shrink-0"
            >
              <PenSquare size={14} /> <span className="hidden sm:inline">Viết bài</span><span className="sm:hidden">Viết</span>
            </Link>
          </div>
        </div>

        {/* Feed */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-slate-500">
            <PenSquare size={48} className="opacity-30" />
            <p>Chưa có bài viết nào.</p>
            <Link href="/create-post" className="text-blue-400 hover:underline text-sm">
              Tạo bài viết đầu tiên →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedPosts.map((post, index) => (
              <div
                key={post.id}
                style={{ contentVisibility: "auto", containIntrinsicSize: "0 500px" }}
              >
                {/* Sentinel đặt ngay trước post thứ (length - 3) */}
                {index === sentinelIndex && (
                  <div ref={sentinelRef} aria-hidden />
                )}
                <PostCard
                  post={post}
                  currentUserId={profile.id}
                  onDelete={(id) => deletePost(id)}
                  onOpenDetail={(post) => setSelectedPostId(post.id)}
                />
              </div>
            ))}

            {/* Bottom: spinner hoặc end message */}
            <div className="flex justify-center py-6">
              {isFetchingNextPage && (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              )}
              {!hasMore && posts.length > 0 && (
                <p className="text-slate-600 text-sm">Đã xem hết bài viết</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
