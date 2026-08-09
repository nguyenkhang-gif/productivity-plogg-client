"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { Post } from "@/core/types/post";
import { useFriendship } from "@/core/hooks/friendship/useFriendship";
import { BookOpen, Users, Upload, LayoutDashboard, ShieldCheck } from "lucide-react";
import { styles } from "@/core/config/styles";
import { useRole } from "@/core/hooks/useRole";
import UserAvatar from "@/components/ui/UserAvatar";

interface LeftSidebarProps {
  posts?: Post[];
}

const NAV_LINKS = [
  { href: "/posts",     label: "Bảng tin",  icon: LayoutDashboard },
  { href: "/epub",      label: "Epub Gen",  icon: BookOpen },
  { href: "/friends",   label: "Bạn bè",    icon: Users },
  { href: "/upload",    label: "Files",     icon: Upload },
];

export default function LeftSidebar({ posts }: LeftSidebarProps) {
  const pathname = usePathname();
  const { profile } = useSelector((state: RootState) => state.user);
  const { friends } = useFriendship();
  const { canModerate } = useRole();

  const navLinks = canModerate
    ? [...NAV_LINKS, { href: "/admin/posts", label: "Admin", icon: ShieldCheck }]
    : NAV_LINKS;

  const myPostCount = profile.postCount
    ?? (posts ?? []).filter((p) => p.authorId === profile.id || p.author?.id === profile.id).length;

  const friendList = friends.map((f) => f.friendInfo).filter(Boolean).slice(0, 5);

  return (
    <aside className="hidden lg:flex flex-col gap-3 sticky top-[72px]">
      {/* Profile + nav unified card */}
      <div className={`${styles.card} overflow-hidden`}>
        {/* Profile section */}
        <Link href="/profile" className="flex items-center gap-3 px-4 pt-4 pb-3 hover:bg-white/[0.03] transition-colors group">
          <UserAvatar src={profile.profilePic} name={profile.fullName} size="lg" />
          <div className="min-w-0">
            <p className="text-text-primary text-sm font-semibold truncate group-hover:text-accent-text transition-colors">
              {profile.fullName}
            </p>
            <p className={`${styles.muted} text-xs truncate`}>@{profile.username}</p>
          </div>
        </Link>

        {/* Stats row */}
        <div className="flex gap-4 px-4 pb-3 border-b border-border">
          <div>
            <span className="text-text-primary text-sm font-semibold">{myPostCount}</span>
            <span className={`${styles.muted} text-xs ml-1`}>bài</span>
          </div>
          <div>
            <span className="text-text-primary text-sm font-semibold">{friends.length}</span>
            <span className={`${styles.muted} text-xs ml-1`}>bạn</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="p-2">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                  active
                    ? "bg-accent-subtle text-accent-text font-medium"
                    : `${styles.muted} hover:text-text-primary hover:bg-white/[0.04]`
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Friends list — only shown when user has friends */}
      {friendList.length > 0 && (
        <div className={`${styles.card} p-4`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${styles.muted} mb-3`}>Bạn bè</p>
          <div className="flex flex-col gap-2.5">
            {friendList.map((f) => (
              <div key={f!.id} className="flex items-center gap-2.5">
                <div className="relative flex-shrink-0">
                  <UserAvatar src={f!.profilePic} name={f!.fullName} size="xs" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-slate-600 border border-card" />
                </div>
                <span className="text-text-secondary text-xs truncate">{f!.fullName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
