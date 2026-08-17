import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Channel, Guild, GuildMember, Role } from "../types/guild";

export interface GuildState {
  guilds: Guild[];
  channelsByGuild: Record<string, Channel[]>;
  rolesByGuild: Record<string, Role[]>;
  membersByGuild: Record<string, GuildMember[]>;
  activeGuildId: string | null;
  activeChannelId: string | null;
}

const initialState: GuildState = {
  guilds: [],
  channelsByGuild: {},
  rolesByGuild: {},
  membersByGuild: {},
  activeGuildId: null,
  activeChannelId: null,
};

const guildSlice = createSlice({
  name: "guild",
  initialState,
  reducers: {
    // `myPermissions` CHỈ có ở GET /guilds/:id — list và PATCH không trả.
    // Ghi đè thẳng sẽ xoá quyền đã nạp từ detail → usePermissions về 0n →
    // nút Invite/Tạo channel/Role manager biến mất. Luôn giữ lại quyền cũ
    // khi payload không mang theo.
    setGuilds(state, action: PayloadAction<Guild[]>) {
      const prevPerms = new Map(
        state.guilds.map((g) => [g.id, g.myPermissions]),
      );
      state.guilds = action.payload.map((g) =>
        g.myPermissions === undefined
          ? { ...g, myPermissions: prevPerms.get(g.id) }
          : g,
      );
    },
    upsertGuild(state, action: PayloadAction<Guild>) {
      const next = action.payload;
      const i = state.guilds.findIndex((g) => g.id === next.id);
      if (i === -1) {
        state.guilds.push(next);
        return;
      }
      state.guilds[i] =
        next.myPermissions === undefined
          ? { ...next, myPermissions: state.guilds[i].myPermissions }
          : next;
    },
    removeGuild(state, action: PayloadAction<string>) {
      state.guilds = state.guilds.filter((g) => g.id !== action.payload);
    },
    setChannels(
      state,
      action: PayloadAction<{ guildId: string; channels: Channel[] }>,
    ) {
      state.channelsByGuild[action.payload.guildId] = action.payload.channels;
    },
    setRoles(state, action: PayloadAction<{ guildId: string; roles: Role[] }>) {
      state.rolesByGuild[action.payload.guildId] = action.payload.roles;
    },
    setMembers(
      state,
      action: PayloadAction<{ guildId: string; members: GuildMember[] }>,
    ) {
      state.membersByGuild[action.payload.guildId] = action.payload.members;
    },
    setActiveGuild(state, action: PayloadAction<string | null>) {
      state.activeGuildId = action.payload;
    },
    setActiveChannel(state, action: PayloadAction<string | null>) {
      state.activeChannelId = action.payload;
    },
  },
});

export const {
  setGuilds,
  upsertGuild,
  removeGuild,
  setChannels,
  setRoles,
  setMembers,
  setActiveGuild,
  setActiveChannel,
} = guildSlice.actions;

export default guildSlice.reducer;