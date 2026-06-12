"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatBubbleProps, ChatMessage } from "./types";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";

export default function ChatBubble({
  title = "Chat",
  placeholder = "Nhập tin nhắn...",
  onSend,
  messages: externalMessages,
}: ChatBubbleProps) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  const messages = externalMessages ?? internalMessages;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    if (!externalMessages) {
      setInternalMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), content: text, sender: "me", timestamp: new Date() },
      ]);
    }

    setInput("");
    setIsSending(true);
    try {
      await onSend?.(text);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className={`w-80 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
            minimized ? "h-12" : "h-[420px]"
          }`}
        >
          <ChatHeader
            title={title}
            onMinimize={() => setMinimized((m) => !m)}
            onClose={() => setOpen(false)}
          />

          {!minimized && (
            <>
              <ChatMessageList messages={messages} />
              <ChatInput
                value={input}
                placeholder={placeholder}
                isSending={isSending}
                onChange={setInput}
                onSend={handleSend}
              />
            </>
          )}
        </div>
      )}

      <button
        onClick={() => { setOpen((o) => !o); setMinimized(false); }}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
