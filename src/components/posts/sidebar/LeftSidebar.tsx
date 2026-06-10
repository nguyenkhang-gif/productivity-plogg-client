"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { Post } from "@/core/types/post";
import { useFriendship } from "@/core/hooks/friendship/useFriendship";
import { FileText, BookOpen, Users, Upload, LayoutDashboard } from "lucide-react";
import { styles } from "@/core/config/styles";

interface LeftSidebarProps {
  posts?: Post[];
}

const NAV_LINKS = [
  { href: "/posts",     label: "Bảng tin",  icon: LayoutDashboard },
  { href: "/epub",      label: "Epub Gen",  icon: BookOpen },
  { href: "/friends",   label: "Bạn bè",    icon: Users },
  { href: "/portfolio", label: "Portfolio", icon: FileText },
  { href: "/upload",    label: "Files",     icon: Upload },
];

export default function LeftSidebar({ posts }: LeftSidebarProps) {
  const pathname = usePathname();
  const { profile } = useSelector((state: RootState) => state.user);
  const { friends } = useFriendship();

  const myPostCount = profile.postCount
    ?? (posts ?? []).filter((p) => p.authorId === profile.id || p.author?.id === profile.id).length;

  const friendList = friends.map((f) => f.friendInfo).filter(Boolean).slice(0, 5);

  return (
    <aside className="hidden lg:flex flex-col gap-3 sticky top-[72px]">
      {/* Profile + nav unified card */}
      <div className={`${styles.card} overflow-hidden`}>
        {/* Profile section */}
        <Link href="/profile" className="flex items-center gap-3 px-4 pt-4 pb-3 hover:bg-white/[0.03] transition-colors group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
            {profile.profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profilePic} alt={profile.fullName} className="w-full h-full object-cover" />
            ) : (
              profile.fullName?.[0]?.toUpperCase() ?? "U"
            )}
          </div>
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
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
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
                <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                  {f!.profilePic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f!.profilePic} alt={f!.fullName} className="w-full h-full object-cover" />
                  ) : (
                    f!.fullName?.[0]?.toUpperCase() ?? "U"
                  )}
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
