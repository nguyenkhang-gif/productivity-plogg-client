// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import store from "@/redux/store";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    try {
      const { data } = await axiosInstance.post("/auth/refresh-token");
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      const profileResponse = await axiosInstance.post("/auth/profile");
      console.log("debug get profile", profileResponse.data);
      if (profileResponse.data) {
        store.dispatch({
          type: "user/updateUser",
          payload: profileResponse.data,
        });
      }
    } catch (e) {
      console.error("Authentication failed, redirecting to /auth", e);
      setIsAuthenticated(false);
      router.push("/auth");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAuth();
  }, []);

  return { loading };
};
