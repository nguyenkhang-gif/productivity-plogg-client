"use client";

import { Comment } from "@/core/types/comment";
import { useDeleteComment } from "@/core/services/client/comments";
import { Trash2 } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  postId: string;
}

export default function CommentItem({ comment, currentUserId, postId }: CommentItemProps) {
  const isOwner = comment.authorId === currentUserId || comment.author?.id === currentUserId;
  const { mutate: deleteComment, isPending } = useDeleteComment(postId);

  return (
    <div className="flex gap-3 group">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5 overflow-hidden">
        {comment.author?.profilePic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={comment.author.profilePic} alt={comment.author.fullName} className="w-full h-full object-cover" />
        ) : (
          comment.author?.fullName?.[0]?.toUpperCase() ?? "U"
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-2.5 border border-border">
          <p className="text-text-secondary text-xs font-semibold mb-0.5">
            {comment.author?.fullName ?? "Unknown"}
          </p>
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          {comment.iconUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={comment.iconUrl} alt="" className="mt-2 max-h-24 rounded-lg object-contain" />
          )}
        </div>
        <p className="text-text-muted text-xs mt-1 ml-1">
          {new Date(comment.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      {isOwner && (
        <button
          onClick={() => deleteComment(comment.id)}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 self-start mt-1 p-1.5 rounded-full text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
