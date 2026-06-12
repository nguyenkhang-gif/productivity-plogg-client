import Link from "next/link";
import { Mail, User, PenSquare, Pencil, Crown, Shield } from "lucide-react";
import { UserProfile } from "@/core/redux/user";
import UserAvatar from "@/components/ui/UserAvatar";

interface Props {
  profile: UserProfile;
  totalPosts: number;
  onEdit: () => void;
  onAvatarClick: () => void;
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center px-6 py-3">
      <span className="text-2xl font-bold text-text-primary">{value}</span>
      <span className="text-xs text-text-muted mt-0.5">{label}</span>
    </div>
  );
}

export default function ProfileCard({ profile, totalPosts, onEdit, onAvatarClick }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8 shadow-xl">
      {/* Banner */}
      <div className="h-24 bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-transparent bg-surface-raised" />

      {/* Avatar + actions */}
      <div className="px-6 pb-6">
        <div className="-mt-10 mb-4 flex items-end justify-between">
          <UserAvatar
            src={profile.profilePic}
            name={profile.fullName ?? profile.username}
            size="xl"
            className="border-4 border-card shadow-xl"
            onClick={onAvatarClick}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-text-secondary rounded-xl text-sm font-medium transition-colors"
            >
              <Pencil size={14} /> Chỉnh sửa
            </button>
            <Link
              href="/create-post"
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <PenSquare size={14} /> Viết bài
            </Link>
          </div>
        </div>

        {/* Name & username */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-primary">{profile.fullName || "—"}</h1>
            {profile.role === "admin" && <Shield size={16} className="text-accent" />}
            {profile.memberShip === "premium" && <Crown size={15} className="text-yellow-400" />}
          </div>
          <p className="text-text-muted text-sm">@{profile.username}</p>
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-2 text-sm">
          {profile.email && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Mail size={14} className="text-text-muted" />
              {profile.email}
            </div>
          )}
          {profile.gender && (
            <div className="flex items-center gap-2 text-text-secondary">
              <User size={14} className="text-text-muted" />
              {profile.gender}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex border-t border-border divide-x divide-border">
        <StatBadge label="Bài viết" value={profile.postCount ?? totalPosts} />
        <StatBadge label="Membership" value={profile.memberShip || "Free"} />
        <StatBadge label="Role" value={profile.role || "User"} />
      </div>
    </div>
  );
}
