import { MemberRole } from '../prisma';
import { ForbiddenError, NotFoundError } from '../errors/AppError';
import { commentRepository, CommentWithAuthor } from '../repositories/comment.repository';
import { noteRepository } from '../repositories/note.repository';
import {
  CommentResponse,
  CreateCommentDto,
  UpdateCommentDto,
} from '../types/comment.types';

const toCommentResponse = (comment: CommentWithAuthor): CommentResponse => ({
  id: comment.id,
  noteId: comment.noteId,
  userId: comment.userId,
  message: comment.message,
  authorName: comment.author.fullName,
  createdAt: comment.createdAt.toISOString(),
  updatedAt: comment.updatedAt.toISOString(),
});

const canWriteComments = (role: MemberRole): boolean =>
  role === MemberRole.ADMIN || role === MemberRole.EDITOR;

export class CommentService {
  private async assertNoteInWorkspace(workspaceId: number, noteId: number) {
    const note = await noteRepository.findById(noteId);
    if (!note || note.workspaceId !== workspaceId) {
      throw new NotFoundError('Note not found');
    }
    return note;
  }

  async listComments(workspaceId: number, noteId: number): Promise<CommentResponse[]> {
    await this.assertNoteInWorkspace(workspaceId, noteId);
    const comments = await commentRepository.findByNoteId(noteId);
    return comments.map(toCommentResponse);
  }

  async createComment(
    workspaceId: number,
    noteId: number,
    userId: number,
    role: MemberRole,
    dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    if (!canWriteComments(role)) {
      throw new ForbiddenError('Viewers cannot add comments');
    }

    await this.assertNoteInWorkspace(workspaceId, noteId);
    const comment = await commentRepository.create(noteId, userId, dto);
    return toCommentResponse(comment);
  }

  async updateComment(
    workspaceId: number,
    noteId: number,
    commentId: number,
    userId: number,
    role: MemberRole,
    dto: UpdateCommentDto,
  ): Promise<CommentResponse> {
    if (!canWriteComments(role)) {
      throw new ForbiddenError('Viewers cannot edit comments');
    }

    await this.assertNoteInWorkspace(workspaceId, noteId);

    const comment = await commentRepository.findById(commentId);
    if (!comment || comment.noteId !== noteId) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only edit your own comments');
    }

    const updated = await commentRepository.update(commentId, dto);
    return toCommentResponse(updated);
  }

  async deleteComment(
    workspaceId: number,
    noteId: number,
    commentId: number,
    userId: number,
    role: MemberRole,
  ): Promise<void> {
    if (!canWriteComments(role)) {
      throw new ForbiddenError('Viewers cannot delete comments');
    }

    await this.assertNoteInWorkspace(workspaceId, noteId);

    const comment = await commentRepository.findById(commentId);
    if (!comment || comment.noteId !== noteId) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await commentRepository.delete(commentId);
  }
}

export const commentService = new CommentService();
