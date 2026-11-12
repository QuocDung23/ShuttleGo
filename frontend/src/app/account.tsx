import { useRouter } from 'expo-router';

import { AccountMenu } from '@/components/account/AccountMenu';
import { AccountProfile } from '@/components/account/AccountProfile';
import { OwnerButton, OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useAccountViewModel } from '@/features/account/hooks/useAccountViewModel';

export default function AccountPage() {
  const router = useRouter();
  const { profile, menu, logout } = useAccountViewModel();

  return <OwnerPage><OwnerText size={24} weight="bold" style={{ marginTop: 40, marginBottom: 6 }}>Tài khoản</OwnerText><AccountProfile {...profile} /><AccountMenu items={menu} onNavigate={(path) => router.push(path)} /><OwnerButton title="Đăng xuất" outline onPress={logout} style={{ marginTop: 10 }} /></OwnerPage>;
}
