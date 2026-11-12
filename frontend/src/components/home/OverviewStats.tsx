import { View } from 'react-native';

import { OwnerCard, OwnerText } from '@/components/ui/owner-ui';

export function OverviewStats({ pendingCount, occupancyLabel }: { pendingCount: number; occupancyLabel: string }) {
  return (
    <View className="flex-row gap-2">
      <OwnerCard className="h-[84px] flex-1 justify-center gap-1 p-3.5"><OwnerText tone="muted" className="text-caption">Đơn chờ duyệt</OwnerText><OwnerText className="font-familjen-bold text-headline">{pendingCount}</OwnerText></OwnerCard>
      <OwnerCard className="h-[84px] flex-1 justify-center gap-1 p-3.5"><OwnerText tone="muted" className="text-caption">Hôm nay đã kín</OwnerText><OwnerText className="font-familjen-bold text-headline">{occupancyLabel}</OwnerText></OwnerCard>
    </View>
  );
}
