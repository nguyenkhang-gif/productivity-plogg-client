import axiosInstance from "@/core/lib/axiosInstance";
import { Guild, Channel, Role, GuildMember, Message } from "@/core/types/guild";

export const guildApi = {
  // ---- Guild (§5.1) ----
  getGuilds: () => axiosInstance.get<Guild[]>("/guilds").then((r) => r.data),
  getGuild: (id: string) =>
    axiosInstance.get<Guild>(`/guilds/${id}`).then((r) => r.data),
  createGuild: (body: { name: string; icon?: string }) =>
    axiosInstance.post<Guild>("/guilds", body).then((r) => r.data),
  updateGuild: (id: string, body: { name?: string; icon?: string }) =>
    axiosInstance.patch<Guild>(`/guilds/${id}`, body).then((r) => r.data),
  deleteGuild: (id: string) => axiosInstance.delete(`/guilds/${id}`),

  // ---- Channel (§5.2) ----
  getChannels: (guildId: string) =>
    axiosInstance
      .get<Channel[]>(`/guilds/${guildId}/channels`)
      .then((r) => r.data),
  createChannel: (
    guildId: string,
    body: {
      name: string;
      type?: "TEXT" | "CATEGORY";
      parentId?: string;
      topic?: string;
    },
  ) =>
    axiosInstance
      .post<Channel>(`/guilds/${guildId}/channels`, body)
      .then((r) => r.data),
  updateChannel: (
    guildId: string,
    channelId: string,
    body: { name?: string; topic?: string },
  ) =>
    axiosInstance
      .patch<Channel>(`/guilds/${guildId}/channels/${channelId}`, body)
      .then((r) => r.data),
  deleteChannel: (guildId: string, channelId: string) =>
    axiosInstance.delete(`/guilds/${guildId}/channels/${channelId}`),
  // orderedIds = TOÀN BỘ channel của guild theo thứ tự mới (BE ghi position = index)
  reorderChannels: (guildId: string, orderedIds: string[]) =>
    axiosInstance.patch(`/guilds/${guildId}/channels/reorder`, {
      orderedIds,
    }),

  // ---- Role (§5.3) ----
  getRoles: (guildId: string) =>
    axiosInstance.get<Role[]>(`/guilds/${guildId}/roles`).then((r) => r.data),
  createRole: (
    guildId: string,
    body: {
      name: string;
      color?: string;
      position?: number;
      permissions: string;
    },
  ) =>
    axiosInstance
      .post<Role>(`/guilds/${guildId}/roles`, body)
      .then((r) => r.data),
  updateRole: (
    guildId: string,
    roleId: string,
    body: Partial<{
      name: string;
      color: string;
      position: number;
      permissions: string;
    }>,
  ) =>
    axiosInstance
      .patch<Role>(`/guilds/${guildId}/roles/${roleId}`, body)
      .then((r) => r.data),
  deleteRole: (guildId: string, roleId: string) =>
    axiosInstance.delete(`/guilds/${guildId}/roles/${roleId}`),

  // ---- Member (§5.4) ----
  joinGuild: (guildId: string) =>
    axiosInstance
      .post<GuildMember>(`/guilds/${guildId}/join`)
      .then((r) => r.data),
  leaveGuild: (guildId: string) =>
    axiosInstance.delete(`/guilds/${guildId}/leave`),
  getMembers: (guildId: string, cursor?: string) =>
    axiosInstance
      .get<GuildMember[]>(`/guilds/${guildId}/members`, {
        params: { limit: 50, cursor },
      })
      .then((r) => r.data),
  kickMember: (guildId: string, userId: string) =>
    axiosInstance.delete(`/guilds/${guildId}/members/${userId}`),
  assignRole: (guildId: string, userId: string, roleId: string) =>
    axiosInstance.post(`/guilds/${guildId}/members/${userId}/roles`, {
      roleId,
    }),
  removeRole: (guildId: string, userId: string, roleId: string) =>
    axiosInstance.delete(
      `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    ),

  // ---- Message history (§5.5) ----
  getMessages: (channelId: string, cursor?: string) =>
    axiosInstance
      .get<Message[]>(`/channels/${channelId}/messages`, {
        params: { limit: 30, cursor },
      })
      .then((r) => r.data),
};
