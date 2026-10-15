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

    // Đọc search trực tiếp thay vì useSearchParams — tránh bắt mọi page bọc Suspense.
    // Cần search để giữ query của link gốc và đọc ?redirect= khi đang ở /auth (#8)
    const redirect = resolveRedirect(pathname, isAuth, role, window.location.search);
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
