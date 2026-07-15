import { MemberRole } from '../prisma';
import { ForbiddenError, NotFoundError } from '../errors/AppError';
import { noteRepository, NoteWithAuthor } from '../repositories/note.repository';
import {
  CreateNoteDto,
  NoteResponse,
  UpdateNoteDto,
} from '../types/note.types';

const toNoteResponse = (note: NoteWithAuthor): NoteResponse => ({
  id: note.id,
  workspaceId: note.workspaceId,
  createdById: note.createdById,
  title: note.title,
  content: note.content,
  color: note.color,
  x: note.x,
  y: note.y,
  width: note.width,
  height: note.height,
  authorName: note.author.fullName,
  createdAt: note.createdAt.toISOString(),
  updatedAt: note.updatedAt.toISOString(),
});

const canCreateOrEditNotes = (role: MemberRole): boolean =>
  role === MemberRole.ADMIN || role === MemberRole.EDITOR;

export class NoteService {
  async listNotes(workspaceId: number): Promise<NoteResponse[]> {
    const notes = await noteRepository.findByWorkspaceId(workspaceId);
    return notes.map(toNoteResponse);
  }

  async createNote(
    workspaceId: number,
    userId: number,
    role: MemberRole,
    dto: CreateNoteDto,
  ): Promise<NoteResponse> {
    if (!canCreateOrEditNotes(role)) {
      throw new ForbiddenError('Viewers cannot create notes');
    }

    const note = await noteRepository.create(workspaceId, userId, dto);
    return toNoteResponse(note);
  }

  async updateNote(
    workspaceId: number,
    noteId: number,
    userId: number,
    role: MemberRole,
    dto: UpdateNoteDto,
  ): Promise<NoteResponse> {
    if (!canCreateOrEditNotes(role)) {
      throw new ForbiddenError('Viewers cannot edit notes');
    }

    const note = await noteRepository.findById(noteId);
    if (!note || note.workspaceId !== workspaceId) {
      throw new NotFoundError('Note not found');
    }

    if (note.createdById !== userId) {
      throw new ForbiddenError('You can only edit your own notes');
    }

    const updated = await noteRepository.update(noteId, dto);
    return toNoteResponse(updated);
  }

  async deleteNote(
    workspaceId: number,
    noteId: number,
    userId: number,
    role: MemberRole,
  ): Promise<void> {
    if (!canCreateOrEditNotes(role)) {
      throw new ForbiddenError('Viewers cannot delete notes');
    }

    const note = await noteRepository.findById(noteId);
    if (!note || note.workspaceId !== workspaceId) {
      throw new NotFoundError('Note not found');
    }

    if (note.createdById !== userId) {
      throw new ForbiddenError('You can only delete your own notes');
    }

    await noteRepository.softDelete(noteId);
  }
}

export const noteService = new NoteService();
