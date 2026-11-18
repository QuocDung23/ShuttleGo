import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';

export default function BookingSuccessPage() {
  const router = useRouter();
  return <SafeAreaView className="flex-1 bg-guest-background"><View className="flex-1 justify-center gap-4 px-5"><View className="h-16 w-16 self-center rounded-full bg-primary-container" /><OwnerText className="text-center font-familjen-bold text-title text-guest-on-surface">Đã gửi yêu cầu đặt sân</OwnerText><OwnerText className="text-center text-guest-on-surface-variant">Đơn đang chờ chủ sân duyệt. Bạn sẽ nhận thông báo khi chủ sân xác nhận.</OwnerText><View className="mt-3 rounded-2xl border border-guest-outline bg-guest-surface p-4"><OwnerText className="font-familjen-semibold text-guest-on-surface">Nhà thi đấu Phú Thọ · Chờ duyệt</OwnerText><OwnerText className="mt-2 text-guest-on-surface-variant">T7, 31/10 · 18:00 – 20:00</OwnerText><OwnerText className="mt-2 text-guest-on-surface-variant">Sân 3 · 320.000đ · Đã thanh toán</OwnerText></View><View className="mt-auto gap-3"><OwnerButton title="Xem lịch đặt" onPress={() => router.replace('/my-bookings')} /><OwnerButton title="Về trang chủ" outline onPress={() => router.replace('/explore')} /></View></View></SafeAreaView>;
}
