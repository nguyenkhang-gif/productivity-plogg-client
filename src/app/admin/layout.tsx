"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/core/hooks/useRole";
import { ShieldCheck, Users } from "lucide-react";
import { styles } from "@/core/config/styles";

const TABS = [
  { href: "/admin/posts", label: "Posts", icon: ShieldCheck, adminOnly: false },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { canModerate, isAdmin } = useRole();
  const pathname = usePathname();

  if (!canModerate) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className={styles.muted}>You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  const tabs = TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <div className="w-[70%] mx-auto py-8 px-4 space-y-4">
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
                active
                  ? "border-accent text-accent-text"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              <Icon size={15} /> {label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
