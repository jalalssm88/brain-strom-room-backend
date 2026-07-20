import { BadRequestError } from '../../errors/AppError';
import { AuthenticatedSocket } from '../middleware/auth';
import { SOCKET_EVENTS } from '../events';
import { getMembershipOrThrow } from './workspace.handler';
import { logger } from '../../utils/logger';

const parseWorkspaceId = (value: unknown): number => {
  const workspaceId = Number(value);
  if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
    throw new BadRequestError('Valid workspaceId is required');
  }
  return workspaceId;
};

export const registerTypingHandlers = (socket: AuthenticatedSocket): void => {
  const relayTyping = async (
    event: typeof SOCKET_EVENTS.TYPING_START | typeof SOCKET_EVENTS.TYPING_STOP,
    payload: { workspaceId?: number },
  ) => {
    try {
      const workspaceId = parseWorkspaceId(payload?.workspaceId);
      await getMembershipOrThrow(workspaceId, socket.data.userId);

      socket.to(`workspace:${workspaceId}`).emit(event, {
        workspaceId,
        userId: socket.data.userId,
        fullName: socket.data.fullName,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Typing relay failed';
      logger.warn(`${event} failed`, { message });
    }
  };

  socket.on(SOCKET_EVENTS.TYPING_START, (payload: { workspaceId?: number }) => {
    void relayTyping(SOCKET_EVENTS.TYPING_START, payload ?? {});
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, (payload: { workspaceId?: number }) => {
    void relayTyping(SOCKET_EVENTS.TYPING_STOP, payload ?? {});
  });
};
