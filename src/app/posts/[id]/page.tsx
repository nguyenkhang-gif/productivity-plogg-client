"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useGetPostById, useDeletePost } from "@/core/services/client/posts";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Trash2, Pencil, CalendarDays, Heart } from "lucide-react";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useSelector((state: RootState) => state.user);
  const { selectedPost: post } = useSelector((state: RootState) => state.post);

  const { isLoading, isError } = useGetPostById(id);
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const handleDelete = () => {
    if (!confirm("Xóa bài viết này?")) return;
    deletePost(id, { onSuccess: () => router.replace("/posts") });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <p>Không tìm thấy bài viết.</p>
        <Link href="/posts" className="text-blue-400 hover:underline text-sm">
          ← Quay lại
        </Link>
      </div>
    );
  }

  const isOwner = post.author?.id === profile.id || post.authorId === profile.id;

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/posts"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Bảng tin
          </Link>

          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/create-post?edit=${id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Pencil size={14} /> Chỉnh sửa
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-700 hover:border-red-500 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} /> Xóa
              </button>
            </div>
          )}
        </div>

        {/* Cover images */}
        {post.imageUrls.length > 0 && (
          <img
            src={post.imageUrls[0]}
            alt=""
            className="w-full h-64 object-cover rounded-2xl mb-8 border border-slate-800"
          />
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {post.author?.fullName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="text-slate-100 text-sm font-semibold">{post.author?.fullName ?? "Unknown"}</p>
            <p className="text-slate-500 text-xs">@{post.author?.username}</p>
            <span className="flex items-center gap-1.5 text-slate-500 text-xs">
              <CalendarDays size={12} />
              {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <hr className="border-slate-800 mb-8" />

        {/* Content */}
        <article className="prose prose-invert prose-slate max-w-none
          prose-headings:text-white prose-headings:font-semibold
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-code:text-blue-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800
          prose-blockquote:border-blue-500 prose-blockquote:text-slate-400
          prose-strong:text-white prose-hr:border-slate-800">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-800 text-slate-400 text-sm">
          <Heart size={16} className="text-red-400" />
          <span>{post.likesCount} lượt thích</span>
        </div>
      </div>
    </div>
  );
}
