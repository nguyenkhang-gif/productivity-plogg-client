"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useGetPostsByAuthor, useDeletePost } from "@/core/services/client/posts";
import { useInfiniteScroll } from "@/core/hooks/useInfiniteScroll";
import { Post } from "@/core/types/post";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import ProfileCard from "@/components/profile/ProfileCard";
import ImagePreviewDialog from "@/components/ui/ImagePreviewDialog";
import { PenSquare, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { profile } = useSelector((state: RootState) => state.user);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(false);

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGetPostsByAuthor(profile.id);

  const { mutate: deletePost } = useDeletePost();

  const posts: Post[] = useMemo(
    () => data?.pages.flatMap((p) => p.posts) ?? [],
    [data]
  );
  const totalPosts = data?.pages[0]?.total ?? 0;

  const loaderRef = useInfiniteScroll({ fetchNextPage, hasNextPage: !!hasNextPage, isFetchingNextPage });

  return (
    <div className="min-h-screen bg-page text-text-primary px-4 py-10">
      <div className="max-w-2xl mx-auto">

        <ProfileCard
          profile={profile}
          totalPosts={totalPosts}
          onEdit={() => setShowEditDialog(true)}
          onAvatarClick={() => setPreviewAvatar(true)}
        />

        {/* Posts section */}
        <h2 className="text-lg font-semibold text-text-primary mb-4">Bài viết của tôi</h2>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-text-muted">
            Không thể tải bài viết. Vui lòng thử lại.
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-text-muted">
            <PenSquare size={40} className="opacity-30" />
            <p>Bạn chưa có bài viết nào.</p>
            <Link href="/create-post" className="text-accent hover:underline text-sm">
              Tạo bài viết đầu tiên →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={profile.id}
                onDelete={(id) => deletePost(id)}
              />
            ))}

            <div ref={loaderRef} className="flex justify-center py-6">
              {isFetchingNextPage && (
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
              )}
              {!hasNextPage && posts.length > 0 && (
                <p className="text-text-muted text-sm">Đã xem hết bài viết</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showEditDialog && (
        <EditProfileDialog
          profile={profile}
          onClose={() => setShowEditDialog(false)}
        />
      )}

      <ImagePreviewDialog
        src={profile.profilePic}
        alt={profile.fullName}
        open={previewAvatar}
        onClose={() => setPreviewAvatar(false)}
      />
    </div>
  );
}
