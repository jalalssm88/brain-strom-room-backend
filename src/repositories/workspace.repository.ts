import { Workspace, MemberRole } from '../prisma';
import { prisma } from '../config/database';

export interface CreateWorkspaceData {
  name: string;
  description?: string | null;
  ownerId: number;
}

export type WorkspaceWithMemberCount = Workspace & { _count: { members: number } };

export type WorkspaceWithMemberRole = WorkspaceWithMemberCount & {
  members: { role: MemberRole }[];
};

export class WorkspaceRepository {
  async create(data: CreateWorkspaceData): Promise<Workspace> {
    return prisma.workspace.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        ownerId: data.ownerId,
      },
    });
  }

  async findById(id: number): Promise<Workspace | null> {
    return prisma.workspace.findUnique({ where: { id } });
  }

  async countByOwnerId(ownerId: number): Promise<number> {
    return prisma.workspace.count({ where: { ownerId } });
  }

  async findOwnedByUserId(
    userId: number,
    offset: number,
    limit: number,
  ): Promise<WorkspaceWithMemberCount[]> {
    return prisma.workspace.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { members: true } } },
      orderBy: { updatedAt: 'desc' },
      skip: offset,
      take: limit,
    });
  }

  async countOwnedByUserId(userId: number): Promise<number> {
    return prisma.workspace.count({ where: { ownerId: userId } });
  }

  async findSharedByUserId(
    userId: number,
    offset: number,
    limit: number,
  ): Promise<WorkspaceWithMemberRole[]> {
    return prisma.workspace.findMany({
      where: {
        ownerId: { not: userId },
        members: { some: { userId } },
      },
      include: {
        _count: { select: { members: true } },
        members: {
          where: { userId },
          select: { role: true },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: offset,
      take: limit,
    });
  }

  async countSharedByUserId(userId: number): Promise<number> {
    return prisma.workspace.count({
      where: {
        ownerId: { not: userId },
        members: { some: { userId } },
      },
    });
  }

  async updateName(id: number, name: string): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data: { name: name.trim() },
    });
  }

  async deleteById(id: number): Promise<void> {
    await prisma.workspace.delete({ where: { id } });
  }
}

export const workspaceRepository = new WorkspaceRepository();
