import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { voteService } from '../services/vote.service';
import { workspaceBroadcast } from '../socket/emit';

export class VoteController {
  getVoteslist = asyncHandler(async (req: Request, res: Response) => {
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
    const noteId = Number(req.params.noteId);
    const result = await voteService.toggleVote(
      req.workspaceId!,
      noteId,
      req.userId!,
      req.workspaceMember!.role,
    );

    const payload = { noteId, userId: req.userId!, count: result.count };
    if (result.voted) {
      workspaceBroadcast.voteCreated(req.workspaceId!, payload);
    } else {
      workspaceBroadcast.voteDeleted(req.workspaceId!, payload);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  });
}

export const voteController = new VoteController();
