import { commentService } from '../../services/comment.service';
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

export const registerCommentHandlers = (socket: AuthenticatedSocket): void => {
  socket.on(
    SOCKET_EVENTS.COMMENT_CREATE,
    async (
      payload: { workspaceId?: number; noteId?: number; message?: string },
      ack?: (response: unknown) => void,
    ) => {
      try {
        const workspaceId = parseId(payload?.workspaceId, 'workspaceId');
        const noteId = parseId(payload?.noteId, 'noteId');
        const message = payload?.message?.trim();
        if (!message) throw new BadRequestError('Message is required');

        const membership = await getMembershipOrThrow(workspaceId, socket.data.userId);
        const comment = await commentService.createComment(
          workspaceId,
          noteId,
          socket.data.userId,
          membership.role,
          { message },
        );

        workspaceBroadcast.commentCreated(workspaceId, comment);
        if (typeof ack === 'function') ack({ success: true, data: { comment } });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create comment';
        logger.warn('comment:create failed', { message });
        if (typeof ack === 'function') ack({ success: false, error: message });
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.COMMENT_UPDATE,
    async (
      payload: {
        workspaceId?: number;
        noteId?: number;
        commentId?: number;
        message?: string;
      },
      ack?: (response: unknown) => void,
    ) => {
      try {
        const workspaceId = parseId(payload?.workspaceId, 'workspaceId');
        const noteId = parseId(payload?.noteId, 'noteId');
        const commentId = parseId(payload?.commentId, 'commentId');
        const message = payload?.message?.trim();
        if (!message) throw new BadRequestError('Message is required');

        const membership = await getMembershipOrThrow(workspaceId, socket.data.userId);
        const comment = await commentService.updateComment(
          workspaceId,
          noteId,
          commentId,
          socket.data.userId,
          membership.role,
          { message },
        );

        workspaceBroadcast.commentUpdated(workspaceId, comment);
        if (typeof ack === 'function') ack({ success: true, data: { comment } });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update comment';
        logger.warn('comment:update failed', { message });
        if (typeof ack === 'function') ack({ success: false, error: message });
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.COMMENT_DELETE,
    async (
      payload: { workspaceId?: number; noteId?: number; commentId?: number },
      ack?: (response: unknown) => void,
    ) => {
      try {
        const workspaceId = parseId(payload?.workspaceId, 'workspaceId');
        const noteId = parseId(payload?.noteId, 'noteId');
        const commentId = parseId(payload?.commentId, 'commentId');

        const membership = await getMembershipOrThrow(workspaceId, socket.data.userId);
        await commentService.deleteComment(
          workspaceId,
          noteId,
          commentId,
          socket.data.userId,
          membership.role,
        );

        workspaceBroadcast.commentDeleted(workspaceId, noteId, commentId);
        if (typeof ack === 'function') ack({ success: true, data: { commentId, noteId } });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete comment';
        logger.warn('comment:delete failed', { message });
        if (typeof ack === 'function') ack({ success: false, error: message });
      }
    },
  );
};
