import { MemberRole } from '../prisma';
import { ForbiddenError, NotFoundError } from '../errors/AppError';
import { workspaceRepository, WorkspaceWithMemberCount } from '../repositories/workspace.repository';
import { workspaceMemberRepository } from '../repositories/workspaceMember.repository';
import { userRepository } from '../repositories/user.repository';
import { subscriptionService } from './subscription.service';
import { invitationService } from './invitation.service';
import { prisma } from '../config/database';
import { buildPaginatedResult } from '../helpers/pagination';
import { PaginatedResult, PaginationParams } from '../types/pagination.types';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceResponse,
  WorkspaceMemberResponse,
  WorkspaceTab,
} from '../types/workspace.types';
import { InviteMemberDto } from '../types/invitation.types';

const toWorkspaceResponse = (
  workspace: WorkspaceWithMemberCount,
  role: MemberRole,
): WorkspaceResponse => ({
  id: workspace.id,
  name: workspace.name,
  description: workspace.description,
  ownerId: workspace.ownerId,
  role,
  memberCount: workspace._count.members,
  createdAt: workspace.createdAt.toISOString(),
  updatedAt: workspace.updatedAt.toISOString(),
});

const toMemberResponse = (
  member: Awaited<ReturnType<typeof workspaceMemberRepository.findByWorkspaceId>>[number],
): WorkspaceMemberResponse => ({
  id: member.id,
  userId: member.user.id,
  fullName: member.user.fullName,
  email: member.user.email,
  avatar: member.user.avatar,
  role: member.role,
  joinedAt: member.joinedAt.toISOString(),
});

export class WorkspaceService {
  async getWorkspaceslist(
    userId: number,
    tab: WorkspaceTab,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<WorkspaceResponse>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (tab === 'pending') {
      return invitationService.listPendingForUser(userId, user.email, pagination);
    }

    if (tab === 'owned') {
      const [workspaces, total] = await Promise.all([
        workspaceRepository.findOwnedByUserId(userId, pagination.offset, pagination.limit),
        workspaceRepository.countOwnedByUserId(userId),
      ]);

      const items = workspaces.map((workspace) => toWorkspaceResponse(workspace, MemberRole.ADMIN));
      return buildPaginatedResult(items, total, pagination);
    }

    const [workspaces, total] = await Promise.all([
      workspaceRepository.findSharedByUserId(userId, pagination.offset, pagination.limit),
      workspaceRepository.countSharedByUserId(userId),
    ]);

    const items = workspaces.map((workspace) =>
      toWorkspaceResponse(workspace, workspace.members[0].role),
    );

    return buildPaginatedResult(items, total, pagination);
  }

  async getWorkspaceById(workspaceId: number, userId: number): Promise<WorkspaceResponse> {
    const membership = await workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const memberCount = await prisma.workspaceMember.count({ where: { workspaceId } });

    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      ownerId: workspace.ownerId,
      role: membership.role,
      memberCount,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    };
  }

  async createWorkspace(userId: number, dto: CreateWorkspaceDto): Promise<WorkspaceResponse> {
    const limit = await subscriptionService.getWorkspaceLimit(userId);
    const ownedCount = await workspaceRepository.countByOwnerId(userId);

    if (limit !== null && ownedCount >= limit) {
      throw new ForbiddenError(`Workspace limit reached (${limit} on your current plan)`);
    }

    const workspace = await prisma.$transaction(async (tx) => {
      const created = await tx.workspace.create({
        data: {
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
          ownerId: userId,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: created.id,
          userId,
          role: MemberRole.ADMIN,
        },
      });

      return created;
    });

    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      ownerId: workspace.ownerId,
      role: MemberRole.ADMIN,
      memberCount: 1,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    };
  }

  async updateWorkspace(
    workspaceId: number,
    userId: number,
    dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceResponse> {
    const membership = await workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership || membership.role !== MemberRole.ADMIN) {
      throw new ForbiddenError('Only workspace admins can rename the workspace');
    }

    const workspace = await workspaceRepository.updateName(workspaceId, dto.name);
    const memberCount = await prisma.workspaceMember.count({ where: { workspaceId } });

    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      ownerId: workspace.ownerId,
      role: membership.role,
      memberCount,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    };
  }

  async deleteWorkspace(workspaceId: number, userId: number): Promise<void> {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenError('Only the workspace owner can delete it');
    }

    await workspaceRepository.deleteById(workspaceId);
  }

  async listMembers(workspaceId: number, userId: number): Promise<WorkspaceMemberResponse[]> {
    const membership = await workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    const members = await workspaceMemberRepository.findByWorkspaceId(workspaceId);
    return members.map(toMemberResponse);
  }

  async inviteMember(
    workspaceId: number,
    invitedById: number,
    dto: InviteMemberDto,
  ): Promise<void> {
    await invitationService.inviteMember(workspaceId, invitedById, dto);
  }

  async removeMember(
    workspaceId: number,
    adminUserId: number,
    targetUserId: number,
  ): Promise<void> {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.ownerId === targetUserId) {
      throw new ForbiddenError('Cannot remove the workspace owner');
    }

    const adminMembership = await workspaceMemberRepository.findByWorkspaceAndUser(
      workspaceId,
      adminUserId,
    );
    if (!adminMembership || adminMembership.role !== MemberRole.ADMIN) {
      throw new ForbiddenError('Only workspace admins can remove members');
    }

    const targetMembership = await workspaceMemberRepository.findByWorkspaceAndUser(
      workspaceId,
      targetUserId,
    );
    if (!targetMembership) {
      throw new NotFoundError('Member not found in this workspace');
    }

    await workspaceMemberRepository.deleteByWorkspaceAndUser(workspaceId, targetUserId);
  }
}

export const workspaceService = new WorkspaceService();
