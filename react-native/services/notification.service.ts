import api from '@/services/api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const notificationService = {
  // Get all notifications
  async getAll(): Promise<{ success: boolean; data: Notification[] }> {
    try {
      const response = await api.get('/notification');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  // Get unread count
  async getUnreadCount(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await api.get('/notification/unread-count');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
    }
  },

  // Mark as read
  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put(`/notification/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark as read');
    }
  },

  // Mark all as read
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put('/notification/read-all');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark all as read');
    }
  },

  // Delete notification
  async delete(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/notification/${notificationId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },
};

export default notificationService;
