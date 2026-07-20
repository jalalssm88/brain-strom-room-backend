import { voteService } from '../../services/vote.service';
import { BadRequestError } from '../../errors/AppError';
import { AuthenticatedSocket } from '../middleware/auth';
import { SOCKET_EVENTS } from '../events';
import { workspaceBroadcast } from '../emit';
import { getMembershipOrThrow } from './workspace.handler';
import { logger } from '../../utils/logger';

const parseId = (value: unknown, label: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError(`Valid ${label} is required`);
  }
  return id;
};

export const registerVoteHandlers = (socket: AuthenticatedSocket): void => {
  socket.on(
    SOCKET_EVENTS.VOTE_TOGGLE,
    async (
      payload: { workspaceId?: number; noteId?: number },
      ack?: (response: unknown) => void,
    ) => {
      try {
        const workspaceId = parseId(payload?.workspaceId, 'workspaceId');
        const noteId = parseId(payload?.noteId, 'noteId');
        const membership = await getMembershipOrThrow(workspaceId, socket.data.userId);

        const result = await voteService.toggleVote(
          workspaceId,
          noteId,
          socket.data.userId,
          membership.role,
        );

        const broadcast = {
          noteId,
          userId: socket.data.userId,
          count: result.count,
        };

        if (result.voted) {
          workspaceBroadcast.voteCreated(workspaceId, broadcast);
        } else {
          workspaceBroadcast.voteDeleted(workspaceId, broadcast);
        }

        if (typeof ack === 'function') {
          ack({ success: true, data: { ...result, noteId, userId: socket.data.userId } });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to toggle vote';
        logger.warn('vote:toggle failed', { message });
        if (typeof ack === 'function') ack({ success: false, error: message });
      }
    },
  );
};
