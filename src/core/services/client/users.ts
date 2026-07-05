"use client";
import { useMutation, useQuery, useQueryClient } from "@/core/plugins/reactQuery";
import { FetchQueryKeys } from "../endpoints";
import {
  apiGetAdminUsers,
  apiChangeUserRole,
  GetAdminUsersParams,
} from "../api/users";
import { UserRole } from "@/core/enums";

export const useGetAdminUsers = (params: GetAdminUsersParams) =>
  useQuery({
    queryKey: [FetchQueryKeys.ADMIN_USER_GET_ALL, params],
    queryFn: () => apiGetAdminUsers(params),
  });

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      apiChangeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FetchQueryKeys.ADMIN_USER_GET_ALL],
      });
    },
  });
};

// Keep legacy export so any other usages don't break
export const useGetUsers = (page = 1, search = "", limit = 10) =>
  useGetAdminUsers({ page, limit, search: search || undefined });
