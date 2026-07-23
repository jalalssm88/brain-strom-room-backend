import { chatService } from '../../services/chat.service';
import { BadRequestError } from '../../errors/AppError';
import { AuthenticatedSocket } from '../middleware/auth';
import { SOCKET_EVENTS, SOCKET_BROADCAST_EVENTS } from '../events';
import { emitToWorkspace } from '../emit';
import { assertEditorRole, getMembershipOrThrow } from './workspace.handler';
import { logger } from '../../utils/logger';

const parseWorkspaceId = (value: unknown): number => {
  const workspaceId = Number(value);
  if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
    throw new BadRequestError('Valid workspaceId is required');
  }
  return workspaceId;
};

export const registerChatHandlers = (socket: AuthenticatedSocket): void => {
  socket.on(
    SOCKET_EVENTS.CHAT_MESSAGE,
    async (
      payload: { workspaceId?: number; message?: string },
      ack?: (response: unknown) => void,
    ) => {
      try {
        const workspaceId = parseWorkspaceId(payload?.workspaceId);
        const membership = await getMembershipOrThrow(workspaceId, socket.data.userId);
        assertEditorRole(membership.role);

        const chatMessage = await chatService.sendMessage(
          workspaceId,
          socket.data.userId,
          membership.role,
          { message: payload?.message ?? '' },
        );

        emitToWorkspace(workspaceId, SOCKET_BROADCAST_EVENTS.CHAT_MESSAGE, {
          message: chatMessage,
        });

        if (typeof ack === 'function') {
          ack({ success: true, data: { message: chatMessage } });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send chat message';
        logger.warn('chat:message failed', { message });
        if (typeof ack === 'function') {
          ack({ success: false, error: message });
        }
      }
    },
  );
};
