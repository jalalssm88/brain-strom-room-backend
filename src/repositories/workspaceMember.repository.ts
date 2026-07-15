import { MemberRole, WorkspaceMember, Prisma } from '../prisma';
import { prisma } from '../config/database';

export interface CreateWorkspaceMemberData {
  workspaceId: number;
  userId: number;
  role: MemberRole;
}

export type WorkspaceMemberWithUser = Prisma.WorkspaceMemberGetPayload<{
  include: { user: { select: { id: true; fullName: true; email: true; avatar: true } } };
}>;

export class WorkspaceMemberRepository {
  async create(data: CreateWorkspaceMemberData): Promise<WorkspaceMember> {
    return prisma.workspaceMember.create({ data });
  }

  async findByWorkspaceAndUser(
    workspaceId: number,
    userId: number,
  ): Promise<WorkspaceMember | null> {
    return prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });
  }

  async findByWorkspaceId(workspaceId: number): Promise<WorkspaceMemberWithUser[]> {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async deleteByWorkspaceAndUser(workspaceId: number, userId: number): Promise<void> {
    await prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }
}

export const workspaceMemberRepository = new WorkspaceMemberRepository();
