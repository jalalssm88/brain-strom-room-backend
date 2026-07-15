import { InvitationStatus, MemberRole, NotificationRefType, NotificationType } from '../prisma';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/AppError';
import { INVITATION_EXPIRES_HOURS } from '../constants/auth';
import { invitationRepository } from '../repositories/invitation.repository';
import { workspaceRepository } from '../repositories/workspace.repository';
import { workspaceMemberRepository } from '../repositories/workspaceMember.repository';
import { userRepository } from '../repositories/user.repository';
import { emailService } from './email.service';
import { notificationService } from './notification.service';
import { hashToken } from '../utils/hash';
import { generateSecureToken } from '../utils/token';
import { prisma } from '../config/database';
import { buildPaginatedResult } from '../helpers/pagination';
import { PaginatedResult, PaginationParams } from '../types/pagination.types';
import { InviteMemberDto, RespondInvitationDto } from '../types/invitation.types';
import { WorkspaceResponse } from '../types/workspace.types';

const getInvitationExpiry = (): Date => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + INVITATION_EXPIRES_HOURS);
  return expiresAt;
};

export class InvitationService {
  async inviteMember(
    workspaceId: number,
    invitedById: number,
    dto: InviteMemberDto,
  ): Promise<void> {
    if (dto.role === MemberRole.ADMIN) {
      throw new BadRequestError('Cannot invite members as ADMIN');
    }

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const inviter = await userRepository.findById(invitedById);
    if (!inviter) {
      throw new NotFoundError('User not found');
    }

    const inviteeEmail = dto.email.toLowerCase();

    if (inviteeEmail === inviter.email.toLowerCase()) {
      throw new BadRequestError('You cannot invite yourself');
    }

    const invitee = await userRepository.findByEmail(inviteeEmail);
    if (!invitee) {
      throw new NotFoundError('User not found');
    }

    const membership = await workspaceMemberRepository.findByWorkspaceAndUser(
      workspaceId,
      invitee.id,
    );
    if (membership) {
      throw new ConflictError('User is already a member of this workspace');
    }

    const existingInvite = await invitationRepository.findPendingByWorkspaceAndEmail(
      workspaceId,
      inviteeEmail,
    );
    if (existingInvite) {
      throw new ConflictError('A pending invitation already exists for this email');
    }

    const token = generateSecureToken();
    const tokenHash = hashToken(token);

    const invitation = await invitationRepository.create({
      workspaceId,
      invitedById,
      inviteeEmail,
      inviteeId: invitee.id,
      role: dto.role,
      tokenHash,
      expiresAt: getInvitationExpiry(),
    });

    await emailService.sendWorkspaceInviteEmail(
      inviteeEmail,
      workspace.name,
      dto.role,
      token,
    );

    await notificationService.create({
      userId: invitee.id,
      type: NotificationType.WORKSPACE_INVITE,
      title: 'Workspace invitation',
      message: `${inviter.fullName} invited you to join "${workspace.name}" as ${dto.role}`,
      referenceType: NotificationRefType.INVITATION,
      referenceId: invitation.id,
    });
  }

  async acceptByToken(userId: number, token: string): Promise<WorkspaceResponse> {
    const invitation = await this.getValidInvitationByToken(token);
    await this.assertInvitee(userId, invitation.inviteeEmail);
    return this.acceptInvitation(userId, invitation);
  }

  async respond(userId: number, dto: RespondInvitationDto): Promise<WorkspaceResponse | void> {
    const invitation = await invitationRepository.findById(dto.invitationId);
    if (!invitation || invitation.status !== InvitationStatus.PENDING) {
      throw new NotFoundError('Invitation not found');
    }

    if (invitation.expiresAt < new Date()) {
      await invitationRepository.updateStatus(invitation.id, InvitationStatus.EXPIRED);
      throw new BadRequestError('Invitation has expired');
    }

    await this.assertInvitee(userId, invitation.inviteeEmail);

    if (dto.action === 'decline') {
      await invitationRepository.updateStatus(invitation.id, InvitationStatus.DECLINED);
      return;
    }

    return this.acceptInvitation(userId, invitation);
  }

  async listPendingForUser(
    _userId: number,
    email: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<WorkspaceResponse>> {
    const [invitations, total] = await Promise.all([
      invitationRepository.findPendingByEmail(email, pagination.offset, pagination.limit),
      invitationRepository.countPendingByEmail(email),
    ]);

    const items = invitations.map((invitation) => ({
      id: invitation.workspace.id,
      name: invitation.workspace.name,
      description: invitation.workspace.description,
      ownerId: invitation.workspace.ownerId,
      role: invitation.role,
      memberCount: 0,
      createdAt: invitation.createdAt.toISOString(),
      updatedAt: invitation.createdAt.toISOString(),
      invitationId: invitation.id,
      invitedBy: undefined,
      expiresAt: invitation.expiresAt.toISOString(),
    }));

    return buildPaginatedResult(items, total, pagination);
  }

  private async getValidInvitationByToken(token: string) {
    const tokenHash = hashToken(token);
    const invitation = await invitationRepository.findByTokenHash(tokenHash);

    if (!invitation || invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestError('Invalid or expired invitation');
    }

    if (invitation.expiresAt < new Date()) {
      await invitationRepository.updateStatus(invitation.id, InvitationStatus.EXPIRED);
      throw new BadRequestError('Invitation has expired');
    }

    return invitation;
  }

  private async assertInvitee(userId: number, inviteeEmail: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user || user.email.toLowerCase() !== inviteeEmail.toLowerCase()) {
      throw new ForbiddenError('This invitation is not for your account');
    }
  }

  private async acceptInvitation(
    userId: number,
    invitation: NonNullable<Awaited<ReturnType<typeof invitationRepository.findById>>>,
  ): Promise<WorkspaceResponse> {
    const existingMembership = await workspaceMemberRepository.findByWorkspaceAndUser(
      invitation.workspaceId,
      userId,
    );
    if (existingMembership) {
      await invitationRepository.updateStatus(invitation.id, InvitationStatus.ACCEPTED);
      throw new ConflictError('You are already a member of this workspace');
    }

    await prisma.$transaction(async (tx) => {
      await tx.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId,
          role: invitation.role,
        },
      });
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED, inviteeId: userId },
      });
    });

    const memberCount = await prisma.workspaceMember.count({
      where: { workspaceId: invitation.workspaceId },
    });

    return {
      id: invitation.workspace.id,
      name: invitation.workspace.name,
      description: invitation.workspace.description,
      ownerId: invitation.workspace.ownerId,
      role: invitation.role,
      memberCount,
      createdAt: invitation.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const invitationService = new InvitationService();
