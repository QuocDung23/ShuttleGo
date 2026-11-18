import { apiRequest } from '@/data/api/client';
import type { ApiNotification } from '@/models/notification';
import type { Paginated } from '@/models/venue';

export const notificationRepository = {
  list(limit = 100) {
    return apiRequest<Paginated<ApiNotification>>(`/notifications?page=1&limit=${limit}`);
  },

  markRead(id: number) {
    return apiRequest<ApiNotification>(`/notifications/${id}`, {
      method: 'PATCH',
      body: { isRead: true },
    });
  },

  markAllRead(userId: number) {
    return apiRequest<{ updated: number }>('/notifications/read-all', {
      method: 'PATCH',
      body: { userId },
    });
  },
};
