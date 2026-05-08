"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { Post } from "@/core/redux/post";
import { useGetPostsFeed, useDeletePost } from "@/core/services/client/posts";
import { PenSquare, Loader2 } from "lucide-react";
import PostCard from "@/components/posts/PostCard";
import PostDetailDialog from "@/components/posts/PostDetailDialog";

export default function PostsPage() {
  const { posts = [], hasMore } = useSelector((state: RootState) => state.post);
  const { profile } = useSelector((state: RootState) => state.user);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const sortedPosts = [...posts].sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sort === "newest" ? -diff : diff;
  });

  const {
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetPostsFeed();

  const { mutate: deletePost } = useDeletePost();

  // IntersectionObserver — tự load thêm khi scroll đến cuối
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
    <div className="min-h-screen bg-[#0b0f1a] px-4 py-8">
      <PostDetailDialog
        post={selectedPost}
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Bảng tin</h1>
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden text-sm">
              <button
                onClick={() => setSort("newest")}
                className={`px-3 py-1.5 transition-colors ${sort === "newest" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Mới nhất
              </button>
              <button
                onClick={() => setSort("oldest")}
                className={`px-3 py-1.5 transition-colors ${sort === "oldest" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                Cũ nhất
              </button>
            </div>
          </div>
          <Link
            href="/create-post"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors"
          >
            <PenSquare size={15} /> Viết bài
          </Link>
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
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={profile.id}
                onDelete={(id) => deletePost(id)}
                onOpenDetail={setSelectedPost}
              />
            ))}

            {/* Trigger element cho IntersectionObserver */}
            <div ref={loaderRef} className="flex justify-center py-6">
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
