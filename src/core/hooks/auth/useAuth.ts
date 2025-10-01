// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import axiosInstance from "@/core/lib/axiosInstance";
import store from "@/core/redux/store";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data } = await axiosInstance.post("/auth/refresh-token");
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
        }

        const profileResponse = await axiosInstance.post("/auth/profile");
        if (profileResponse.data) {
          store.dispatch({
            type: "user/updateUser",
            payload: profileResponse.data,
          });
        }
      } catch (e) {
        console.error("Authentication failed, redirecting to /auth", e);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };
    handleAuth();
  }, []);

  return { loading };
};
