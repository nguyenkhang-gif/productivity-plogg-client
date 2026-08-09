import { RootState } from "@/core/redux/store";
import { getGuildSocket } from "@/core/services/socket/guildSocket";
import { Message } from "@/core/types/guild";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

interface TypingUser {
  userId: string;
  username: string;
}

export function useGuildSocket(guildId?: string, channelId?: string) {
  const token = useSelector((s: RootState) => s.user.token);

  const [connected, setConnected] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [store, setStore] = useState<{
    byId: Record<string, Message>;
    order: string[];
  }>({
    byId: {},
    order: [],
  });

  const messages = useMemo(
    () => store.order.map((id) => store.byId[id]),
    [store],
  );
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [channelLoading, setChannelLoading] = useState(false); // chờ ack join_channel
  const socketRef = useRef<ReturnType<typeof getGuildSocket> | null>(null);

  // Ref giữ id mới nhất để onConnect (đóng băng trong closure [token]) luôn re-join đúng.
  const guildIdRef = useRef(guildId);
  const channelIdRef = useRef(channelId);
  useEffect(() => {
    guildIdRef.current = guildId;
  }, [guildId]);
  useEffect(() => {
    channelIdRef.current = channelId;
  }, [channelId]);

  useEffect(() => {
    if (!token) return;
    const socket = getGuildSocket(token);
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      setAuthError(null);
      // Re-join mỗi lần (re)connect — kể cả sau reconnect, khi `connected`
      // không toggle nên effect join không tự chạy lại. Đọc id qua ref để
      // luôn lấy giá trị mới nhất (onConnect bị đóng băng trong closure [token]).
      if (guildIdRef.current)
        socket.emit("join_guild", { guildId: guildIdRef.current });
      if (channelIdRef.current)
        socket.emit("join_channel", { channelId: channelIdRef.current });
    };
    const onDisconnect = () => setConnected(false);
    const onConnectError = (err: Error) => {
      setConnected(false);
      setAuthError(err.message);
    };

    const onException = (e: unknown) =>
      console.warn("[guild ws] exception:", e);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("exception", onException);

    // Socket là singleton: khi ChatPane remount (rời rồi quay lại channel),
    // socket có thể ĐÃ connected sẵn → sự kiện 'connect' KHÔNG bắn lại →
    // onConnect không chạy → `connected` kẹt false → không join. Chủ động
    // set connected + re-join guild để join_channel effect chạy lại.
    if (socket.connected) {
      setConnected(true);
      setAuthError(null);
      if (guildIdRef.current)
        socket.emit("join_guild", { guildId: guildIdRef.current });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("exception", onException);
    };
  }, [token]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected || !channelId) return;
    let cancelled = false;
    setMessages([]);
    setChannelLoading(true);
    socket.emit(
      "join_channel",
      { channelId },
      (res: { status: string; data?: { messages: Message[] } }) => {
        if (cancelled) return;
        // API trả desc (mới→cũ) → reverse thành cũ→mới cho khớp
        // loadOlder (prepend tin cũ) và onNew (append tin mới xuống đáy).
        if (res?.data?.messages)
          setMessages(res.data.messages.slice().reverse());
        setChannelLoading(false);
      },
    );

    return () => {
      cancelled = true;
      socket.emit("leave_channel", { channelId });
    };
  }, [connected, channelId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onNew = (msg: Message) => {
      if (msg.channelId !== channelId) return;
      setStore((prev) => {
        if (prev.byId[msg.id]) return prev;
        return {
          byId: {
            ...prev.byId,
            [msg.id]: msg,
          },
          order: [...prev.order, msg.id],
        };
      });
    };

    const onEdited = ({
      messageId,
      content,
      editedAt,
    }: {
      messageId: string;
      content: string;
      editedAt: string;
    }) =>
      setStore((prev) => {
        const existing = prev.byId[messageId];
        if (!existing) return prev; // tin không thuộc channel đang mở -> không đổi gì, không re-render
        return {
          ...prev,
          byId: {
            ...prev.byId,
            [messageId]: { ...existing, content, editedAt },
          },
        };
      });

    const onDeleted = ({ messageId }: { messageId: string }) =>
      setStore((prev) => {
        const existing = prev.byId[messageId];
        if (!existing) return prev; // tin không thuộc channel đang mở -> bail out
        return {
          ...prev,
          byId: { ...prev.byId, [messageId]: { ...existing, isDeleted: true } },
        };
      });

    const onReaction = ({
      messageId,
      emoji,
      userId,
    }: {
      messageId: string;
      emoji: string;
      userId: string;
    }) =>
      setStore((prev) => {
        const existing = prev.byId[messageId];
        if (!existing) return prev; // tin không thuộc channel đang mở -> bail out
        const reactions = existing.reactions ?? [];
        const exists = reactions.some(
          (r) => r.emoji === emoji && r.userId === userId,
        );
        const nextReactions = exists
          ? reactions.filter((r) => !(r.emoji === emoji && r.userId === userId))
          : [...reactions, { emoji, userId }];
        return {
          ...prev,
          byId: {
            ...prev.byId,
            [messageId]: { ...existing, reactions: nextReactions },
          },
        };
      });

    const onTyping = ({
      userId,
      username,
      action,
    }: {
      userId: string;
      username: string;
      action: "start" | "stop";
    }) =>
      setTypingUsers((prev) =>
        action === "start"
          ? prev.some((u) => u.userId === userId)
            ? prev
            : [...prev, { userId, username }]
          : prev.filter((u) => u.userId !== userId),
      );

    socket.on("new_message", onNew);
    socket.on("message_edited", onEdited);
    socket.on("message_deleted", onDeleted);
    socket.on("reaction_updated", onReaction);
    socket.on("typing_update", onTyping);
    return () => {
      socket.off("new_message", onNew);
      socket.off("message_edited", onEdited);
      socket.off("message_deleted", onDeleted);
      socket.off("reaction_updated", onReaction);
      socket.off("typing_update", onTyping);
    };
    // `connected` để bind lại listener khi socket được tạo muộn (token đến sau). (Bug #6)
  }, [channelId, connected]);

  const sendMessage = useCallback(
    (content: string, replyToId?: string) => {
      if (!channelId) return;
      socketRef.current?.emit("send_message", {
        channelId,
        content,
        replyToId,
      });
    },
    [channelId],
  );

  const setMessages = useCallback(
    (updater: React.SetStateAction<Message[]>) => {
      setStore((prev) => {
        const prevArray = prev.order.map((id) => prev.byId[id]);
        const nextArray =
          typeof updater === "function"
            ? (updater as (p: Message[]) => Message[])(prevArray)
            : updater;

        const byId: Record<string, Message> = {};
        const order: string[] = [];
        for (const m of nextArray) {
          byId[m.id] = m;
          order.push(m.id);
        }
        return { byId, order };
      });
    },
    [],
  );
  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (channelId)
        socketRef.current?.emit("edit_message", {
          messageId,
          channelId,
          content,
        });
    },
    [channelId],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (channelId)
        socketRef.current?.emit("delete_message", { messageId, channelId });
    },
    [channelId],
  );

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (channelId)
        socketRef.current?.emit("add_reaction", {
          messageId,
          channelId,
          emoji,
        });
    },
    [channelId],
  );

  const sendTyping = useCallback(
    (action: "start" | "stop") => {
      if (channelId) socketRef.current?.emit("typing", { channelId, action });
    },
    [channelId],
  );

  return {
    connected,
    authError,
    messages,
    channelLoading,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    sendTyping,
    setMessages,
  };
}
