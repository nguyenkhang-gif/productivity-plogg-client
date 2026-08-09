"use client";

import { inviteApi } from "../api/invite";
import { FetchQueryKeys } from "../endpoints";
import { useMutation, useQuery } from "@/core/plugins/reactQuery";

export const useCreateInvite = (guildId: string) =>
  useMutation({
    mutationFn: () => inviteApi.createInvite(guildId),
  });

export const useGetInvite = (code: string) =>
  useQuery({
    queryKey: [FetchQueryKeys.INVITE_PREVIEW, code],
    queryFn: () => inviteApi.getInvite(code),
    enabled: !!code,
    retry: false, // 404 code sai → không retry
  });

export const useJoinInvite = () =>
  useMutation({
    mutationFn: (code: string) => inviteApi.joinByInvite(code),
  });
