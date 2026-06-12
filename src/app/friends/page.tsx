"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { useFriendship } from "@/core/hooks/friendship/useFriendship";
import { friendshipApi, UserSearchResult } from "@/core/services/api/friendships";
import {
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Loader2,
  Users,
  Check,
  X,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";

export default function FriendsPage() {
  const { profile } = useSelector((s: RootState) => s.user);
  const { friends, received, sent, isLoading, sendRequest, acceptRequest, rejectRequest, unfriend } = useFriendship();

  const [tab, setTab] = useState<"friends" | "requests" | "search">("friends");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // IDs đã gửi request (từ sent list) để disable nút
  const sentToIds = new Set(sent.map((s) => s.friendId === profile.id ? s.userId : s.friendId));
  const friendIds = new Set(friends.map((f) => f.friendId === profile.id ? f.userId : f.friendId));

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await friendshipApi.searchUsers(query.trim());
        setResults(data.filter((u) => u.id !== profile.id));
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, [query, profile.id]);

  const handleSend = async (userId: string) => {
    setSendingId(userId);
    try { await sendRequest(userId); } finally { setSendingId(null); }
  };

  const handleAccept = async (id: string) => {
    setActionId(id);
    try { await acceptRequest(id); } finally { setActionId(null); }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try { await rejectRequest(id); } finally { setActionId(null); }
  };

  const handleUnfriend = async (friendId: string) => {
    setActionId(friendId);
    try { await unfriend(friendId); } finally { setActionId(null); }
  };

  const TABS = [
    { key: "friends", label: "Bạn bè", count: friends.length },
    { key: "requests", label: "Lời mời", count: received.length },
    { key: "search", label: "Tìm kiếm", count: null },
  ] as const;

  return (
    <div className="min-h-screen bg-page px-4 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <Users size={22} className="text-accent-text" /> Bạn bè
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? "bg-accent text-white" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? "bg-white/20" : "bg-white/10"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search tab */}
        {tab === "search" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 focus-within:border-accent/50 transition-colors">
              <Search size={16} className="text-text-muted flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc username..."
                className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
              />
              {isSearching && <Loader2 size={14} className="text-text-muted animate-spin flex-shrink-0" />}
            </div>

            {results.length > 0 ? (
              <div className="flex flex-col gap-2">
                {results.map((user) => {
                  const isFriend = friendIds.has(user.id);
                  const isPending = sentToIds.has(user.id);
                  return (
                    <div key={user.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                      <UserAvatar name={user.fullName} src={user.profilePic} size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary text-sm font-semibold truncate">{user.fullName}</p>
                        <p className="text-text-muted text-xs">@{user.username}</p>
                      </div>
                      {isFriend ? (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2.5 py-1 rounded-lg">
                          <UserCheck size={13} /> Bạn bè
                        </span>
                      ) : isPending ? (
                        <span className="flex items-center gap-1 text-xs text-text-muted bg-surface px-2.5 py-1 rounded-lg">
                          <Clock size={13} /> Đã gửi
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSend(user.id)}
                          disabled={sendingId === user.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/90 disabled:opacity-40 text-white text-xs font-medium transition-colors"
                        >
                          {sendingId === user.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <UserPlus size={13} />}
                          Kết bạn
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : query.trim() && !isSearching ? (
              <p className="text-text-muted text-sm text-center py-10">Không tìm thấy người dùng nào.</p>
            ) : !query.trim() ? (
              <p className="text-text-muted/50 text-sm text-center py-10">Nhập tên hoặc username để tìm kiếm.</p>
            ) : null}
          </div>
        )}

        {/* Friends tab */}
        {tab === "friends" && (
          isLoading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="text-accent animate-spin" /></div>
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
              <Users size={40} className="opacity-30" />
              <p className="text-sm">Chưa có bạn bè nào.</p>
              <button onClick={() => setTab("search")} className="text-accent-text hover:underline text-sm">Tìm bạn bè →</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {friends.map((f) => {
                const info = f.friendInfo;
                const otherId = f.userId === profile.id ? f.friendId : f.userId;
                return (
                  <div key={f.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                    <UserAvatar name={info?.fullName} src={info?.profilePic} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-semibold truncate">{info?.fullName ?? "—"}</p>
                      <p className="text-text-muted text-xs">@{info?.username ?? "—"}</p>
                    </div>
                    <button
                      onClick={() => handleUnfriend(otherId)}
                      disabled={actionId === otherId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-red-500/50 hover:text-red-400 disabled:opacity-40 text-text-muted text-xs transition-colors"
                    >
                      {actionId === otherId ? <Loader2 size={13} className="animate-spin" /> : <UserX size={13} />}
                      Hủy kết bạn
                    </button>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Requests tab */}
        {tab === "requests" && (
          isLoading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="text-accent animate-spin" /></div>
          ) : received.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
              <UserPlus size={40} className="opacity-30" />
              <p className="text-sm">Không có lời mời kết bạn nào.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {received.map((f) => {
                const info = f.friendInfo;
                return (
                  <div key={f.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                    <UserAvatar name={info?.fullName} src={info?.profilePic} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-semibold truncate">{info?.fullName ?? "—"}</p>
                      <p className="text-text-muted text-xs">@{info?.username ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAccept(f.id)}
                        disabled={actionId === f.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/90 disabled:opacity-40 text-white text-xs font-medium transition-colors"
                      >
                        {actionId === f.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        Chấp nhận
                      </button>
                      <button
                        onClick={() => handleReject(f.id)}
                        disabled={actionId === f.id}
                        className="p-1.5 rounded-lg border border-border hover:border-red-500/50 hover:text-red-400 disabled:opacity-40 text-text-muted transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
