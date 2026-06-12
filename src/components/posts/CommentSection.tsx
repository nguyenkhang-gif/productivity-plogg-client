"use client";

import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useGetComments, useCreateComment } from "@/core/services/client/comments";
import { Comment } from "@/core/types/comment";
import FilePicker from "@/components/upload/FilePicker";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import CommentItem from "./CommentItem";
import UserAvatar from "@/components/ui/UserAvatar";
import { useInfiniteScroll } from "@/core/hooks/useInfiniteScroll";

export default function CommentSection({ postId }: { postId: string }) {
  const { profile } = useSelector((state: RootState) => state.user);
  const { data, isLoading, isFetchingNextPage, fetchNextPage } = useGetComments(postId);
  const comments: Comment[] = data?.pages.flatMap((p) => p.comments) ?? [];
  const hasMore = data?.pages.at(-1)?.hasMore ?? false;

  const [text, setText] = useState("");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { mutate: createComment, isPending: isPosting } = useCreateComment(postId);

  const loaderRef = useInfiniteScroll({ fetchNextPage, hasNextPage: hasMore, isFetchingNextPage, threshold: 0.1 });

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isPosting) return;
    createComment(
      { content: trimmed, iconUrl: iconUrl ?? undefined },
      { onSuccess: () => { setText(""); setIconUrl(null); } }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3 px-1">
        Bình luận
      </p>

      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-6">Chưa có bình luận nào.</p>
        ) : (
          comments.map((c) => (
            <CommentItem key={c.id} comment={c} currentUserId={profile.id} postId={postId} />
          ))
        )}

        <div ref={loaderRef} className="flex justify-center py-2">
          {isFetchingNextPage && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
          {!hasMore && comments.length > 0 && (
            <p className="text-text-muted text-xs">Đã xem hết bình luận</p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex gap-2">
          <UserAvatar src={profile.profilePic} name={profile.fullName} size="sm" className="mt-1" />
          <div className="flex-1 bg-surface border border-border rounded-xl focus-within:border-accent/50 transition-colors">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Viết bình luận... (Enter để gửi, Shift+Enter xuống dòng)"
              rows={3}
              className="w-full bg-transparent px-3 pt-2.5 pb-1 text-sm text-text-secondary placeholder:text-text-muted resize-none focus:outline-none"
            />

            {iconUrl && (
              <div className="px-3 pb-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={iconUrl} alt="" className="h-10 rounded-lg object-contain border border-border" />
                <button
                  type="button"
                  onClick={() => setIconUrl(null)}
                  className="p-1 rounded-full text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between px-2 pb-2">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className={`p-1.5 rounded-lg transition-colors ${iconUrl ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-secondary hover:bg-surface-raised"}`}
                title="Đính kèm icon"
              >
                <ImagePlus size={15} />
              </button>
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || isPosting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
              >
                {isPosting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>

      <FilePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => { setIconUrl(url); setPickerOpen(false); }}
      />
    </div>
  );
}
