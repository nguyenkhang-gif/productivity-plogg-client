"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { resolveRedirect } from "@/core/config/routes";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuth, isLoading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (isLoading) return; // chờ auth check xong

    const redirect = resolveRedirect(pathname, isAuth);
    if (redirect) router.replace(redirect);
  }, [isAuth, isLoading, pathname, router]);

  // Đang loading auth → chưa render gì
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white/50">
        Loading...
      </div>
    );
  }

  // Cần redirect → không render children (tránh flash nội dung)
  const redirect = resolveRedirect(pathname, isAuth);
  if (redirect) return null;

  return <>{children}</>;
}
