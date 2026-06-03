import { useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "@/core/lib/axiosInstance";
import { AppDispatch } from "@/core/redux/store";
import { setCredentials } from "@/core/redux/user";
import { tokenStore } from "@/core/auth/token-store";

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
    async (identifier: string, password: string, options?: Options) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");

        const res = await axiosInstance.post("/auth/login", {
          identifier,
          password,
        });

        const { access_token, refresh_token } = res.data;
        tokenStore.save(access_token, refresh_token);

        const { data: profile } = await axiosInstance.get("/auth/profile");
        dispatch(setCredentials({ profile, token: access_token }));

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

        const res = await axiosInstance.post("/auth/register", {
          fullName,
          username,
          email,
          password,
          confirmPassword,
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
