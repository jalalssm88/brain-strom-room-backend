import { MemberRole } from '../prisma';
import { ForbiddenError, NotFoundError } from '../errors/AppError';
import { noteRepository } from '../repositories/note.repository';
import { voteRepository, VoteWithUser } from '../repositories/vote.repository';
import {
  VoteResponse,
  VotesSummaryResponse,
  VoteToggleResponse,
} from '../types/vote.types';

const toVoteResponse = (vote: VoteWithUser): VoteResponse => ({
  id: vote.id,
  noteId: vote.noteId,
  userId: vote.userId,
  userName: vote.user.fullName,
  createdAt: vote.createdAt.toISOString(),
});

const canVote = (role: MemberRole): boolean =>
  role === MemberRole.ADMIN || role === MemberRole.EDITOR;

export class VoteService {
  private async assertNoteInWorkspace(workspaceId: number, noteId: number) {
    const note = await noteRepository.findById(noteId);
    if (!note || note.workspaceId !== workspaceId) {
      throw new NotFoundError('Note not found');
    }
    return note;
  }

  async listVotes(
    workspaceId: number,
    noteId: number,
    userId: number,
  ): Promise<VotesSummaryResponse> {
    await this.assertNoteInWorkspace(workspaceId, noteId);

    const votes = await voteRepository.findByNoteId(noteId);
    return {
      votes: votes.map(toVoteResponse),
      count: votes.length,
      hasVoted: votes.some((vote) => vote.userId === userId),
    };
  }

  async toggleVote(
    workspaceId: number,
    noteId: number,
    userId: number,
    role: MemberRole,
  ): Promise<VoteToggleResponse> {
    if (!canVote(role)) {
      throw new ForbiddenError('Viewers cannot vote');
    }

    await this.assertNoteInWorkspace(workspaceId, noteId);

    const existing = await voteRepository.findByNoteAndUser(noteId, userId);
    if (existing) {
      await voteRepository.delete(existing.id);
      const count = await voteRepository.countByNoteId(noteId);
      return { voted: false, count };
    }

    await voteRepository.create(noteId, userId);
    const count = await voteRepository.countByNoteId(noteId);
    return { voted: true, count };
  }
}

export const voteService = new VoteService();
