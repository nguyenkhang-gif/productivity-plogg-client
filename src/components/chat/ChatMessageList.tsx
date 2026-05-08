import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { ChatMessage } from "./types";
import ChatMessageItem from "./ChatMessageItem";

export default function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600 select-none">
          <MessageCircle size={32} className="opacity-30" />
          <p className="text-xs">Chưa có tin nhắn nào</p>
        </div>
      ) : (
        messages.map((msg) => <ChatMessageItem key={msg.id} message={msg} />)
      )}
      <div ref={endRef} />
    </div>
  );
}
