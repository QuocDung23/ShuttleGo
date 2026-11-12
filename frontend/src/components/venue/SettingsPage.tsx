import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { OwnerButton, OwnerHeader, OwnerPage, ownerColors } from '@/components/ui/owner-ui';

export function SettingsPage({ title, saveTitle, onBack, onSave, children }: PropsWithChildren<{ title: string; saveTitle: string; onBack: () => void; onSave: () => void }>) {
  return <OwnerPage scroll={false}><OwnerHeader title={title} back onBack={onBack} /><ScrollView contentContainerStyle={styles.settings}>{children}</ScrollView><View style={styles.saveBar}><OwnerButton title={saveTitle} onPress={onSave} /></View></OwnerPage>;
}

const styles = StyleSheet.create({
  settings: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 18, gap: 14, width: '100%', maxWidth: 640, alignSelf: 'center' },
  saveBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, borderTopWidth: 1, borderColor: ownerColors.border, backgroundColor: ownerColors.page },
});
