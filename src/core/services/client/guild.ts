"use client";

import { RootState } from "@/core/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { FetchQueryKeys } from "../endpoints";
import {
  removeGuild,
  setChannels,
  setGuilds,
  setMembers,
  setRoles,
  upsertGuild,
} from "@/core/redux/guild";
import { guildApi } from "../api/guild";
import { Channel } from "@/core/types/guild";
import { STALE_TIME } from "@/core/config/queryConfig";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@/core/plugins/reactQuery";

export const useGetGuild = () => {
  const isAuth = useSelector((s: RootState) => s.user.isAuth);
  const dispatch = useDispatch();
  return useQuery({
    queryKey: [FetchQueryKeys.GUILDS],
    queryFn: async () => {
      const data = await guildApi.getGuilds();
      dispatch(setGuilds(data));
      return data;
    },
    enabled: isAuth,
    staleTime: STALE_TIME.MEDIUM,
  });
};

// Chi tiết 1 guild — chỉ endpoint này trả `myPermissions`. Merge vào Redux qua upsertGuild.
export const useGetGuildDetail = (guildId: string) => {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: [FetchQueryKeys.GUILDS, guildId],
    queryFn: async () => {
      const data = await guildApi.getGuild(guildId);
      dispatch(upsertGuild(data));
      return data;
    },
    enabled: !!guildId,
    staleTime: STALE_TIME.MEDIUM,
  });
};

export const useCreateGuild = () => {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; icon?: string }) =>
        guildApi.createGuild(body),
    onSuccess: (guild) => {
      dispatch(upsertGuild(guild));
      qc.invalidateQueries({ queryKey: [FetchQueryKeys.GUILDS] });
    },
  });
};

export const useUpdateGuild = () => {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { name?: string; icon?: string };
    }) => guildApi.updateGuild(id, body),
    onSuccess: (guild) => {
      dispatch(upsertGuild(guild));
      // GuildRail đọc từ React Query → invalidate để rail cập nhật icon/tên
      qc.invalidateQueries({ queryKey: [FetchQueryKeys.GUILDS] });
    },
  });
};

export const useDeleteGuild = () => {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guildApi.deleteGuild(id),
    onSuccess: (_, id) => {
      dispatch(removeGuild(id));
      qc.invalidateQueries({ queryKey: [FetchQueryKeys.GUILDS] });
    },
  });
};

export const useLeaveGuild = () => {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guildApi.leaveGuild(id),
    onSuccess: (_, id) => {
      dispatch(removeGuild(id));
      // rail đọc từ React Query → invalidate để guild biến mất
      qc.invalidateQueries({ queryKey: [FetchQueryKeys.GUILDS] });
    },
  });
};

// ---- Channels ----
export const useGetChannels = (guildId: string) => {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: [FetchQueryKeys.GUILD_CHANNELS, guildId],
    queryFn: async () => {
      const data = await guildApi.getChannels(guildId);
      dispatch(setChannels({ guildId, channels: data }));
      return data;
    },
    enabled: !!guildId,
    staleTime: STALE_TIME.MEDIUM,
  });
};

export const useCreateChannel = (guildId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      type?: "TEXT" | "CATEGORY";
      parentId?: string;
      topic?: string;
    }) => guildApi.createChannel(guildId, body),
    onSuccess: () => {
      // refetch channel list (useGetChannels sẽ dispatch setChannels lại)
      qc.invalidateQueries({
        queryKey: [FetchQueryKeys.GUILD_CHANNELS, guildId],
      });
    },
  });
};

export const useUpdateChannel = (guildId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      channelId,
      body,
    }: {
      channelId: string;
      body: { name?: string; topic?: string };
    }) => guildApi.updateChannel(guildId, channelId, body),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [FetchQueryKeys.GUILD_CHANNELS, guildId],
      }),
  });
};

export const useDeleteChannel = (guildId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (channelId: string) =>
      guildApi.deleteChannel(guildId, channelId),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [FetchQueryKeys.GUILD_CHANNELS, guildId],
      }),
  });
};

export const useReorderChannels = (guildId: string) => {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const key = [FetchQueryKeys.GUILD_CHANNELS, guildId];
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      guildApi.reorderChannels(guildId, orderedIds),
    // optimistic: sắp lại + gán position theo index ngay trên UI
    onMutate: async (orderedIds) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Channel[]>(key);
      if (prev) {
        const byId = new Map(prev.map((c) => [c.id, c]));
        const next = orderedIds
          .map((id, i) => {
            const c = byId.get(id);
            return c ? { ...c, position: i } : undefined;
          })
          .filter((c): c is Channel => !!c);
        qc.setQueryData(key, next);
        dispatch(setChannels({ guildId, channels: next }));
      }
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(key, ctx.prev);
        dispatch(setChannels({ guildId, channels: ctx.prev }));
      }
    },
    // đồng bộ lại với BE (position thật)
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
};

// ---- Roles ----
export const useGetRoles = (guildId: string) => {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: [FetchQueryKeys.GUILD_ROLES, guildId],
    queryFn: async () => {
      const data = await guildApi.getRoles(guildId);
      dispatch(setRoles({ guildId, roles: data }));
      return data;
    },
    enabled: !!guildId,
    staleTime: STALE_TIME.MEDIUM,
  });
};

// ---- Members ----
export const useKickMember = (guildId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => guildApi.kickMember(guildId, userId),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [FetchQueryKeys.GUILD_MEMBERS, guildId],
      }),
  });
};

export const useAssignRole = (guildId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      guildApi.assignRole(guildId, userId, roleId),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [FetchQueryKeys.GUILD_MEMBERS, guildId],
      }),
  });
};

export const useRemoveRole = (guildId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      guildApi.removeRole(guildId, userId, roleId),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: [FetchQueryKeys.GUILD_MEMBERS, guildId],
      }),
  });
};

export const useGetMembers = (guildId: string) => {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: [FetchQueryKeys.GUILD_MEMBERS, guildId],
    queryFn: async () => {
      const data = await guildApi.getMembers(guildId);
      dispatch(setMembers({ guildId, members: data }));
      return data;
    },
    enabled: !!guildId,
    staleTime: STALE_TIME.SHORT,
  });
};
