import { io, Socket } from "socket.io-client";

const CHAT_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:8000";

let socket: Socket | null = null;

export function getChatSocket(token: string): Socket {
  if (socket?.connected) return socket;

  // Disconnect stale socket before creating a new one (e.g. token refresh)
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(`${CHAT_URL}/chat`, {
    auth: { token },
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  return socket;
}

export function disconnectChatSocket() {
  socket?.disconnect();
  socket = null;
}

export function getChatSocketInstance(): Socket | null {
  return socket;
}
