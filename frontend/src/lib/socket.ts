import { io, type Socket } from "socket.io-client";

// Empty string ("" in prod behind the nginx proxy) means "connect to the
// page's own origin" — kept separate from NEXT_PUBLIC_API_URL since that one
// carries a path prefix ("/api") which isn't a valid socket.io host.
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

let socket: Socket | null = null;

// One shared connection for the whole app — task pages join/leave a room on
// it rather than each opening their own socket.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL || undefined, {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
}
