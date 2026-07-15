import { prisma } from '../config/database';
import { CreateNoteDto, UpdateNoteDto } from '../types/note.types';

const noteWithAuthorInclude = {
  author: {
    select: {
      id: true,
      fullName: true,
    },
  },
} as const;

export type NoteWithAuthor = {
  id: number;
  workspaceId: number;
  createdById: number;
  title: string;
  content: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: {
    id: number;
    fullName: string;
  };
};

export class NoteRepository {
  async findByWorkspaceId(workspaceId: number): Promise<NoteWithAuthor[]> {
    return prisma.note.findMany({
      where: { workspaceId, deletedAt: null },
      include: noteWithAuthorInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: number): Promise<NoteWithAuthor | null> {
    return prisma.note.findFirst({
      where: { id, deletedAt: null },
      include: noteWithAuthorInclude,
    });
  }

  async create(
    workspaceId: number,
    createdById: number,
    dto: CreateNoteDto,
  ): Promise<NoteWithAuthor> {
    return prisma.note.create({
      data: {
        workspaceId,
        createdById,
        title: dto.title.trim(),
        content: dto.content?.trim() ?? '',
        color: dto.color ?? '#FDE68A',
        x: dto.x ?? 80,
        y: dto.y ?? 80,
        width: dto.width ?? 200,
        height: dto.height ?? 150,
      },
      include: noteWithAuthorInclude,
    });
  }

  async update(id: number, dto: UpdateNoteDto): Promise<NoteWithAuthor> {
    return prisma.note.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.content !== undefined ? { content: dto.content.trim() } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.x !== undefined ? { x: dto.x } : {}),
        ...(dto.y !== undefined ? { y: dto.y } : {}),
        ...(dto.width !== undefined ? { width: dto.width } : {}),
        ...(dto.height !== undefined ? { height: dto.height } : {}),
      },
      include: noteWithAuthorInclude,
    });
  }

  async softDelete(id: number): Promise<void> {
    await prisma.note.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const noteRepository = new NoteRepository();
