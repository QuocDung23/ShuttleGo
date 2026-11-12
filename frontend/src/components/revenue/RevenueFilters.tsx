import { Pressable, ScrollView } from 'react-native';

import { OwnerText } from '@/components/ui/owner-ui';
import type { RevenueFilter } from '@/models/revenue';

export function RevenueFilters({ filters, value, onChange }: { filters: RevenueFilter[]; value: RevenueFilter; onChange: (filter: RevenueFilter) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-1">{filters.map((item) => <Pressable key={item} onPress={() => onChange(item)} className={`rounded-[10px] border px-3.5 py-[7px] ${value === item ? 'border-primary-container bg-primary-container' : 'border-outline'}`}><OwnerText className="font-familjen-semibold text-caption">{item}</OwnerText></Pressable>)}</ScrollView>;
}
