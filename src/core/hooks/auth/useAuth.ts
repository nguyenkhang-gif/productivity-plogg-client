import { useEffect, useCallback } from "react";
import axiosInstance from "@/core/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/core/redux/store";
import { setCredentials, setAuthLoading, logout } from "@/core/redux/user";

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, token, isAuth, isLoading } = useSelector(
    (state: RootState) => state.user
  );

  const signOut = useCallback(() => {
    dispatch(logout());
    localStorage.removeItem("token");
    router.push("/auth");
  }, [dispatch, router]);

  // Chỉ chạy một lần khi app mount để khôi phục session từ localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        dispatch(setAuthLoading(false));
        return;
      }
      try {
        const { data } = await axiosInstance.get("/auth/profile");
        dispatch(setCredentials({ profile: data, token: storedToken }));
      } catch {
        dispatch(logout());
        localStorage.removeItem("token");
      }
    };

    restoreSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    profile,
    token,
    isAuth,
    isLoading,
    signOut,
  };
};
