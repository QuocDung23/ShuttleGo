import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { BookingStatus } from '../models';
import { STATUS_COLOR, STATUS_LABEL } from '../utils/format';

export const C = { primary: '#0E9F6E', bg: '#F5F7F6', text: '#111827', sub: '#6B7280', border: '#E5E7EB', danger: '#DC2626' };

export function Button({ title, onPress, loading, variant = 'primary', style }:
  { title: string; onPress: () => void; loading?: boolean; variant?: 'primary' | 'outline' | 'danger'; style?: ViewStyle }) {
  const bg = variant === 'primary' ? C.primary : variant === 'danger' ? C.danger : 'transparent';
  return (
    <Pressable onPress={onPress} disabled={loading}
      style={[s.btn, { backgroundColor: bg, borderWidth: variant === 'outline' ? 1 : 0 }, style]}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={[s.btnText, variant === 'outline' && { color: C.primary }]}>{title}</Text>}
    </Pressable>
  );
}
export function Input({ label, ...p }: TextInputProps & { label?: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={s.label}>{label}</Text>}
      <TextInput placeholderTextColor={C.sub} style={s.input} {...p} />
    </View>
  );
}
export const Card = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => <View style={[s.card, style]}>{children}</View>;
export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Text style={[s.badge, { backgroundColor: STATUS_COLOR[status] }]}>{STATUS_LABEL[status]}</Text>;
}
export const Empty = ({ text }: { text: string }) => <Text style={{ textAlign: 'center', color: C.sub, marginTop: 40 }}>{text}</Text>;

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 12 },
  h2: { fontSize: 17, fontWeight: '700', color: C.text, marginVertical: 8 },
  sub: { color: C.sub },
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: { borderColor: C.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', marginVertical: 4 },
  btnText: { color: '#fff', fontWeight: '600' },
  label: { color: C.sub, marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, color: C.text },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  badge: { color: '#fff', fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden', alignSelf: 'flex-start' },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
});
