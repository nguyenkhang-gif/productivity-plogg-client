export interface Guild {
  id: string;
  name: string;
  icon?: string | null; // emoji hoặc URL
  ownerId: string;
  createdAt: string; // ISO
  updatedAt: string;
  // quyền (bitmask string) của user hiện tại trong guild — chỉ có ở GET /guilds/:id
  myPermissions?: string;
  // các field lồng chỉ có ở 1 số response:
  channels?: Channel[];
  members?: GuildMember[];
  roles?: Role[];
}

export interface Channel {
  id: string;
  guildId: string;
  parentId?: string | null; // channel cha (category)
  type: "TEXT" | "CATEGORY";
  name: string;
  topic?: string | null;
  position: number;
  createdAt: string;
}

export interface Role {
  id: string;
  guildId: string;
  name: string;
  color: string; // hex, vd "#5865F2"
  position: number; // cao hơn = quyền lực hơn (dùng cho kick/manage)
  permissions: string; // bitmask dạng string, vd "256"
  isDefault: boolean; // true = @everyone, KHÔNG xóa được
}

export interface GuildMember {
  guildId: string;
  userId: string;
  username: string;
  avatar?: string | null;
  nickname?: string | null;
  joinedAt: string;
  roleIds: string[]; // id role; [] nếu không có (vd owner — quyền từ ownership)
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  replyToId?: string | null;
  type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  content: string;
  isDeleted: boolean;
  editedAt?: string | null;
  createdAt: string;
  replyTo?: Message | null; // message được reply (nếu có)
  attachments?: MessageAttachment[];
  reactions?: { emoji: string; userId: string }[];
}

export interface MessageAttachment {
  id: string;
  url: string;
  type: string;
  filename: string;
  size: number;
  mimeType: string;
}
