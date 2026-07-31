import { io, Socket } from "socket.io-client";

const GUILD_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ??
  "http://localhost:8000";

let socket: Socket | null = null;
let currentToken: string | null = null;

export function getGuildSocket(token: string): Socket {
  if (socket && currentToken === token) return socket;

  // Dicconnect
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io(`${GUILD_URL}/guild`, {
    auth: { token },
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    transports: ["websocket"],
  });

  return socket;
}

export function disconnectGuildSocket() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}

export function getGuildSocketInstance(): Socket | null {
  return socket;
}
