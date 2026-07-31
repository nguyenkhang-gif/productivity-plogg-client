"use client";

import { guildApi } from "@/core/services/api/guild";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useGuildSocket } from "@/core/hooks/guild/useGuildSocket";
import { formatTime } from "@/core/lib/datetime";
import { styles } from "@/core/config/styles";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/UserAvatar";

export default function ChatPane({
  guildId,
  channelId,
}: {
  guildId: string;
  channelId: string;
}) {
  const {
    connected,
    authError,
    messages,
    typingUsers,
    sendMessage,
    setMessages,
  } = useGuildSocket(guildId, channelId);

  const [text, setText] = useState("");
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null); // gắn vào div cuộn message

  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);
  const lastIdRef = useRef<string | null>(null);

  // CALLBACKS
  const loadOlder = useCallback(async () => {
    if (loadingOlder || !hasMore || messages.length === 0) return;
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    setLoadingOlder(true);
    try {
      const cursor = messages[0].id; // tin cũ nhất đang có
      const older = await guildApi.getMessages(channelId, cursor);
      if (older.length < 30) setHasMore(false); // < limit → hết
      if (older.length > 0) {
        // API trả "mới nhất trước" → reverse để cũ→mới rồi prepend
        setMessages((prev) => [...older.slice().reverse(), ...prev]);
        requestAnimationFrame(() => {
          if (el) el.scrollTop = el.scrollHeight - prevHeight;
        });
      }
    } finally {
      setLoadingOlder(false);
    }
  }, [channelId, messages, loadingOlder, hasMore, setMessages]);

  // auto-scroll xuống cuối khi có tin mới (append), KHÔNG scroll khi prepend tin cũ.
  // Phân biệt bằng id tin cuối: prepend → tin cuối không đổi; append → tin cuối đổi.
  useEffect(() => {
    const last = messages[messages.length - 1];
    const appendedAtBottom =
      messages.length > prevLenRef.current && last?.id !== lastIdRef.current;
    prevLenRef.current = messages.length;
    lastIdRef.current = last?.id ?? null;
    if (appendedAtBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // reset pagination khi đổi channel (hook đã reset messages)
  useEffect(() => {
    setHasMore(true);
  }, [channelId]);

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    sendMessage(content);
    setText("");
  };

  // FUNTIONCS
  const handleScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop < 80) loadOlder(); // gần đỉnh (80px)
  };

  return (
    <div className="flex flex-1 flex-col min-w-0 min-h-0 bg-page">
      {/* trạng thái kết nối */}
      {authError && (
        <div className="px-4 py-2 text-xs text-red-400 bg-red-500/10 border-b border-border">
          Lỗi kết nối: {authError}
        </div>
      )}

      {/* danh sách message */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
      >
        {loadingOlder && (
          <p className="text-center text-xs text-text-muted py-1">Đang tải…</p>
        )}
        {!hasMore && messages.length > 0 && (
          <p className="text-center text-xs text-text-muted py-1">
            Đầu cuộc trò chuyện
          </p>
        )}

        {messages.map((m) => (
          <div key={m.id} className="flex gap-2.5">
            <UserAvatar
              name={m.senderName}
              src={m.senderAvatar}
              size="sm"
              className="mt-0.5"
            />
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {m.senderName}
                </span>
                <span className="text-[11px] text-text-muted">
                  {formatTime(m.createdAt)}
                </span>
              </div>
              <p className="text-sm text-text-secondary break-words">
                {m.isDeleted ? (
                  <span className="italic text-text-muted">
                    Tin nhắn đã xóa
                  </span>
                ) : (
                  m.content
                )}
              </p>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <p className={`${styles.muted} text-sm text-center mt-8`}>
            Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện.
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-text-muted">
          {typingUsers.map((u) => u.username).join(", ")} đang gõ…
        </div>
      )}

      {/* composer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 focus-within:border-accent transition-colors">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={!connected}
            placeholder={connected ? "Nhắn tin…" : "Đang kết nối…"}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSend}
            disabled={!connected || !text.trim()}
            aria-label="Gửi"
            className="h-8 w-8 text-text-muted hover:text-accent-text"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
