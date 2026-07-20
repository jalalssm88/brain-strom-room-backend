import { noteService } from '../../services/note.service';
import { CreateNoteDto, UpdateNoteDto } from '../../types/note.types';
import { BadRequestError } from '../../errors/AppError';
import { AuthenticatedSocket } from '../middleware/auth';
import { SOCKET_EVENTS } from '../events';
import { workspaceBroadcast } from '../emit';
import { assertEditorRole, getMembershipOrThrow } from './workspace.handler';
import { logger } from '../../utils/logger';

const parseWorkspaceId = (value: unknown): number => {
  const workspaceId = Number(value);
  if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
    throw new BadRequestError('Valid workspaceId is required');
  }
  return workspaceId;
};

const parseNoteId = (value: unknown): number => {
  const noteId = Number(value);
  if (!Number.isInteger(noteId) || noteId <= 0) {
    throw new BadRequestError('Valid noteId is required');
  }
  return noteId;
};

export const registerNoteHandlers = (socket: AuthenticatedSocket): void => {
  socket.on(
    SOCKET_EVENTS.NOTE_CREATE,
    async (
      payload: CreateNoteDto & { workspaceId?: number },
      ack?: (response: unknown) => void,
    ) => {
      try {
        const workspaceId = parseWorkspaceId(payload?.workspaceId);
        const membership = await getMembershipOrThrow(workspaceId, socket.data.userId);
        assertEditorRole(membership.role);

        if (!payload?.title?.trim()) {
          throw new BadRequestError('Title is required');
        }

        const note = await noteService.createNote(
          workspaceId,
          socket.data.userId,
          membership.role,
          {
            title: payload.title,
            content: payload.content,
            color: payload.color,
            x: payload.x,
            y: payload.y,
            width: payload.width,
            height: payload.height,
          },
        );

        workspaceBroadcast.noteCreated(workspaceId, note);
        if (typeof ack === 'function') ack({ success: true, data: { note } });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create note';
        logger.warn('note:create failed', { message });
        if (typeof ack === 'function') ack({ success: false, error: message });
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.NOTE_UPDATE,
    async (
      payload: UpdateNoteDto & { workspaceId?: number; noteId?: number },
      ack?: (response: unknown) => void,
    ) => {
      try {
        const workspaceId = parseWorkspaceId(payload?.workspaceId);
        const noteId = parseNoteId(payload?.noteId);
        const membership = await getMembershipOrThrow(workspaceId, socket.data.userId);

        const note = await noteService.updateNote(
          workspaceId,
          noteId,
          socket.data.userId,
          membership.role,
          {
            title: payload.title,
            content: payload.content,
            color: payload.color,
            x: payload.x,
            y: payload.y,
            width: payload.width,
            height: payload.height,
          },
        );

        workspaceBroadcast.noteUpdated(workspaceId, note);
        if (typeof ack === 'function') ack({ success: true, data: { note } });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update note';
        logger.warn('note:update failed', { message });
        if (typeof ack === 'function') ack({ success: false, error: message });
      }
    },
  );

  socket.on(
    SOCKET_EVENTS.NOTE_DELETE,
    async (
      payload: { workspaceId?: number; noteId?: number },
      ack?: (response: unknown) => void,
    ) => {
      try {
        const workspaceId = parseWorkspaceId(payload?.workspaceId);
        const noteId = parseNoteId(payload?.noteId);
        const membership = await getMembershipOrThrow(workspaceId, socket.data.userId);

        await noteService.deleteNote(
          workspaceId,
          noteId,
          socket.data.userId,
          membership.role,
        );

        workspaceBroadcast.noteDeleted(workspaceId, noteId);
        if (typeof ack === 'function') ack({ success: true, data: { noteId } });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete note';
        logger.warn('note:delete failed', { message });
        if (typeof ack === 'function') ack({ success: false, error: message });
      }
    },
  );
};
