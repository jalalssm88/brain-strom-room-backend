import { Request, Response, NextFunction } from 'express';
import { MemberRole } from '@prisma/client';
import { ForbiddenError, BadRequestError } from '../errors/AppError';
import { workspaceMemberRepository } from '../repositories/workspaceMember.repository';

const parseWorkspaceId = (req: Request): number => {
  const workspaceId = Number(req.params.id);
  if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
    throw new BadRequestError('Invalid workspace ID');
  }
  return workspaceId;
};

export const requireWorkspaceMember = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const workspaceId = parseWorkspaceId(req);
    const userId = req.userId!;

    const membership = await workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    req.workspaceId = workspaceId;
    req.workspaceMember = membership;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireWorkspaceRole = (...roles: MemberRole[]) => {
  console.log('requireWorkspaceRole', roles);
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = parseWorkspaceId(req);
      const userId = req.userId!;

      const membership = await workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
      if (!membership) {
        throw new ForbiddenError('You are not a member of this workspace');
      }

      if (!roles.includes(membership.role)) {
        throw new ForbiddenError('Insufficient permissions for this action');
      }

      req.workspaceId = workspaceId;
      req.workspaceMember = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
};
