import { useRouter } from 'expo-router';

import { useAuth } from '@/features/auth/AuthContext';

const menu = [
  {
    icon: { ios: 'building.2', android: 'sports_tennis', web: 'sports_tennis' },
    title: 'Thông tin sân',
    path: '/(owner)/venue-info',
  },
  {
    icon: { ios: 'tag', android: 'sell', web: 'sell' },
    title: 'Giá theo khung giờ',
    path: '/(owner)/pricing',
  },
  {
    icon: { ios: 'clock', android: 'schedule', web: 'schedule' },
    title: 'Giờ mở cửa',
    path: '/(owner)/hours',
  },
  {
    icon: { ios: 'bell', android: 'notifications', web: 'notifications' },
    title: 'Thông báo',
    path: '/(owner)/notifications',
  },
] as const;

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'SG'
  );
}

export function useAccountViewModel() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return {
    profile: {
      initials: initials(user?.fullName ?? ''),
      name: user?.fullName ?? 'Chủ sân',
      description: user ? `Chủ sân · ${user.phone}` : 'Chủ sân',
    },
    menu,
    logout: () => {
      void logout().then(() => router.replace('/login'));
    },
  };
}
