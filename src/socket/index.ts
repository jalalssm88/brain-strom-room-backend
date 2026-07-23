import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { corsOptions } from '../config/cors';
import { logger } from '../utils/logger';
import { socketAuthMiddleware, AuthenticatedSocket } from './middleware/auth';
import { setIO } from './io';
import { userRoom, workspaceRoom } from './rooms';
import { presenceStore } from './presence';
import { selectionStore } from './selection';
import { emitPresenceUpdate } from './emit';
import { SOCKET_BROADCAST_EVENTS } from './events';
import { registerWorkspaceHandlers } from './handlers/workspace.handler';
import { registerTypingHandlers } from './handlers/typing.handler';
import { registerSelectionHandlers } from './handlers/selection.handler';
import { registerChatHandlers } from './handlers/chat.handler';

export const initSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOptions.origin,
      methods: ['GET', 'POST'],
    },
  });

  setIO(io);
  io.use(socketAuthMiddleware);

  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    logger.info('Socket connected', { socketId: socket.id, userId: socket.data.userId });

    void socket.join(userRoom(socket.data.userId));

    registerWorkspaceHandlers(socket);
    registerTypingHandlers(socket);
    registerSelectionHandlers(socket);
    registerChatHandlers(socket);

    socket.on('disconnect', () => {
      const affected = presenceStore.removeSocket(socket.id);
      for (const { workspaceId, users } of affected) {
        emitPresenceUpdate(workspaceId, users);
      }

      const selectionWorkspaces = selectionStore.clearUserEverywhere(socket.data.userId);
      for (const workspaceId of selectionWorkspaces) {
        io.to(workspaceRoom(workspaceId)).emit(SOCKET_BROADCAST_EVENTS.SELECTION_UPDATE, {
          workspaceId,
          userId: socket.data.userId,
          noteId: null,
        });
      }

      logger.info('Socket disconnected', { socketId: socket.id, userId: socket.data.userId });
    });
  });

  logger.info('Socket.IO initialized');
  return io;
};
