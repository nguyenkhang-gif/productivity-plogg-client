"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import axiosInstance from "@/core/lib/axiosInstance";
import { setCredentials } from "@/core/redux/user";
import { AppDispatch } from "@/core/redux/store";

const CallbackContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get("token");
    if (!token) {
      router.replace("/auth");
      return;
    }

    const authenticate = async () => {
      try {
        localStorage.setItem("token", token);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const { data: profile } = await axiosInstance.get("/auth/profile");
        dispatch(setCredentials({ profile, token }));

        router.replace("/posts");
      } catch {
        localStorage.removeItem("token");
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
