import type { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';

import { OwnerButton, OwnerHeader, OwnerPage } from '@/components/ui/owner-ui';

export function SettingsPage({ title, saveTitle, onBack, onSave, children }: PropsWithChildren<{ title: string; saveTitle: string; onBack: () => void; onSave: () => void }>) {
  return <OwnerPage scroll={false}><OwnerHeader title={title} back onBack={onBack} /><ScrollView contentContainerClassName="w-full max-w-screen-sm self-center gap-3.5 px-4 pb-[18px] pt-2">{children}</ScrollView><View className="border-t border-divider bg-background px-4 pb-3.5 pt-3"><OwnerButton title={saveTitle} onPress={onSave} /></View></OwnerPage>;
}
