import { View } from 'react-native';

import { OwnerText } from '@/components/ui/owner-ui';

export function AccountProfile({ initials, name, description }: { initials: string; name: string; description: string }) {
  return <View className="my-1.5 flex-row items-center gap-4"><View className="h-14 w-14 items-center justify-center rounded-full bg-primary-container"><OwnerText tone="onPrimaryContainer" className="font-familjen-semibold text-title">{initials}</OwnerText></View><View><OwnerText className="font-familjen-semibold text-title-sm">{name}</OwnerText><OwnerText tone="muted">{description}</OwnerText></View></View>;
}
