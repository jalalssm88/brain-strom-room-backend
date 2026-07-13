import { MemberRole } from '@prisma/client';

export type WorkspaceTab = 'owned' | 'shared' | 'pending';

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceDto {
  name: string;
}

export interface WorkspaceResponse {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  role: MemberRole;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  invitationId?: number;
  invitedBy?: string;
  expiresAt?: string;
}

export interface WorkspaceMemberResponse {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  avatar: string | null;
  role: MemberRole;
  joinedAt: string;
}
