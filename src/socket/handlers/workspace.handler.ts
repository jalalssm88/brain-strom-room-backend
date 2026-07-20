import { workspaceMemberRepository } from '../../repositories/workspaceMember.repository';
import { ForbiddenError, BadRequestError } from '../../errors/AppError';
import { MemberRole } from '../../prisma';
import { AuthenticatedSocket } from '../middleware/auth';
import { presenceStore } from '../presence';
import { selectionStore } from '../selection';
import { emitPresenceUpdate } from '../emit';
import { workspaceRoom } from '../rooms';
import { SOCKET_EVENTS, SOCKET_BROADCAST_EVENTS } from '../events';
import { logger } from '../../utils/logger';

export const getMembershipOrThrow = async (workspaceId: number, userId: number) => {
  const membership = await workspaceMemberRepository.findByWorkspaceAndUser(
    workspaceId,
    userId,
  );
  if (!membership) {
    throw new ForbiddenError('You are not a member of this workspace');
  }
  return membership;
};

export const registerWorkspaceHandlers = (socket: AuthenticatedSocket): void => {
  socket.on(SOCKET_EVENTS.WORKSPACE_JOIN, async (payload: { workspaceId?: number }, ack?) => {
    try {
      const workspaceId = payload?.workspaceId ?? 0;
      await getMembershipOrThrow(workspaceId, socket.data.userId);

      // Leave previous workspace rooms for this socket (single active board join).
      for (const previousId of presenceStore.getWorkspacesForSocket(socket.id)) {
        if (previousId === workspaceId) continue;
        await leaveWorkspaceRoom(socket, previousId);
      }

      await socket.join(workspaceRoom(workspaceId));

      const users = presenceStore.add(workspaceId, socket.id, {
        userId: socket.data.userId,
        fullName: socket.data.fullName,
        avatar: socket.data.avatar,
      });
      emitPresenceUpdate(workspaceId, users);

      if (typeof ack === 'function') {
        ack({
          success: true,
          data: {
            workspaceId,
            users,
            selections: selectionStore.list(workspaceId),
          },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join workspace';
      logger.warn('workspace:join failed', { message, socketId: socket.id });
      if (typeof ack === 'function') {
        ack({ success: false, error: message });
      }
    }
  });

  socket.on(SOCKET_EVENTS.WORKSPACE_LEAVE, async (payload: { workspaceId?: number }, ack?) => {
    try {
      const workspaceId = payload?.workspaceId ?? 0;
      await leaveWorkspaceRoom(socket, workspaceId);

      if (typeof ack === 'function') {
        ack({ success: true, data: { workspaceId } });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave workspace';
      logger.warn('workspace:leave failed', { message, socketId: socket.id });
      if (typeof ack === 'function') {
        ack({ success: false, error: message });
      }
    }
  });
};

const leaveWorkspaceRoom = async (
  socket: AuthenticatedSocket,
  workspaceId: number,
): Promise<void> => {
  await socket.leave(workspaceRoom(workspaceId));

  const users = presenceStore.remove(workspaceId, socket.id);
  emitPresenceUpdate(workspaceId, users);

  selectionStore.clearUser(workspaceId, socket.data.userId);
  socket.to(workspaceRoom(workspaceId)).emit(SOCKET_BROADCAST_EVENTS.SELECTION_UPDATE, {
    workspaceId,
    userId: socket.data.userId,
    noteId: null,
  });
};

export const assertEditorRole = (role: MemberRole): void => {
  if (role !== MemberRole.ADMIN && role !== MemberRole.EDITOR) {
    throw new ForbiddenError('Viewers cannot perform this action');
  }
};
