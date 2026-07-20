import { BadRequestError } from '../../errors/AppError';
import { AuthenticatedSocket } from '../middleware/auth';
import { SOCKET_EVENTS, SOCKET_BROADCAST_EVENTS } from '../events';
import { selectionStore } from '../selection';
import { getMembershipOrThrow } from './workspace.handler';
import { logger } from '../../utils/logger';

const parseWorkspaceId = (value: unknown): number => {
  const workspaceId = Number(value);
  if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
    throw new BadRequestError('Valid workspaceId is required');
  }
  return workspaceId;
};

export const registerSelectionHandlers = (socket: AuthenticatedSocket): void => {
  socket.on(
    SOCKET_EVENTS.SELECTION_UPDATE,
    async (payload: { workspaceId?: number; noteId?: number | null }) => {
      try {
        const workspaceId = parseWorkspaceId(payload?.workspaceId);
        await getMembershipOrThrow(workspaceId, socket.data.userId);

        const noteId =
          payload?.noteId === null || payload?.noteId === undefined
            ? null
            : Number(payload.noteId);

        if (noteId !== null && (!Number.isInteger(noteId) || noteId <= 0)) {
          throw new BadRequestError('Valid noteId is required');
        }

        const selection = selectionStore.set(
          workspaceId,
          socket.data.userId,
          socket.data.fullName,
          noteId,
        );

        socket.to(`workspace:${workspaceId}`).emit(SOCKET_BROADCAST_EVENTS.SELECTION_UPDATE, {
          workspaceId,
          ...selection,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Selection update failed';
        logger.warn('selection:update failed', { message });
      }
    },
  );
};
