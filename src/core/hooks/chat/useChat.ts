"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/core/redux/store";
import {
  setConversations,
  upsertConversation,
  setHistory,
  appendMessage,
  setTyping,
  setActiveConversation,
  toggleOpen,
  setOpen,
} from "@/core/redux/chat";
import { getChatSocket, disconnectChatSocket } from "@/core/services/socket/chatSocket";
import { Conversation, Message } from "@/components/chat/types";

const TYPING_CLEAR_MS = 2000;

export function useChat() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isAuth } = useSelector((state: RootState) => state.user);
  const { conversations, activeConversationId, messages, typing, isOpen } = useSelector(
    (state: RootState) => state.chat
  );

  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Connect socket and register all event listeners
  useEffect(() => {
    if (!isAuth || !token) return;

    const socket = getChatSocket(token);

    socket.on("connect", () => {
      socket.emit("get_conversations");
    });

    socket.on("conversations", (data: Conversation[]) => {
      dispatch(setConversations(data));
    });

    socket.on("conversation_created", (data: Conversation) => {
      dispatch(upsertConversation(data));
      dispatch(setActiveConversation(data.id));
      socket.emit("join_conversation", { conversationId: data.id });
    });

    socket.on("history", (data: Message[]) => {
      if (!data.length) return;
      dispatch(setHistory({ conversationId: data[0].conversationId, messages: data }));
    });

    socket.on("new_message", (data: Message) => {
      dispatch(appendMessage(data));
    });

    socket.on("user_typing", ({ conversationId }: { userId: string; conversationId: string }) => {
      dispatch(setTyping({ conversationId, isTyping: true }));

      clearTimeout(typingTimers.current[conversationId]);
      typingTimers.current[conversationId] = setTimeout(() => {
        dispatch(setTyping({ conversationId, isTyping: false }));
      }, TYPING_CLEAR_MS);
    });

    socket.on("error", ({ message }: { message: string }) => {
      console.error("[chat socket error]", message);
    });

    return () => {
      socket.off("connect");
      socket.off("conversations");
      socket.off("conversation_created");
      socket.off("history");
      socket.off("new_message");
      socket.off("user_typing");
      socket.off("error");
      disconnectChatSocket();
    };
  // Re-run only when auth state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, token]);

  const openConversation = useCallback(
    (conversationId: string) => {
      dispatch(setActiveConversation(conversationId));
      const socket = getChatSocket(token!);
      socket.emit("join_conversation", { conversationId });
    },
    [token, dispatch]
  );

  const startChat = useCallback(
    (targetUserId: string) => {
      const socket = getChatSocket(token!);
      socket.emit("create_conversation", { targetUserId });
    },
    [token]
  );

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const socket = getChatSocket(token!);
      socket.emit("send_message", { conversationId, content, type: "text" });
    },
    [token]
  );

  const sendTyping = useCallback(
    (conversationId: string) => {
      const socket = getChatSocket(token!);
      socket.emit("typing", { conversationId });
    },
    [token]
  );

  const backToList = useCallback(() => {
    dispatch(setActiveConversation(null));
  }, [dispatch]);

  const openChat = useCallback(() => {
    dispatch(setOpen(true));
  }, [dispatch]);

  const closeChat = useCallback(() => {
    dispatch(setOpen(false));
  }, [dispatch]);

  const toggleChat = useCallback(() => {
    dispatch(toggleOpen());
  }, [dispatch]);

  const activeMessages = activeConversationId ? (messages[activeConversationId] ?? []) : [];
  const isActiveTyping = activeConversationId ? (typing[activeConversationId] ?? false) : false;

  return {
    // state
    conversations,
    activeConversationId,
    activeMessages,
    isActiveTyping,
    isOpen,
    // actions
    openConversation,
    startChat,
    sendMessage,
    sendTyping,
    backToList,
    openChat,
    closeChat,
    toggleChat,
  };
}
