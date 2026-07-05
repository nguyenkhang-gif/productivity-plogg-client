import axiosInstance from "@/core/lib/axiosInstance";
import { Endpoints } from "../endpoints";
import { UserRole } from "@/core/enums";

export interface AdminUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  gender?: string;
  profilePic?: string;
  membership: string;
  role: UserRole;
  isPrivate: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface GetAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  membership?: string;
}

export const apiGetAdminUsers = async (
  params: GetAdminUsersParams = {}
): Promise<AdminUsersResponse> => {
  const { data } = await axiosInstance.get(Endpoints.ADMIN_USER_GET_ALL, { params });
  return data;
};

export const apiChangeUserRole = async (
  userId: string,
  role: UserRole
): Promise<AdminUser> => {
  const { data } = await axiosInstance.patch(
    Endpoints.USER_CHANGE_ROLE.replace(":id", userId),
    { role }
  );
  return data;
};
