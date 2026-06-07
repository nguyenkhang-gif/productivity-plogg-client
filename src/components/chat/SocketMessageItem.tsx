import { Message } from "./types";

interface Props {
  message: Message;
  currentUserId: string;
}

export default function SocketMessageItem({ message, currentUserId }: Props) {
  const isMe = message.senderId === currentUserId;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-overlay text-slate-200 border border-white/[0.06] rounded-bl-sm"
        }`}
      >
        <p>{message.content}</p>
        <span
          className={`text-[10px] mt-1 block ${
            isMe ? "text-blue-200/70 text-right" : "text-slate-500"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
