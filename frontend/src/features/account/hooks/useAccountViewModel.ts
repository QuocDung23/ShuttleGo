import { Alert } from 'react-native';

const menu = [
  { icon: { ios: 'building.2', android: 'sports_tennis', web: 'sports_tennis' }, title: 'Thông tin sân', path: '/venue-info' },
  { icon: { ios: 'tag', android: 'sell', web: 'sell' }, title: 'Giá theo khung giờ', path: '/pricing' },
  { icon: { ios: 'clock', android: 'schedule', web: 'schedule' }, title: 'Giờ mở cửa', path: '/hours' },
  { icon: { ios: 'bell', android: 'notifications', web: 'notifications' }, title: 'Thông báo', path: '/notifications' },
] as const;

export function useAccountViewModel() {
  return {
    profile: {
      initials: 'HL',
      name: 'Hoàng Lan',
      description: 'Chủ sân · Sân cầu lông Kỳ Hòa',
    },
    menu,
    logout: () => Alert.alert('Đăng xuất', 'Bạn đã đăng xuất.'),
  };
}
