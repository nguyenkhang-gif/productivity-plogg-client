import axiosInstance from "@/core/lib/axiosInstance";
import { InvitePreview } from "@/core/types/guild";

export const inviteApi = {
  // tạo invite cho guild (cần MANAGE_GUILD) → { code }
  createInvite: (guildId: string) =>
    axiosInstance
      .post<{ code: string }>(`/guilds/${guildId}/invites`)
      .then((r) => r.data),
  // preview 1 invite (chỉ cần login) → guild info
  getInvite: (code: string) =>
    axiosInstance.get<InvitePreview>(`/invites/${code}`).then((r) => r.data),
  // join guild qua code (idempotent) → { guildId }
  joinByInvite: (code: string) =>
    axiosInstance
      .post<{ guildId: string }>(`/invites/${code}/join`)
      .then((r) => r.data),
};
