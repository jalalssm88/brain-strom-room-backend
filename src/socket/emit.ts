import { getIO } from './io';
import { SOCKET_BROADCAST_EVENTS } from './events';
import { userRoom, workspaceRoom } from './rooms';
import { logger } from '../utils/logger';
import { PresenceUser } from './presence';

const safeEmit = (fn: () => void): void => {
  try {
    fn();
  } catch (err) {
    logger.warn('Socket emit skipped', {
      message: err instanceof Error ? err.message : 'unknown',
    });
  }
};

export const emitToWorkspace = (
  workspaceId: number,
  event: string,
  payload: unknown,
): void => {
  safeEmit(() => {
    getIO().to(workspaceRoom(workspaceId)).emit(event, payload);
  });
};

export const emitToUser = (userId: number, event: string, payload: unknown): void => {
  safeEmit(() => {
    getIO().to(userRoom(userId)).emit(event, payload);
  });
};

export const emitPresenceUpdate = (workspaceId: number, users: PresenceUser[]): void => {
  emitToWorkspace(workspaceId, SOCKET_BROADCAST_EVENTS.PRESENCE_UPDATE, { workspaceId, users });
};

export const workspaceBroadcast = {
  noteCreated: (workspaceId: number, note: unknown) =>
    emitToWorkspace(workspaceId, SOCKET_BROADCAST_EVENTS.NOTE_CREATED, { note }),
  noteUpdated: (workspaceId: number, note: unknown) =>
    emitToWorkspace(workspaceId, SOCKET_BROADCAST_EVENTS.NOTE_UPDATED, { note }),
  noteDeleted: (workspaceId: number, noteId: number) =>
    emitToWorkspace(workspaceId, SOCKET_BROADCAST_EVENTS.NOTE_DELETED, { workspaceId, noteId }),
  commentCreated: (workspaceId: number, comment: unknown) =>
    emitToWorkspace(workspaceId, SOCKET_BROADCAST_EVENTS.COMMENT_CREATED, { comment }),
  commentUpdated: (workspaceId: number, comment: unknown) =>
    emitToWorkspace(workspaceId, SOCKET_BROADCAST_EVENTS.COMMENT_UPDATED, { comment }),
  commentDeleted: (workspaceId: number, noteId: number, commentId: number) =>
    emitToWorkspace(workspaceId, SOCKET_BROADCAST_EVENTS.COMMENT_DELETED, {
      workspaceId,
      noteId,
      commentId,
    }),
  voteCreated: (workspaceId: number, payload: { noteId: number; userId: number; count: number }) =>
    emitToWorkspace(workspaceId, SOCKET_BROADCAST_EVENTS.VOTE_CREATED, payload),
  voteDeleted: (workspaceId: number, payload: { noteId: number; userId: number; count: number }) =>
    emitToWorkspace(workspaceId, SOCKET_BROADCAST_EVENTS.VOTE_DELETED, payload),
};
