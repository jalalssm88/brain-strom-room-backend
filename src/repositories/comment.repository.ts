import { prisma } from '../config/database';
import { CreateCommentDto, UpdateCommentDto } from '../types/comment.types';

const commentWithAuthorInclude = {
  author: {
    select: {
      id: true,
      fullName: true,
    },
  },
} as const;

export type CommentWithAuthor = {
  id: number;
  noteId: number;
  userId: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    fullName: string;
  };
};

export class CommentRepository {
  async findByNoteId(noteId: number): Promise<CommentWithAuthor[]> {
    return prisma.comment.findMany({
      where: { noteId },
      include: commentWithAuthorInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: number): Promise<CommentWithAuthor | null> {
    return prisma.comment.findUnique({
      where: { id },
      include: commentWithAuthorInclude,
    });
  }

  async create(noteId: number, userId: number, dto: CreateCommentDto): Promise<CommentWithAuthor> {
    return prisma.comment.create({
      data: {
        noteId,
        userId,
        message: dto.message.trim(),
      },
      include: commentWithAuthorInclude,
    });
  }

  async update(id: number, dto: UpdateCommentDto): Promise<CommentWithAuthor> {
    return prisma.comment.update({
      where: { id },
      data: { message: dto.message.trim() },
      include: commentWithAuthorInclude,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.comment.delete({ where: { id } });
  }
}

export const commentRepository = new CommentRepository();
