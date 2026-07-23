import { MemberRole } from '../prisma';

export interface InviteMemberDto {
  email: string;
  role: MemberRole;
}

export interface RespondInvitationDto {
  invitationId: number;
  action: 'accept' | 'decline';
}
