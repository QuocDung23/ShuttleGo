import { View } from 'react-native';

import { OwnerText } from '@/components/ui/owner-ui';

export function UnreadNotificationBadge({ count }: { count: number }) {
  if (count < 1) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute -right-1 -top-1 min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error px-1"
    >
      <OwnerText tone="onPrimary" className="text-[10px] font-familjen-bold">
        {count > 99 ? '99+' : count}
      </OwnerText>
    </View>
  );
}
