import { prisma } from '../config/database';

const voteWithUserInclude = {
  user: {
    select: {
      id: true,
      fullName: true,
    },
  },
} as const;

export type VoteWithUser = {
  id: number;
  noteId: number;
  userId: number;
  createdAt: Date;
  user: {
    id: number;
    fullName: string;
  };
};

export class VoteRepository {
  async findByNoteId(noteId: number): Promise<VoteWithUser[]> {
    return prisma.vote.findMany({
      where: { noteId },
      include: voteWithUserInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByNoteAndUser(noteId: number, userId: number): Promise<VoteWithUser | null> {
    return prisma.vote.findUnique({
      where: { noteId_userId: { noteId, userId } },
      include: voteWithUserInclude,
    });
  }

  async findVotedNoteIds(noteIds: number[], userId: number): Promise<number[]> {
    if (noteIds.length === 0) return [];

    const votes = await prisma.vote.findMany({
      where: { userId, noteId: { in: noteIds } },
      select: { noteId: true },
    });

    return votes.map((vote) => vote.noteId);
  }

  async countByNoteId(noteId: number): Promise<number> {
    return prisma.vote.count({ where: { noteId } });
  }

  async create(noteId: number, userId: number): Promise<VoteWithUser> {
    return prisma.vote.create({
      data: { noteId, userId },
      include: voteWithUserInclude,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.vote.delete({ where: { id } });
  }
}

export const voteRepository = new VoteRepository();
