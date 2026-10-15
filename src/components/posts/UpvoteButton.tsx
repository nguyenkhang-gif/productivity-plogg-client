"use client";

import { ArrowBigUp } from "lucide-react";
import { Post } from "@/core/types/post";
import { ReactionType } from "@/core/enums";
import { useReactPost } from "@/core/services/client/posts";
import { formatCount } from "@/core/lib/formatCount";
interface UpvoteButtonProps {
  post: Post;
}

export default function UpvoteButton({ post }: UpvoteButtonProps) {
  const { mutate: react, isPending } = useReactPost();
  const voted = !!post.userReaction;

  // Gửi lại ĐÚNG loại reaction user đang giữ, không gửi cứng Like: tài khoản cũ
  // còn reaction love/haha, gửi like sẽ bị BE hiểu là đổi loại → không rút được phiếu.
  const handleVote = () =>
    react({
      postId: post.id,
      type: post.userReaction?.type ?? ReactionType.Like,
    });

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      aria-pressed={voted}
      aria-label={voted ? "Bỏ upvote" : "Upvote"}
      title={voted ? "Bỏ upvote" : "Upvote"}
      // Exactly one text color at a time: two color utilities on one element
      // resolve by stylesheet order, not className order.
      className={`flex items-center gap-1.5 text-sm transition-colors select-none ${
        voted ? "text-accent-text" : "text-text-muted hover:text-accent-text"
      }`}
    >
      <ArrowBigUp size={17} className={voted ? "fill-current" : ""} />
      <span>{formatCount(post.reactCount)}</span>
    </button>
  );
}
