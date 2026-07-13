import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { parsePagination } from '../helpers/pagination';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const pagination = parsePagination(req.query);
    const result = await notificationService.listForUser(req.userId!, pagination);

    res.status(200).json({
      success: true,
      data: {
        notifications: result.items,
        total: result.total,
        unreadCount: result.unreadCount,
        offset: result.offset,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    });
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markAsRead(
      req.userId!,
      Number(req.params.id),
    );

    res.status(200).json({
      success: true,
      data: { notification },
    });
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllAsRead(req.userId!);

    res.status(200).json({
      success: true,
      data: { message: 'All notifications marked as read' },
    });
  });
}

export const notificationController = new NotificationController();
