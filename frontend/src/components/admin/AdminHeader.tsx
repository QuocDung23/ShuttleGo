import { useRouter, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable } from 'react-native';

import { OwnerHeader, ownerColors } from '@/components/ui/owner-ui';
import { useAuth } from '@/features/auth/AuthContext';

export function AdminHeader({
  title,
  back = false,
  fallback = '/admin/courts',
}: {
  title: string;
  back?: boolean;
  fallback?: Href;
}) {
  const router = useRouter();
  const { logout } = useAuth();
  const right = back ? null : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Đăng xuất"
      onPress={() => void logout().then(() => router.replace('/login'))}
      className="h-12 w-12 items-center justify-center"
    >
      <SymbolView
        name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
        size={21}
        tintColor={ownerColors.muted}
      />
    </Pressable>
  );

  return (
    <OwnerHeader
      title={title}
      back={back}
      onBack={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
      right={right}
    />
  );
}
