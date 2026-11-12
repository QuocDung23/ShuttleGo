import { OwnerCard, OwnerChip, OwnerText } from '@/components/ui/owner-ui';

export function OpeningHoursForm({ days }: { days: string[] }) {
  return <><OwnerText tone="muted">Thiết lập giờ hoạt động của sân</OwnerText>{days.map((day) => <OwnerCard key={day} className="flex-row items-center justify-between"><OwnerText className="font-familjen-semibold">{day}</OwnerText><OwnerText>06:00 – 22:00</OwnerText><OwnerChip title="Mở cửa" selected /></OwnerCard>)}</>;
}
