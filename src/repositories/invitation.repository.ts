import { InvitationStatus, MemberRole, Prisma } from '../prisma';
import { prisma } from '../config/database';

export interface CreateInvitationData {
  workspaceId: number;
  invitedById: number;
  inviteeEmail: string;
  inviteeId?: number | null;
  role: MemberRole;
  tokenHash: string;
  expiresAt: Date;
}

export type InvitationWithWorkspace = Prisma.InvitationGetPayload<{
  include: {
    workspace: { select: { id: true; name: true; description: true; ownerId: true } };
  };
}>;

export class InvitationRepository {
  async create(data: CreateInvitationData) {
    return prisma.invitation.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<InvitationWithWorkspace | null> {
    return prisma.invitation.findUnique({
      where: { tokenHash },
      include: {
        workspace: { select: { id: true, name: true, description: true, ownerId: true } },
      },
    });
  }

  async findById(id: number): Promise<InvitationWithWorkspace | null> {
    return prisma.invitation.findUnique({
      where: { id },
      include: {
        workspace: { select: { id: true, name: true, description: true, ownerId: true } },
      },
    });
  }

  async findPendingByEmail(
    email: string,
    offset: number,
    limit: number,
  ): Promise<InvitationWithWorkspace[]> {
    return prisma.invitation.findMany({
      where: {
        inviteeEmail: email.toLowerCase(),
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      include: {
        workspace: { select: { id: true, name: true, description: true, ownerId: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
  }

  async countPendingByEmail(email: string): Promise<number> {
    return prisma.invitation.count({
      where: {
        inviteeEmail: email.toLowerCase(),
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async findPendingByWorkspaceAndEmail(
    workspaceId: number,
    email: string,
  ): Promise<InvitationWithWorkspace | null> {
    return prisma.invitation.findFirst({
      where: {
        workspaceId,
        inviteeEmail: email.toLowerCase(),
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      include: {
        workspace: { select: { id: true, name: true, description: true, ownerId: true } },
      },
    });
  }

  async updateStatus(id: number, status: InvitationStatus): Promise<void> {
    await prisma.invitation.update({ where: { id }, data: { status } });
  }
}

export const invitationRepository = new InvitationRepository();
