import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AppNotification } from '../models';
import { api } from './apiClient';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export const notificationService = {
  list: () => api.get<AppNotification[]>('/notifications').then((r) => r.data),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  remove: (id: string) => api.delete(`/notifications/${id}`),

  /** Xin quyền, lấy Expo push token và gửi lên server để nhận nhắc lịch / báo duyệt đơn. */
  async registerPush() {
    if (!Device.isDevice) return;
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await api.post('/notifications/devices', { token });
    } catch (e) { console.warn('Không lấy được push token', e); }
  },
};
