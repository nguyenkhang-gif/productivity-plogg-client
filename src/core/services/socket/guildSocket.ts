import { io, Socket } from "socket.io-client";

const GUILD_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ??
  "http://localhost:8000";

let socket: Socket | null = null;

// Giữ MỘT socket cho suốt phiên. KHÔNG tái tạo khi token đổi (refresh cùng user):
// backend chỉ verify token 1 lần lúc handshake nên tái tạo là vô nghĩa + gây mất room.
// Chỉ hủy socket ở ranh giới đổi identity (logout) qua disconnectGuildSocket().
export function getGuildSocket(token: string): Socket {
  if (socket) return socket;

  socket = io(`${GUILD_URL}/guild`, {
    auth: { token },
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    transports: ["websocket"],
  });

  return socket;
}

// Cập nhật token cho lần reconnect kế tiếp (refresh token) mà KHÔNG tái tạo socket.
// socket.io lưu auth lúc tạo → nếu không update, reconnect sau sẽ handshake bằng token cũ (đã hết hạn).
export function updateGuildSocketToken(token: string) {
  if (socket) socket.auth = { token };
}

export function disconnectGuildSocket() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}

export function getGuildSocketInstance(): Socket | null {
  return socket;
}
