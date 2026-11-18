import { useLocalSearchParams } from 'expo-router';

import { AdminVenueDetailScreen } from '@/components/admin/AdminVenueDetailScreen';

export default function AdminVenuePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AdminVenueDetailScreen id={Number(id)} />;
}
