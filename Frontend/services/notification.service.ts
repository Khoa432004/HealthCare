import { apiClient, API_ENDPOINTS } from '@/lib/api-client';

export interface Notification {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdByName: string;
  type: string;
  targetRoles: string[] | null; // ["DOCTOR"], ["PATIENT"], ["ADMIN"], ["DOCTOR", "PATIENT"], or ["DOCTOR", "PATIENT", "ADMIN"] for all users
  isRead?: boolean;
  readAt?: string | null;
  notificationUserId?: string;
  createdAt: string;
}

export interface CreateNotificationRequest {
  title: string;
  content: string;
  type: 'ADMIN' | 'SYSTEM' | 'USER';
  targetRoles: string[] | null; // Specific roles array or ["DOCTOR", "PATIENT", "ADMIN"] for all users
}

export interface UpdateNotificationRequest {
  title: string;
  content: string;
  type: 'ADMIN' | 'SYSTEM' | 'USER';
  targetRoles: string[] | null; // Specific roles array or ["DOCTOR", "PATIENT", "ADMIN"] for all users
}

export const notificationService = {
  // ========== ADMIN OPERATIONS ==========
  
  async getAllNotifications() {
    const response: any = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE);
    return response.data as Notification[];
  },

  async getNotificationById(id: string) {
    const response: any = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
    return response.data as Notification;
  },

  async createNotification(request: CreateNotificationRequest) {
    const response: any = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.BASE, request);
    return response.data as Notification;
  },

  async updateNotification(id: string, request: UpdateNotificationRequest) {
    const response: any = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id), request);
    return response.data as Notification;
  },

  async deleteNotification(id: string) {
    const response = await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
    return response;
  },

  // ========== USER OPERATIONS ==========
  
  async getMyNotifications() {
    const response: any = await apiClient.get('/api/v1/notifications/my-notifications');
    return response.data as Notification[];
  },

  async getMyUnreadNotifications() {
    const response: any = await apiClient.get('/api/v1/notifications/my-notifications/unread');
    return response.data as Notification[];
  },

  async getUnreadCount() {
    const response: any = await apiClient.get('/api/v1/notifications/my-notifications/unread/count');
    return response.count as number;
  },

  async markAsRead(notificationUserId: string) {
    const response: any = await apiClient.put(`/api/v1/notifications/my-notifications/${notificationUserId}/read`);
    return response.data as Notification;
  },

  async markAllAsRead() {
    const response = await apiClient.put('/api/v1/notifications/my-notifications/read-all');
    return response;
  },
};
