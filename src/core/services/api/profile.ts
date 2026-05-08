import axiosInstance from "@/core/lib/axiosInstance";
import { UserProfile } from "@/core/redux/user";

export interface UpdateProfilePayload {
  fullName?: string;
  profilePic?: string;
  gender?: string;
  isPrivate?: boolean;
}

export const profileApi = {
  update: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const { data } = await axiosInstance.patch<UserProfile>("/auth/profile", payload);
    return data;
  },
};
