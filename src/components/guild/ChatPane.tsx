"use client";

import { guildApi } from "@/core/services/api/guild";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { Send, Loader2, MessagesSquare, Pencil, Trash2 } from "lucide-react";
import { useGuildSocket } from "@/core/hooks/guild/useGuildSocket";
import { usePermissions } from "@/core/hooks/guild/usePermissions";
import { PERMISSIONS } from "@/core/config/permissions";
import { formatTime } from "@/core/lib/datetime";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Message } from "@/core/types/guild";

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
    channelLoading,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    setMessages,
    sendTyping,
  } = useGuildSocket(guildId, channelId);

  const myId = useSelector((s: RootState) => s.user.profile?.id);
  const { can } = usePermissions(guildId);
  const canManageMessages = can(PERMISSIONS.MANAGE_MESSAGES);

  const [text, setText] = useState("");
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasNewBelow, setHasNewBelow] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null); // gắn vào div cuộn message
  const typingRef = useRef(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);
  const lastIdRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  // CALLBACKS
  const loadOlder = useCallback(async () => {
    if (loadingRef.current || !hasMore || messages.length === 0) return;
    loadingRef.current = true; // khóa đồng bộ ngay, chống race scroll
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    setLoadingOlder(true);
    try {
      const cursor = messages[0].id; // tin cũ nhất đang có
      const older = await guildApi.getMessages(channelId, cursor);
      if (older.length < 30) setHasMore(false); // < limit → hết
      if (older.length > 0) {
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id)); // dedupe an toàn
          const fresh = older
            .slice()
            .reverse()
            .filter((m) => !seen.has(m.id));
          return fresh.length ? [...fresh, ...prev] : prev;
        });
        requestAnimationFrame(() => {
          if (el) el.scrollTop = el.scrollHeight - prevHeight;
        });
      }
    } finally {
      loadingRef.current = false; // mở khóa
      setLoadingOlder(false);
    }
  }, [channelId, messages, hasMore, setMessages]);

  // auto-scroll xuống cuối khi có tin mới (append), KHÔNG scroll khi prepend tin cũ.
  // Phân biệt bằng id tin cuối: prepend → tin cuối không đổi; append → tin cuối đổi.
  // Chỉ auto-scroll nếu user đang ở gần đáy; nếu đang đọc tin cũ → hiện nút "tin mới".
  useEffect(() => {
    const el = scrollRef.current;
    const last = messages[messages.length - 1];
    const wasEmpty = prevLenRef.current === 0; // load đầu / vừa đổi channel
    const isAppend =
      messages.length > prevLenRef.current && last?.id !== lastIdRef.current;
    prevLenRef.current = messages.length;
    lastIdRef.current = last?.id ?? null;

    if (!isAppend || !el) return;

    // Load đầu / đổi channel → luôn nhảy xuống đáy (không animation).
    if (wasEmpty) {
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView());
      return;
    }

    // Tin mới đến khi đang chạy: chỉ cuộn nếu user đang gần đáy.
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setHasNewBelow(true);
    }
  }, [messages]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setHasNewBelow(false);
  };

  // reset pagination + hủy trạng thái edit khi đổi channel (hook đã reset messages)
  useEffect(() => {
    setHasMore(true);
    setEditingId(null);
  }, [channelId]);

  // cleanup typing timer khi đổi channel / unmount (chống bắn "stop" sai channel + leak)
  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingRef.current = false;
    };
  }, [channelId]);

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    sendMessage(content);
    setText("");
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingRef.current = false;
    sendTyping("stop");
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop < 80) loadOlder(); // gần đỉnh (80px) → load tin cũ
    // user tự cuộn lại gần đáy → ẩn nút "tin mới"
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
      setHasNewBelow(false);
    }
  };

  const handleTyping = () => {
    // báo "start" 1 lần khi bắt đầu
    if (!typingRef.current) {
      typingRef.current = true;
      sendTyping("start");
    }
    // reset timer: mỗi lần gõ đẩy lùi thời điểm "stop"
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      typingRef.current = false;
      sendTyping("stop");
    }, 2000); // ngừng gõ 2s → stop
  };

  // ---- message actions (2.3) ----
  const startEdit = (m: Message) => {
    setEditingId(m.id);
    setEditText(m.content);
  };
  const submitEdit = () => {
    const content = editText.trim();
    if (content && editingId) editMessage(editingId, content);
    setEditingId(null);
  };

  return (
    <div className="relative flex flex-1 flex-col min-w-0 min-h-0 bg-page">
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
        className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 flex flex-col gap-3"
      >
        {loadingOlder && (
          <p className="text-center text-xs text-text-muted py-1">Đang tải…</p>
        )}
        {!hasMore && messages.length > 0 && (
          <p className="text-center text-xs text-text-muted py-1">
            Đầu cuộc trò chuyện
          </p>
        )}

        {messages.map((m) => {
          const isOwn = !!myId && m.senderId === myId;
          const isEditing = editingId === m.id;
          // gom reaction theo emoji → đếm
          const reactionGroups = (m.reactions ?? []).reduce<Record<string, number>>(
            (acc, r) => {
              acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
              return acc;
            },
            {},
          );

          return (
            <div key={m.id} className="group relative flex gap-2.5">
              <UserAvatar
                name={m.senderName}
                src={m.senderAvatar}
                size="sm"
                className="mt-0.5"
              />
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {m.senderName}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {formatTime(m.createdAt)}
                  </span>
                  {m.editedAt && !m.isDeleted && (
                    <span className="text-[10px] italic text-text-muted">
                      (đã sửa)
                    </span>
                  )}
                </div>

                {m.isDeleted ? (
                  <p className="text-sm italic text-text-muted">Tin nhắn đã xóa</p>
                ) : isEditing ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitEdit();
                      }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    className="text-sm bg-card border border-border rounded px-2 py-1 text-text-primary focus:outline-none focus:border-accent"
                  />
                ) : (
                  <p className="text-sm text-text-secondary break-words">
                    {m.content}
                  </p>
                )}

                {/* reactions */}
                {Object.keys(reactionGroups).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(reactionGroups).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(m.id, emoji)}
                        className="rounded-full border border-border bg-surface px-1.5 py-0.5 text-xs hover:border-accent transition-colors"
                      >
                        {emoji} {count}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* action bar — hiện khi hover */}
              {!m.isDeleted && !isEditing && (
                <div className="absolute right-0 top-0 flex items-center gap-0.5 rounded-md border border-border bg-card px-1 py-0.5 opacity-0 shadow transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => addReaction(m.id, "👍")}
                    title="Thích"
                    className="p-1 text-sm leading-none text-text-muted hover:text-text-primary"
                  >
                    👍
                  </button>
                  {/* Sửa: chỉ tin của mình */}
                  {isOwn && (
                    <button
                      onClick={() => startEdit(m)}
                      title="Sửa"
                      className="p-1 text-text-muted hover:text-text-primary"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {/* Xóa: tin của mình HOẶC có quyền MANAGE_MESSAGES */}
                  {(isOwn || canManageMessages) && (
                    <button
                      onClick={() => deleteMessage(m.id)}
                      title="Xóa"
                      className="p-1 text-text-muted hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {messages.length === 0 &&
          (!connected ? (
            <EmptyState
              icon={Loader2}
              title="Đang kết nối…"
              className="flex-1 [&_svg]:animate-spin"
            />
          ) : channelLoading ? (
            <EmptyState
              icon={Loader2}
              title="Đang tải tin nhắn…"
              className="flex-1 [&_svg]:animate-spin"
            />
          ) : (
            <EmptyState
              icon={MessagesSquare}
              title="Chưa có tin nhắn"
              description="Hãy bắt đầu cuộc trò chuyện."
              className="flex-1"
            />
          ))}
        <div ref={bottomRef} />
      </div>

      {/* nút "tin nhắn mới" — hiện khi có tin mới lúc user đang đọc tin cũ */}
      {hasNewBelow && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-medium shadow-lg hover:bg-blue-500 transition-colors"
        >
          ↓ Tin nhắn mới
        </button>
      )}

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
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
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
