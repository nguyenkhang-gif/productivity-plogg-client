// Guild permission bitmask (spec §3). Dùng BigInt() thay literal `1n` để
// tương thích tsconfig target < ES2020.
export const PERMISSIONS = {
  VIEW_CHANNELS: BigInt(1), //   xem channel + đọc message
  SEND_MESSAGES: BigInt(2), //   gửi tin
  MANAGE_MESSAGES: BigInt(4), //   xóa tin người khác
  MANAGE_CHANNELS: BigInt(8), //   tạo/sửa/xóa channel
  MANAGE_GUILD: BigInt(16), //  sửa guild
  KICK_MEMBERS: BigInt(32), //  kick member
  BAN_MEMBERS: BigInt(64), //  ban member
  MANAGE_ROLES: BigInt(128), // quản lý role
  ADMINISTRATOR: BigInt(256), // bypass mọi check
} as const;

/**
 * Kiểm tra bitmask có quyền `flag` không. ADMINISTRATOR bypass tất cả.
 * @param perms bitmask hiện tại (bigint)
 * @param flag  quyền cần kiểm (bigint, từ PERMISSIONS)
 */
export const hasPermission = (perms: bigint, flag: bigint) =>
  (perms & PERMISSIONS.ADMINISTRATOR) !== BigInt(0) ||
  (perms & flag) !== BigInt(0);

// Metadata để render bitmask editor (role manager). Thứ tự = thứ tự hiển thị.
export const PERMISSION_LIST: {
  flag: bigint;
  label: string;
  description: string;
}[] = [
  { flag: PERMISSIONS.VIEW_CHANNELS, label: "Xem channel", description: "Xem channel và đọc tin nhắn" },
  { flag: PERMISSIONS.SEND_MESSAGES, label: "Gửi tin nhắn", description: "Gửi tin trong channel" },
  { flag: PERMISSIONS.MANAGE_MESSAGES, label: "Quản lý tin nhắn", description: "Xóa tin của người khác" },
  { flag: PERMISSIONS.MANAGE_CHANNELS, label: "Quản lý channel", description: "Tạo, sửa, xóa channel" },
  { flag: PERMISSIONS.MANAGE_GUILD, label: "Quản lý server", description: "Sửa thông tin server" },
  { flag: PERMISSIONS.KICK_MEMBERS, label: "Kick thành viên", description: "Xóa thành viên khỏi server" },
  { flag: PERMISSIONS.BAN_MEMBERS, label: "Ban thành viên", description: "Cấm thành viên khỏi server" },
  { flag: PERMISSIONS.MANAGE_ROLES, label: "Quản lý role", description: "Tạo, sửa, xóa và gán role" },
  { flag: PERMISSIONS.ADMINISTRATOR, label: "Quản trị viên", description: "Bỏ qua mọi kiểm tra quyền" },
];

/** bitmask string ("259") → mảng flag đang bật. */
export const permsToFlags = (perms: string): bigint[] => {
  const p = BigInt(perms || "0");
  return PERMISSION_LIST.filter((x) => (p & x.flag) !== BigInt(0)).map(
    (x) => x.flag,
  );
};

/** mảng flag → bitmask string ("259"). */
export const flagsToPerms = (flags: bigint[]): string =>
  flags.reduce((acc, f) => acc | f, BigInt(0)).toString();
