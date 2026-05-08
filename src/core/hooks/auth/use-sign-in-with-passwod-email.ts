import { useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "@/core/lib/axiosInstance";
import { ENDPOINTS } from "@/core/endpoints";
import { AppDispatch } from "@/core/redux/store";
import { setCredentials } from "@/core/redux/user";

interface Options {
  onSuccess?: (data: object) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
}

export const useLoginWithPasswordEmail = () => {
  const [data, setData] = useState<ResponseType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<
    "success" | "error" | "settled" | "pending" | null
  >(null);
  const dispatch = useDispatch<AppDispatch>();

  const isPending = useMemo(() => status === "pending", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);

  const login = useCallback(
    async (username: string, password: string, options?: Options) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");

        const res = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, {
          identifier: username,
          password,
        });

        const token = res.data.access_token;
        localStorage.setItem("token", token);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Fetch profile và cập nhật Redux ngay — trước khi onSuccess/navigate
        const { data: profile } = await axiosInstance.get("/auth/profile");
        dispatch(setCredentials({ profile, token }));

        setData(res.data);
        setStatus("success");
        options?.onSuccess?.(res.data);
        return res.data;
      } catch (error) {
        setStatus("error");
        setError(error as Error);
        options?.onError?.(error as Error);
        if (options?.throwError) throw error;
      } finally {
        setStatus("settled");
        options?.onSettled?.();
      }
    },
    [dispatch]
  );

  const signUp = useCallback(
    async (
      fullName: string,
      username: string,
      email: string,
      password: string,
      confirmPassword: string,
      gender: string,
      options?: Options
    ) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");

        const res = await axiosInstance.post("/auth/signup", {
          fullName,
          username,
          password,
          confirmPassword,
          email,
          gender,
        });

        setData(res.data);
        setStatus("success");
        options?.onSuccess?.(res.data);
        return res.data;
      } catch (error) {
        setStatus("error");
        setError(error as Error);
        options?.onError?.(error as Error);
        if (options?.throwError) throw error;
      } finally {
        setStatus("settled");
        options?.onSettled?.();
      }
    },
    []
  );

  return {
    login,
    signUp,
    data,
    error,
    isError,
    isPending,
    isSettled,
    isSuccess,
  };
};
