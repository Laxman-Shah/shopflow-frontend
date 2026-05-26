import api from '@/lib/api';

export type NotificationChannel = 'EMAIL' | 'IN_APP' | 'SMS' | 'PUSH';

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'READ';

export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'LOW_STOCK_ALERT'
  | 'GENERAL';

export interface Notification {
  id: string;
  userId: string;
  recipientEmail: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  subject: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  failureReason?: string;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId: string;
  recipientEmail: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
}

export interface NotificationPageResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const notificationService = {
  getMyNotifications: async (params?: {
    status?: NotificationStatus;
    type?: NotificationType;
    channel?: NotificationChannel;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<NotificationPageResponse>> => {
    const response = await api.get('/api/v1/notifications/my-notifications', { params });
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    const response = await api.get('/api/v1/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<ApiResponse<Notification>> => {
    const response = await api.patch(`/api/v1/notifications/${notificationId}/read`);
    return response.data;
  },
};
