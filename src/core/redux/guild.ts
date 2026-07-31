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
    setGuilds(state, action: PayloadAction<Guild[]>) {
      state.guilds = action.payload;
    },
    upsertGuild(state, action: PayloadAction<Guild>) {
      const i = state.guilds.findIndex((g) => g.id === action.payload.id);
      if (i !== -1) state.guilds[i] = action.payload;
      else state.guilds.push(action.payload);
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