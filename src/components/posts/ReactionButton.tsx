"use client";

import { useEffect, useRef, useState } from "react";
import { Post, ReactionType } from "@/core/types/post";
import { useReactPost } from "@/core/services/client/posts";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Thích" },
  { type: "love", emoji: "❤️", label: "Yêu thích" },
  { type: "haha", emoji: "😆", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Buồn" },
  { type: "angry", emoji: "😡", label: "Tức giận" },
];

const getEmoji = (type: ReactionType) =>
  REACTIONS.find((r) => r.type === type)?.emoji ?? "👍";

const REACTION_COLORS: Record<ReactionType, string> = {
  like: "text-blue-400",
  love: "text-red-400",
  haha: "text-yellow-400",
  wow: "text-yellow-400",
  sad: "text-blue-300",
  angry: "text-orange-400",
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
      handleReact(post.userReaction?.type ?? "like");
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
        <div className="absolute bottom-full left-0 mb-2 bg-overlay border border-white/[0.08] rounded-2xl shadow-2xl px-2 py-1.5 flex gap-0.5 z-20">
          {REACTIONS.map(({ type, emoji, label }) => (
            <button
              key={type}
              title={label}
              onClick={() => handleReact(type)}
              className={`text-xl p-1.5 rounded-xl hover:bg-white/10 transition-all hover:scale-125 active:scale-110 ${
                currentReaction?.type === type ? "bg-white/10 scale-110" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => handleReact(currentReaction?.type ?? "like")}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className={`flex items-center gap-1.5 text-sm transition-colors select-none ${
          currentReaction ? activeColor : "text-slate-500 hover:text-slate-300"
        }`}
      >
        <span className="text-base leading-none">
          {currentReaction ? getEmoji(currentReaction.type) : "👍"}
        </span>
        <span className={currentReaction ? activeColor : "text-slate-400"}>
          {post.reactCount}
        </span>
      </button>
    </div>
  );
}
