import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const notifications = await notificationService.listForUser(req.userId!);

    res.status(200).json({
      success: true,
      data: { notifications },
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
