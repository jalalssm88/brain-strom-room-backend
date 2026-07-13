import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { workspaceService } from '../services/workspace.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto, WorkspaceTab } from '../types/workspace.types';
import { InviteMemberDto } from '../types/invitation.types';
import { MemberRole } from '@prisma/client';

export class WorkspaceController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const tab = (req.query.tab as WorkspaceTab | undefined) ?? 'owned';
    const workspaces = await workspaceService.listWorkspaces(req.userId!, tab);

    res.status(200).json({
      success: true,
      data: { workspaces },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreateWorkspaceDto = {
      name: req.body.name,
      description: req.body.description,
    };

    const workspace = await workspaceService.createWorkspace(req.userId!, dto);

    res.status(201).json({
      success: true,
      data: { workspace },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = Number(req.params.id);
    const dto: UpdateWorkspaceDto = { name: req.body.name };

    const workspace = await workspaceService.renameWorkspace(workspaceId, req.userId!, dto);

    res.status(200).json({
      success: true,
      data: { workspace },
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = Number(req.params.id);
    await workspaceService.deleteWorkspace(workspaceId, req.userId!);

    res.status(200).json({
      success: true,
      data: { message: 'Workspace deleted successfully' },
    });
  });

  listMembers = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = Number(req.params.id);
    const members = await workspaceService.listMembers(workspaceId, req.userId!);

    res.status(200).json({
      success: true,
      data: { members },
    });
  });

  invite = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = Number(req.params.id);
    const dto: InviteMemberDto = {
      email: req.body.email,
      role: req.body.role as MemberRole,
    };

    await workspaceService.inviteMember(workspaceId, req.userId!, dto);

    res.status(201).json({
      success: true,
      data: { message: 'Invitation sent successfully' },
    });
  });

  removeMember = asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = Number(req.params.id);
    const targetUserId = Number(req.params.userId);

    await workspaceService.removeMember(workspaceId, req.userId!, targetUserId);

    res.status(200).json({
      success: true,
      data: { message: 'Member removed successfully' },
    });
  });
}

export const workspaceController = new WorkspaceController();
