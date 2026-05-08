"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useChat } from "@/core/hooks/chat/useChat";
import { useFriendship } from "@/core/hooks/friendship/useFriendship";
import ChatInput from "./ChatInput";
import ConversationList from "./ConversationList";
import FriendListPanel from "./FriendListPanel";
import SocketMessageItem from "./SocketMessageItem";

type Tab = "chats" | "friends";

export default function UserChatBubble() {
  const currentUserId = useSelector((state: RootState) => state.user.profile.id);
  const isAuth = useSelector((state: RootState) => state.user.isAuth);

  const {
    conversations,
    activeConversationId,
    activeMessages,
    isActiveTyping,
    isOpen,
    openConversation,
    startChat,
    sendMessage,
    sendTyping,
    backToList,
    toggleChat,
  } = useChat();

  const { friends, getFriendInfo } = useFriendship();

  const [tab, setTab] = useState<Tab>("chats");
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  useEffect(() => {
    if (!isOpen) {
      setMinimized(false);
      setTab("chats");
    }
  }, [isOpen]);

  // Khi mở conversation từ tab friends → tự chuyển sang tab chats
  const handleStartChat = (friendId: string) => {
    setTab("chats");
    startChat(friendId);
  };

  if (!isAuth) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text || isSending || !activeConversationId) return;
    setIsSending(true);
    sendMessage(activeConversationId, text);
    setInput("");
    setIsSending(false);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (!activeConversationId) return;
    if (typingTimer.current) clearTimeout(typingTimer.current);
    sendTyping(activeConversationId);
    typingTimer.current = setTimeout(() => {}, 2000);
  };

  const headerTitle = (() => {
    if (activeConversationId) {
      const conv = conversations.find((c) => c.id === activeConversationId);
      const otherId = conv?.participants.find((p) => p !== currentUserId) ?? "";
      const info = getFriendInfo(otherId);
      return info?.fullName ?? info?.username ?? otherId;
    }
    return tab === "chats" ? "Tin nhắn" : "Bạn bè";
  })();

  const inChatWindow = !!activeConversationId;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          className={`w-[420px] bg-[#141824] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
            minimized ? "h-12" : "h-[580px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#1a1f2e] flex-shrink-0">
            <div className="flex items-center gap-2">
              {inChatWindow && (
                <button
                  onClick={backToList}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft size={14} />
                </button>
              )}
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white text-sm font-semibold truncate max-w-[140px]">
                {headerTitle}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized((m) => !m)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs leading-none"
              >
                —
              </button>
              <button
                onClick={toggleChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Tab bar — chỉ hiện khi không trong chat window */}
          {!minimized && !inChatWindow && (
            <div className="flex border-b border-white/[0.06] flex-shrink-0">
              {(["chats", "friends"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    tab === t
                      ? "text-blue-400 border-b-2 border-blue-500"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {t === "chats" ? "Chats" : `Bạn bè (${friends.length})`}
                </button>
              ))}
            </div>
          )}

          {!minimized && (
            <>
              {inChatWindow ? (
                <>
                  <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
                    {activeMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-slate-600 text-xs select-none">
                        Chưa có tin nhắn nào
                      </div>
                    ) : (
                      activeMessages.map((msg) => (
                        <SocketMessageItem
                          key={msg.id}
                          message={msg}
                          currentUserId={currentUserId}
                        />
                      ))
                    )}
                    {isActiveTyping && (
                      <div className="flex justify-start">
                        <div className="bg-[#1e2436] border border-white/[0.06] rounded-2xl rounded-bl-sm px-3.5 py-2 flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    )}
                    <div ref={endRef} />
                  </div>
                  <ChatInput
                    value={input}
                    placeholder="Nhập tin nhắn..."
                    isSending={isSending}
                    onChange={handleInputChange}
                    onSend={handleSend}
                  />
                </>
              ) : tab === "chats" ? (
                <ConversationList
                  conversations={conversations}
                  currentUserId={currentUserId}
                  onSelect={openConversation}
                  getFriendInfo={getFriendInfo}
                />
              ) : (
                <FriendListPanel
                  friends={friends}
                  onStartChat={handleStartChat}
                />
              )}
            </>
          )}
        </div>
      )}

      <button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
