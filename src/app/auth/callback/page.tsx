"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import axiosInstance from "@/core/lib/axiosInstance";
import { setCredentials } from "@/core/redux/user";
import { AppDispatch } from "@/core/redux/store";
import { tokenStore } from "@/core/auth/token-store";

const CallbackContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const accessToken = searchParams.get("token");
    const refreshToken = searchParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      router.replace("/auth");
      return;
    }

    // Xóa tokens khỏi URL ngay (tránh lộ trong browser history)
    window.history.replaceState({}, "", "/auth/callback");

    const authenticate = async () => {
      try {
        tokenStore.save(accessToken, refreshToken);

        const { data: profile } = await axiosInstance.get("/auth/profile");
        dispatch(setCredentials({ profile, token: accessToken }));

        router.replace("/posts");
      } catch {
        tokenStore.clear();
        router.replace("/auth");
      }
    };

    authenticate();
  }, [searchParams, router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center auth-background">
      <div className="flex flex-col items-center gap-4 text-white/70">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Đang xác thực...</p>
      </div>
    </div>
  );
};

const OAuthCallbackPage = () => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center auth-background">
      <Loader2 className="h-8 w-8 animate-spin text-white/70" />
    </div>
  }>
    <CallbackContent />
  </Suspense>
);

export default OAuthCallbackPage;
