import type { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ownerColors = {
  page: '#fff8f3',
  card: '#ffffff',
  ink: '#231a14',
  muted: '#5c4c42',
  border: '#eadbd0',
  stroke: '#8c7a6e',
  accent: '#c2410c',
  accentSoft: '#ffe2d1',
  blue: '#dbeafe',
  blueInk: '#174687',
  green: '#e8f5eb',
  greenInk: '#166534',
  gray: '#e7e5e4',
};

export function OwnerPage({ children, scroll = true, style }: PropsWithChildren<{ scroll?: boolean; style?: ViewStyle }>) {
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, style]}>
      {scroll ? <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView> : children}
    </SafeAreaView>
  );
}

export function OwnerText({ children, size = 14, weight = 'regular', color = ownerColors.ink, style }: PropsWithChildren<{ size?: number; weight?: 'regular' | 'medium' | 'semibold' | 'bold'; color?: string; style?: object }>) {
  return <Text style={[{ color, fontSize: size, fontWeight: weight === 'regular' ? '400' : weight === 'medium' ? '500' : weight === 'semibold' ? '600' : '700' }, styles.text, style]}>{children}</Text>;
}

export function OwnerHeader({ title, back, right, onBack }: { title: string; back?: boolean; right?: ReactNode; onBack?: () => void }) {
  return <View style={styles.header}>{back ? <Pressable accessibilityRole="button" onPress={onBack} style={styles.headerAction}><OwnerText size={26} color={ownerColors.muted}>‹</OwnerText></Pressable> : <View style={styles.headerSpacer} />}<OwnerText size={20} weight="semibold" style={styles.headerTitle}>{title}</OwnerText><View style={styles.headerAction}>{right}</View></View>;
}

export function OwnerCard({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function OwnerButton({ title, onPress, outline = false, style }: { title: string; onPress?: () => void; outline?: boolean; style?: ViewStyle }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, outline ? styles.outlineButton : styles.primaryButton, style]}><OwnerText weight="semibold" color={outline ? ownerColors.accent : '#fff'}>{title}</OwnerText></Pressable>;
}

export function OwnerChip({ title, selected = false, onPress }: { title: string; selected?: boolean; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.selectedChip]}><OwnerText size={12} weight="semibold" color={selected ? '#4a1a05' : ownerColors.ink}>{title}</OwnerText></Pressable>;
}

export function OwnerInput({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.inputWrap}><OwnerText size={12} color={ownerColors.muted} style={styles.inputLabel}>{label}</OwnerText><TextInput placeholderTextColor={ownerColors.muted} style={styles.input} {...props} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ownerColors.page },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 22, gap: 14, width: '100%', maxWidth: 640, alignSelf: 'center' },
  text: { fontFamily: 'System', includeFontPadding: false },
  header: { minHeight: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: ownerColors.page },
  headerAction: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  headerSpacer: { width: 48 },
  headerTitle: { flex: 1 },
  card: { backgroundColor: ownerColors.card, borderColor: ownerColors.border, borderWidth: 1, borderRadius: 24, padding: 16, gap: 12 },
  button: { minHeight: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primaryButton: { backgroundColor: ownerColors.accent },
  outlineButton: { backgroundColor: ownerColors.card, borderWidth: 2, borderColor: ownerColors.stroke },
  chip: { minHeight: 34, borderRadius: 12, backgroundColor: ownerColors.accentSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  selectedChip: { backgroundColor: ownerColors.accent },
  inputWrap: { borderWidth: 1, borderColor: ownerColors.stroke, borderRadius: 10, backgroundColor: ownerColors.card, paddingHorizontal: 12, paddingTop: 7, minHeight: 56, justifyContent: 'center' },
  inputLabel: { position: 'absolute', top: -8, left: 12, backgroundColor: ownerColors.page, paddingHorizontal: 4 },
  input: { color: ownerColors.ink, fontSize: 15, paddingVertical: 4 },
});
