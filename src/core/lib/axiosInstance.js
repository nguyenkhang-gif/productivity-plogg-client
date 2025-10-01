import axios from "axios";

// Tạo instance axios
const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000/api"
      : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api", // URL API gốc
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
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      console.log("debug 2: token ");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    throw new Error(error);
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response) => {
    // Kiểm tra và lấy cookie từ header của response nếu có
    const cookies = response.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      cookies.forEach(cookie => {
        document.cookie = cookie;  // Lưu cookie vào client
      });
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Kiểm tra lỗi 401 Unauthorized và thử lấy access token mới
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         // Gửi yêu cầu refresh token
//         const refreshResponse = await axiosInstance.post("/auth/refresh-token");

//         // Cập nhật access token mới vào headers
//         const newAccessToken = refreshResponse.data.access_token;
//         localStorage.setItem("token", newAccessToken);

//         // Cập nhật lại request gốc với token mới
//         originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

//         // Thực hiện lại request gốc
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         // Xử lý lỗi khi refresh token không thành công
//         console.error("Refresh token failed", refreshError);
//         return Promise.reject(refreshError);
//       }
//     }

//     // Trả về lỗi nếu không phải lỗi 401
//     return Promise.reject(error);
//   }
// );
// NOTE: pending feature for feature
// const message = async (service, endpoint, method = "GET", data = {}) => {
//   const url = `/${service}/${endpoint}`;
//   try {
//     const response = await axiosInstance({
//       method,
//       url,
//       data: method !== "GET" ? data : {},
//     });
//     return response.data;
//   } catch (error) {
//     console.error("API Error:", error);
//     throw error;
//   }
// };

export default axiosInstance;
