"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useGetPostsByAuthor, useDeletePost } from "@/core/services/client/posts";
import { Post } from "@/core/types/post";
import PostCard from "@/components/posts/PostCard";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import ImagePreviewDialog from "@/components/ui/ImagePreviewDialog";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  User,
  Mail,
  PenSquare,
  Loader2,
  Crown,
  Shield,
  Pencil,
} from "lucide-react";

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center px-6 py-3">
      <span className="text-2xl font-bold text-text-primary">{value}</span>
      <span className="text-xs text-text-muted mt-0.5">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { profile } = useSelector((state: RootState) => state.user);
  const loaderRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-page text-text-primary px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8 shadow-xl">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-transparent dark:from-blue-900/60 dark:via-indigo-900/40 dark:to-slate-900 bg-surface-raised" />

          {/* Avatar + Info */}
          <div className="px-6 pb-6">
            <div className="-mt-10 mb-4 flex items-end justify-between">
              <UserAvatar
                src={profile.profilePic}
                name={profile.fullName ?? profile.username}
                size="xl"
                className="border-4 border-card shadow-xl"
                onClick={() => setPreviewAvatar(true)}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-text-secondary rounded-xl text-sm font-medium transition-colors"
                >
                  <Pencil size={14} /> Chỉnh sửa
                </button>
                <Link
                  href="/create-post"
                  className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <PenSquare size={14} /> Viết bài
                </Link>
              </div>
            </div>

            {/* Name & username */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-text-primary">{profile.fullName || "—"}</h1>
                {profile.role === "admin" && (
                  <Shield size={16} className="text-accent" />
                )}
                {profile.memberShip === "premium" && (
                  <Crown size={15} className="text-yellow-400" />
                )}
              </div>
              <p className="text-text-muted text-sm">@{profile.username}</p>
            </div>

            {/* Info rows */}
            <div className="flex flex-col gap-2 text-sm">
              {profile.email && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail size={14} className="text-text-muted" />
                  {profile.email}
                </div>
              )}
              {profile.gender && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <User size={14} className="text-text-muted" />
                  {profile.gender}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex border-t border-border divide-x divide-border">
            <StatBadge label="Bài viết" value={profile.postCount ?? totalPosts} />
            <StatBadge label="Membership" value={profile.memberShip || "Free"} />
            <StatBadge label="Role" value={profile.role || "User"} />
          </div>
        </div>

        {/* Posts section */}
        <h2 className="text-lg font-semibold text-text-primary mb-4">Bài viết của tôi</h2>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 text-accent animate-spin" />
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
