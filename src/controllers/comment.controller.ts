import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { commentService } from '../services/comment.service';
import { CreateCommentDto, UpdateCommentDto } from '../types/comment.types';

export class CommentController {
  listComments = asyncHandler(async (req: Request, res: Response) => {
    const comments = await commentService.listComments(
      req.workspaceId!,
      Number(req.params.noteId),
    );

    res.status(200).json({
      success: true,
      data: { comments },
    });
  });

  createComment = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreateCommentDto = { message: req.body.message };

    const comment = await commentService.createComment(
      req.workspaceId!,
      Number(req.params.noteId),
      req.userId!,
      req.workspaceMember!.role,
      dto,
    );

    res.status(201).json({
      success: true,
      data: { comment },
    });
  });

  updateComment = asyncHandler(async (req: Request, res: Response) => {
    const dto: UpdateCommentDto = { message: req.body.message };

    const comment = await commentService.updateComment(
      req.workspaceId!,
      Number(req.params.noteId),
      Number(req.params.commentId),
      req.userId!,
      req.workspaceMember!.role,
      dto,
    );

    res.status(200).json({
      success: true,
      data: { comment },
    });
  });

  deleteComment = asyncHandler(async (req: Request, res: Response) => {
    await commentService.deleteComment(
      req.workspaceId!,
      Number(req.params.noteId),
      Number(req.params.commentId),
      req.userId!,
      req.workspaceMember!.role,
    );

    res.status(200).json({
      success: true,
      data: { message: 'Comment deleted successfully' },
    });
  });
}

export const commentController = new CommentController();
