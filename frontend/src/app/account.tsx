import { useRouter } from 'expo-router';

import { AccountMenu } from '@/components/account/AccountMenu';
import { AccountProfile } from '@/components/account/AccountProfile';
import { OwnerButton, OwnerPage, OwnerText } from '@/components/ui/owner-ui';
import { useAccountViewModel } from '@/features/account/hooks/useAccountViewModel';

export default function AccountPage() {
  const router = useRouter();
  const { profile, menu, logout } = useAccountViewModel();

  return <OwnerPage><OwnerText className="mb-1.5 mt-10 font-familjen-bold text-headline">Tài khoản</OwnerText><AccountProfile {...profile} /><AccountMenu items={menu} onNavigate={(path) => router.push(path)} /><OwnerButton title="Đăng xuất" outline onPress={logout} className="mt-2.5" /></OwnerPage>;
}
