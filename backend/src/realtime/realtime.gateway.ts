import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

function readCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const prefix = `${name}=`;
  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

// Live push for anyone viewing a task: replaces the old heartbeat-polling
// presence endpoint with real connect/disconnect events, and lets task
// mutations (from any client) tell every other open viewer to refetch.
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // taskId -> (socketId -> userId), tracked ourselves so presence counts
  // don't depend on socket.io's internal room bookkeeping timing.
  private readonly viewers = new Map<string, Map<string, string>>();
  // socketId -> taskId, so a disconnect can find which room to clean up.
  private readonly socketTask = new Map<string, string>();

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token = readCookie(client.handshake.headers.cookie, 'pyramid_token');
    if (!token) {
      client.disconnect(true);
      return;
    }
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.leaveCurrentTask(client);
  }

  @SubscribeMessage('join-task')
  handleJoinTask(@ConnectedSocket() client: Socket, @MessageBody() taskId: string) {
    if (!client.data.userId || !taskId) return;
    this.leaveCurrentTask(client);

    void client.join(`task:${taskId}`);
    this.socketTask.set(client.id, taskId);
    if (!this.viewers.has(taskId)) this.viewers.set(taskId, new Map());
    this.viewers.get(taskId)!.set(client.id, client.data.userId as string);
    this.emitPresence(taskId);
  }

  @SubscribeMessage('leave-task')
  handleLeaveTask(@ConnectedSocket() client: Socket) {
    this.leaveCurrentTask(client);
  }

  private leaveCurrentTask(client: Socket) {
    const taskId = this.socketTask.get(client.id);
    if (!taskId) return;

    void client.leave(`task:${taskId}`);
    this.socketTask.delete(client.id);

    const room = this.viewers.get(taskId);
    room?.delete(client.id);
    if (room && room.size === 0) this.viewers.delete(taskId);

    this.emitPresence(taskId);
  }

  private emitPresence(taskId: string) {
    const room = this.viewers.get(taskId);
    const userIds = room ? [...new Set(room.values())] : [];
    this.server.to(`task:${taskId}`).emit('presence', { taskId, userIds });
  }

  // Called by feature services after a task (or one of its child records)
  // changes, so every other open viewer of that task can refetch live.
  emitTaskChanged(taskId: string) {
    this.server.to(`task:${taskId}`).emit('task-changed', { taskId });
  }
}
