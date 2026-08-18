"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { resolveRedirect } from "@/core/config/routes";
import { useRouteRole } from "@/core/hooks/useNavItems";
import LoadingScreen from "./LoadingScreen";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuth, isLoading } = useSelector((state: RootState) => state.user);
  const role = useRouteRole();

  useEffect(() => {
    if (isLoading) return; // chờ auth check xong

    const redirect = resolveRedirect(pathname, isAuth, role);
    if (redirect) router.replace(redirect);
  }, [isAuth, isLoading, pathname, role, router]);

  // Đang loading auth → chưa render gì
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Cần redirect → không render children (tránh flash nội dung)
  const redirect = resolveRedirect(pathname, isAuth, role);
  if (redirect) return null;

  return <>{children}</>;
}
