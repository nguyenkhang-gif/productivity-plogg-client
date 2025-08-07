import { useState, useCallback, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance"; // Thay thế bằng cách gọi API của bạn
import { useDispatch } from "react-redux";
import { resetToDefault } from "@/redux/user";

interface Options {
  onSuccess?: (data: object) => void; // Hàm được gọi khi đăng nhập thành công
  onError?: (error: Error) => void; // Hàm được gọi khi có lỗi
  onSettled?: () => void; // Hàm được gọi sau khi kết thúc dù thành công hay lỗi
  throwError?: boolean; // Cho phép ném lỗi lên nếu true
}

export const useLoginWithPasswordEmail = () => {
  const [data, setData] = useState<ResponseType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<
    "success" | "error" | "settled" | "pending" | null
  >(null);
  const dispatch = useDispatch()

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

        const res = await axiosInstance.post("/auth/login", {
          username,
          password,
        }); // Thay thế bằng đường dẫn thực tế của API bạn

        // Lưu token vào localStorage
        localStorage.setItem("token", res.data.access_token);

        // Gán token vào header mặc định của axiosInstance
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.access_token}`;

        setData(res.data);
        setStatus("success");
        options?.onSuccess?.(res.data);
        return res.data;
      } catch (error) {
        setStatus("error");
        setError(error as Error);
        options?.onError?.(error as Error);
        if (options?.throwError) {
          throw error;
        }
      } finally {
        setStatus("settled");
        options?.onSettled?.();
      }
    },
    []
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

        // Chuẩn bị body dữ liệu với các trường đầy đủ
        const body = {
          fullName,
          username,
          password,
          confirmPassword,
          email,
          gender,
        };

        // Gửi request với body đầy đủ
        const res = await axiosInstance.post("/auth/signup", body);

        console.log("Response data: ", res);

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.token}`;

        setData(res.data);
        setStatus("success");
        options?.onSuccess?.(res.data);
        return res.data;
      } catch (error) {
        setStatus("error");
        setError(error as Error);
        options?.onError?.(error as Error);
        if (options?.throwError) {
          throw error;
        }
      } finally {
        setStatus("settled");
        options?.onSettled?.();
      }
    },
    []
  );
  const signOut = useCallback(async ()=>{
    dispatch(resetToDefault())
  },[])

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
