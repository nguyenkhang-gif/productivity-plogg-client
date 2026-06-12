import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { Conversation } from "./types";
import { FriendInfo } from "@/core/types/friendship";

interface Props {
  conversations: Conversation[];
  currentUserId: string;
  onSelect: (conversationId: string) => void;
  getFriendInfo: (userId: string) => FriendInfo | undefined;
}

export default function ConversationList({ conversations, currentUserId, onSelect, getFriendInfo }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-text-muted select-none">
        <MessageCircle size={32} className="opacity-30" />
        <p className="text-xs">Chưa có cuộc trò chuyện nào</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => {
        const otherId = conv.participants.find((p) => p !== currentUserId) ?? "";
        const info = getFriendInfo(otherId);
        const displayName = info?.fullName ?? info?.username ?? otherId;
        const initials = displayName.slice(0, 2).toUpperCase();

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-raised transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-blue-600/30 border border-blue-500/30 flex items-center justify-center">
              {info?.profilePic ? (
                <Image
                  src={info.profilePic}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-blue-300 text-xs font-semibold">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">{displayName}</p>
              <p className="text-text-muted text-xs truncate mt-0.5">
                {conv.lastMessage ?? "Bắt đầu cuộc trò chuyện"}
              </p>
            </div>
            {conv.lastMessageAt && (
              <span className="text-text-muted text-[10px] flex-shrink-0">
                {new Date(conv.lastMessageAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
