import { useLocalSearchParams } from 'expo-router';

import { AdminApplicationDetailScreen } from '@/components/admin/AdminApplicationDetailScreen';

export default function AdminApplicationPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AdminApplicationDetailScreen id={Number(id)} />;
}
