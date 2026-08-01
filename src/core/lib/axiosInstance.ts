import axios, { AxiosRequestConfig } from "axios";
import { tokenStore } from "@/core/auth/token-store";
import store from "@/core/redux/store";
import { updateToken, logout } from "@/core/redux/user";
import {
  updateGuildSocketToken,
  disconnectGuildSocket,
} from "@/core/services/socket/guildSocket";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000,
  headers: { "Content-Type": "application/json" },
});

// Gắn access token vào mọi request
axiosInstance.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Queue các request đang chờ khi token đang được refresh
let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const flushQueue = (token: string | null, error: unknown = null) => {
  queue.forEach(({ resolve, reject }) =>
    token ? resolve(token) : reject(error)
  );
  queue = [];
};

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config;

    // Chỉ xử lý 401, không retry vô hạn
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Không refresh khi chính auth endpoint trả 401 (sai credentials, token đã dùng...)
    const url: string = original.url ?? "";
    if (url.includes("/auth/login") || url.includes("/auth/refresh") || url.includes("/auth/register")) {
      return Promise.reject(error);
    }

    // Nhiều request cùng nhận 401 → xếp hàng chờ 1 lần refresh
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return axiosInstance(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenStore.getRefresh();
      if (!refreshToken) throw new Error("no_refresh_token");

      // Dùng axios thuần (không qua instance) để tránh vòng lặp interceptor
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      tokenStore.save(data.access_token, data.refresh_token);
      store.dispatch(updateToken(data.access_token));
      // Cập nhật auth cho guild socket (không tái tạo) → reconnect sau dùng token mới
      updateGuildSocketToken(data.access_token);

      flushQueue(data.access_token);
      original.headers = {
        ...original.headers,
        Authorization: `Bearer ${data.access_token}`,
      };
      return axiosInstance(original);
    } catch (err) {
      flushQueue(null, err);
      tokenStore.clear();
      store.dispatch(logout());
      disconnectGuildSocket(); // hủy socket khi session chết → login sau tạo socket mới đúng identity
      if (typeof window !== "undefined") window.location.href = "/auth";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
