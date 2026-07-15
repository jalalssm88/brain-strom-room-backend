import { Request } from 'express';
import { WorkspaceMember } from '../prisma';

declare global {
  namespace Express {
    interface Request {
      /** Set by authenticate middleware */
      userId?: number;
      /** Set by requireWorkspaceRole / requireWorkspaceMember middleware */
      workspaceId?: number;
      workspaceMember?: WorkspaceMember;
    }
  }
}

export {};
