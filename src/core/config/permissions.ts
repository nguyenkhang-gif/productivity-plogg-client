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
