"use client";

import { styles } from "@/core/config/styles";
import { useGetGuild } from "@/core/services/client/guild";
import { usePathname } from "next/navigation";
import Link from "next/link";
import CreateGuildDialog from "./CreateGuildDialog";


export default function GuildRail() {
  const { data: guilds, isLoading } = useGetGuild();
  const pathname = usePathname();

  return (
    <nav className="w-[72px] shrink-0 bg-surface-raised border-r border-border flex flex-col items-center gap-2 py-3 overflow-y-auto">
      {isLoading && (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-2xl bg-card animate-pulse"
            />
          ))}
        </>
      )}

      {!isLoading && guilds?.length === 0 && (
        <p
          className={`${styles.muted} text-[10px] text-center px-1 leading-tight mt-2`}
        >
          Chưa có server
        </p>
      )}

      {guilds?.map((g) => {
        const active = pathname.startsWith(`/guilds/${g.id}`);
        const isUrlIcon = g.icon?.startsWith("http");
        return (
          <Link
            key={g.id}
            href={`/guilds/${g.id}`}
            title={g.name}
            className={`group relative w-12 h-12 flex items-center justify-center text-lg overflow-hidden transition-all
              ${
                active
                  ? "bg-accent text-white rounded-xl"
                  : "bg-card text-text-muted hover:bg-accent hover:text-white rounded-2xl hover:rounded-xl"
              }`}
          >
            {/* thanh chỉ báo active bên trái */}
            <span
              className={`absolute left-0 w-1 rounded-r-full bg-text-primary transition-all
                ${active ? "h-8" : "h-0 group-hover:h-5"}`}
            />
            {isUrlIcon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={g.icon!}
                alt={g.name}
                className="w-full h-full object-cover"
              />
            ) : (
              (g.icon ?? g.name.charAt(0).toUpperCase())
            )}
          </Link>
        );
      })}

      {/* nút tạo server */}
      <CreateGuildDialog />
    </nav>
  );
}
