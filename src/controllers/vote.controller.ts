import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { voteService } from '../services/vote.service';

export class VoteController {
  listVotes = asyncHandler(async (req: Request, res: Response) => {
    const summary = await voteService.listVotes(
      req.workspaceId!,
      Number(req.params.noteId),
      req.userId!,
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  });

  toggleVote = asyncHandler(async (req: Request, res: Response) => {
    const result = await voteService.toggleVote(
      req.workspaceId!,
      Number(req.params.noteId),
      req.userId!,
      req.workspaceMember!.role,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  });
}

export const voteController = new VoteController();
