import { NotificationRefType, NotificationType } from '../prisma';

import { PaginatedResult } from './pagination.types';

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceType: NotificationRefType | null;
  referenceId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationData {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceType?: NotificationRefType;
  referenceId?: number;
}

export interface NotificationListResult extends PaginatedResult<NotificationResponse> {
  unreadCount: number;
}
