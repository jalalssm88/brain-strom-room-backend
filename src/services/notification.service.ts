import { NotificationRefType, NotificationType } from '@prisma/client';
import { NotFoundError } from '../errors/AppError';
import { notificationRepository } from '../repositories/notification.repository';
import { CreateNotificationData, NotificationResponse } from '../types/notification.types';

const toNotificationResponse = (notification: {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceType: NotificationRefType | null;
  referenceId: number | null;
  isRead: boolean;
  createdAt: Date;
}): NotificationResponse => ({
  id: notification.id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  referenceType: notification.referenceType,
  referenceId: notification.referenceId,
  isRead: notification.isRead,
  createdAt: notification.createdAt.toISOString(),
});

export class NotificationService {
  async create(data: CreateNotificationData): Promise<NotificationResponse> {
    const notification = await notificationRepository.create(data);
    return toNotificationResponse(notification);
  }

  async listForUser(userId: number): Promise<NotificationResponse[]> {
    const notifications = await notificationRepository.findByUserId(userId);
    return notifications.map(toNotificationResponse);
  }

  async markAsRead(userId: number, notificationId: number): Promise<NotificationResponse> {
    const notification = await notificationRepository.markAsRead(notificationId, userId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    return toNotificationResponse(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await notificationRepository.markAllAsRead(userId);
  }
}

export const notificationService = new NotificationService();
