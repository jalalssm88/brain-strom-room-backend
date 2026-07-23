import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { chatService } from '../services/chat.service';

export class ChatController {
  listMessages = asyncHandler(async (req: Request, res: Response) => {
    const cursorRaw = req.query.cursor;
    const limitRaw = req.query.limit;

    const cursor =
      cursorRaw !== undefined && cursorRaw !== ''
        ? Number(cursorRaw)
        : undefined;
    const limit =
      limitRaw !== undefined && limitRaw !== '' ? Number(limitRaw) : undefined;

    const result = await chatService.listMessages(req.workspaceId!, {
      cursor: cursor || undefined,
      limit: limit || undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  });
}

export const chatController = new ChatController();
