"use client";

import { useEffect, useRef, useState } from "react";
import { Post } from "@/core/types/post";
import { ReactionType } from "@/core/enums";
import { useReactPost } from "@/core/services/client/posts";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: ReactionType.Like,  emoji: "👍", label: "Thích" },
  { type: ReactionType.Love,  emoji: "❤️", label: "Yêu thích" },
  { type: ReactionType.Haha,  emoji: "😆", label: "Haha" },
  { type: ReactionType.Wow,   emoji: "😮", label: "Wow" },
  { type: ReactionType.Sad,   emoji: "😢", label: "Buồn" },
  { type: ReactionType.Angry, emoji: "😡", label: "Tức giận" },
];

const getEmoji = (type: ReactionType) =>
  REACTIONS.find((r) => r.type === type)?.emoji ?? "👍";

const REACTION_COLORS: Record<ReactionType, string> = {
  [ReactionType.Like]:  "text-blue-400",
  [ReactionType.Love]:  "text-red-400",
  [ReactionType.Haha]:  "text-yellow-400",
  [ReactionType.Wow]:   "text-yellow-400",
  [ReactionType.Sad]:   "text-blue-300",
  [ReactionType.Angry]: "text-orange-400",
};

interface ReactionButtonProps {
  post: Post;
}

export default function ReactionButton({ post }: ReactionButtonProps) {
  const { mutate: react } = useReactPost();
  const [showPicker, setShowPicker] = useState(false);

  // Desktop: hover
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mobile: long-press
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside (mobile)
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showPicker]);

  const handleReact = (type: ReactionType) => {
    setShowPicker(false);
    react({ postId: post.id, type });
  };

  // --- Desktop hover ---
  const handleMouseEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setShowPicker(true);
  };

  const handleMouseLeave = () => {
    hoverTimer.current = setTimeout(() => setShowPicker(false), 300);
  };

  // --- Mobile long-press ---
  const handleTouchStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowPicker(true);
    }, 400);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!isLongPress.current) {
      // short tap → toggle current reaction or like
      e.preventDefault();
      handleReact(post.userReaction?.type ?? ReactionType.Like);
    }
  };

  const handleTouchMove = () => {
    // cancel long-press if user scrolls
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    isLongPress.current = false;
  };

  const currentReaction = post.userReaction;
  const activeColor = currentReaction ? REACTION_COLORS[currentReaction.type] : "";

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-2xl shadow-2xl px-2 py-1.5 flex gap-0.5 z-20">
          {REACTIONS.map(({ type, emoji, label }) => (
            <button
              key={type}
              title={label}
              onClick={() => handleReact(type)}
              className={`text-xl p-1.5 rounded-xl hover:bg-surface-raised transition-all hover:scale-125 active:scale-110 ${
                currentReaction?.type === type ? "bg-surface-raised scale-110" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => handleReact(currentReaction?.type ?? ReactionType.Like)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className={`flex items-center gap-1.5 text-sm transition-colors select-none ${
          currentReaction ? activeColor : "text-text-muted hover:text-text-secondary"
        }`}
      >
        <span className="text-base leading-none">
          {currentReaction ? getEmoji(currentReaction.type) : "👍"}
        </span>
        <span className={currentReaction ? activeColor : "text-text-muted"}>
          {post.reactCount}
        </span>
      </button>
    </div>
  );
}
