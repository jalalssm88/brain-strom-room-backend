import { MemberRole } from '../prisma';

export interface InviteMemberDto {
  email: string;
  role: MemberRole;
}

export interface RespondInvitationDto {
  invitationId: number;
  action: 'accept' | 'decline';
}

export interface InvitationResponse {
  id: number;
  workspaceId: number;
  workspaceName: string;
  inviteeEmail: string;
  role: MemberRole;
  status: string;
  invitedByName: string;
  expiresAt: string;
  createdAt: string;
}
