import axios from "axios";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/core/redux/store";
import { setCredentials, setAuthLoading, logout } from "@/core/redux/user";
import { tokenStore } from "@/core/auth/token-store";
import axiosInstance from "@/core/lib/axiosInstance";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, token, isAuth, isLoading } = useSelector(
    (state: RootState) => state.user
  );

  const signOut = useCallback(async () => {
    const refreshToken = tokenStore.getRefresh();
    try {
      await axiosInstance.post("/auth/logout", { refresh_token: refreshToken });
    } catch {
      // vẫn clear dù server lỗi
    } finally {
      tokenStore.clear();
      dispatch(logout());
      router.push("/auth");
    }
  }, [dispatch, router]);

  // Chạy 1 lần khi app mount — khôi phục session qua refresh token
  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = tokenStore.getRefresh();
      if (!refreshToken) {
        dispatch(setAuthLoading(false));
        return;
      }
      try {
        // Dùng axios thuần để tránh vòng lặp với interceptor của instance
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        }, { timeout: 5000 });
        tokenStore.save(data.access_token, data.refresh_token);

        const { data: profile } = await axiosInstance.get("/auth/profile");
        dispatch(setCredentials({ profile, token: data.access_token }));
      } catch {
        tokenStore.clear();
        dispatch(logout());
      }
    };

    restoreSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { profile, token, isAuth, isLoading, signOut };
};
