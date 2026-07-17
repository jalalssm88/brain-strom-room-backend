import { MemberRole } from '../prisma';
import { ForbiddenError, NotFoundError } from '../errors/AppError';
import { noteRepository, NoteWithAuthor } from '../repositories/note.repository';
import { voteRepository } from '../repositories/vote.repository';
import {
  CreateNoteDto,
  NoteResponse,
  UpdateNoteDto,
} from '../types/note.types';

const toNoteResponse = (note: NoteWithAuthor, hasVoted = false): NoteResponse => ({
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
  voteCount: note._count.votes,
  commentCount: note._count.comments,
  hasVoted,
  createdAt: note.createdAt.toISOString(),
  updatedAt: note.updatedAt.toISOString(),
});

const canCreateOrEditNotes = (role: MemberRole): boolean =>
  role === MemberRole.ADMIN || role === MemberRole.EDITOR;

export class NoteService {
  async listNotes(workspaceId: number, userId: number): Promise<NoteResponse[]> {
    const notes = await noteRepository.findByWorkspaceId(workspaceId);
    const votedNoteIds = await voteRepository.findVotedNoteIds(
      notes.map((note) => note.id),
      userId,
    );
    const votedSet = new Set(votedNoteIds);

    return notes.map((note) => toNoteResponse(note, votedSet.has(note.id)));
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
    return toNoteResponse(note, false);
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
    const userVote = await voteRepository.findByNoteAndUser(noteId, userId);
    return toNoteResponse(updated, Boolean(userVote));
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
