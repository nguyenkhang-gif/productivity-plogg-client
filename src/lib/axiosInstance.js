import axios from "axios";

// Tạo instance axios
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api", // URL API gốc
  timeout: 10000, // Thời gian chờ request
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Quan trọng: Đảm bảo rằng yêu cầu đi kèm với cookie
});

// Xử lý request
axiosInstance.interceptors.request.use(
  (config) => {
    // Thêm token nếu cần
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
