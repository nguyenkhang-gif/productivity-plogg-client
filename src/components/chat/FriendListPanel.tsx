import { Users } from "lucide-react";
import Image from "next/image";
import { Friendship } from "@/core/types/friendship";

interface Props {
  friends: Friendship[];
  onStartChat: (friendId: string) => void;
}

export default function FriendListPanel({ friends, onStartChat }: Props) {
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600 select-none">
        <Users size={32} className="opacity-30" />
        <p className="text-xs">Chưa có bạn bè nào</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {friends.map((f) => {
        const info = f.friendInfo;
        const displayName = info?.fullName ?? info?.username ?? f.friendId;
        const initials = displayName.slice(0, 2).toUpperCase();

        return (
          <div
            key={f.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors"
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
              <p className="text-slate-200 text-sm font-medium truncate">{displayName}</p>
              {info?.username && (
                <p className="text-slate-500 text-xs truncate">@{info.username}</p>
              )}
            </div>
            <button
              onClick={() => onStartChat(info?.id ?? f.friendId)}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-medium transition-colors"
            >
              Chat
            </button>
          </div>
        );
      })}
    </div>
  );
}
