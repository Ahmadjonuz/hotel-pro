export type NotificationType = 'booking' | 'reminder' | 'maintenance' | 'payment' | 'housekeeping' | 'system';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  user_id: string;
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export interface NotificationCreate {
  title: string;
  message: string;
  type: NotificationType;
  user_id: string;
  data?: Record<string, any>;
}

export interface NotificationUpdate {
  read?: boolean;
  read_at?: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  read?: boolean;
  from_date?: string;
  to_date?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<NotificationType, number>;
} 