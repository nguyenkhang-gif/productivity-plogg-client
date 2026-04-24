import { useEffect, useState } from "react";
import axiosInstance from "@/core/lib/axiosInstance";
// import store from "@/core/redux/store"; // Removed direct store import
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { updateUser, resetToDefault } from "@/core/redux/user";

export const useAuth = () => {
  const [loading, setLoading] = useState(true); // Start loading as true
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const logout = () => {
    dispatch(resetToDefault());
    localStorage.removeItem("token");
    router.push("/auth");
  };

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        // Optional: Refresh token logic if needed, or just validate current token
        // For now keeping existing logic structure but improving it
        // const { data } = await axiosInstance.post("/auth/refresh-token");
        // if (data.access_token) {
        //   localStorage.setItem("token", data.access_token);
        // }

        // const profileResponse = await axiosInstance.post("/auth/profile");
        // if (profileResponse.data) {
        //   dispatch(updateUser({ ...profileResponse.data, token: data.access_token || token }));
        // }
      } catch (e) {
        // console.error("Authentication failed, redirecting to /auth", e);
        logout(); // Use logout to clean up
      } finally {
        setLoading(false);
      }
    };
    handleAuth();
  }, [dispatch]); // Added dispatch dependency

  return { 
      loading, 
      logout, 
      user,
      isAuthenticated: !!user.token || !!localStorage.getItem("token") // Fallback to localStorage for initial load
  };
};
