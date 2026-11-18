import { ActivityIndicator, View } from "react-native";

import { BookingDetailSheet } from "@/components/schedule/BookingDetailSheet";
import { CourtScheduleGrid } from "@/components/schedule/CourtScheduleGrid";
import { DateSelector } from "@/components/schedule/DateSelector";
import { OwnerPage, OwnerText } from "@/components/ui/owner-ui";
import { useScheduleViewModel } from "@/features/schedule/hooks/useScheduleViewModel";
import { colors } from "@/shared/theme";

export default function SchedulePage() {
  const viewModel = useScheduleViewModel();

  return (
    <OwnerPage scroll={false}>
      <View className="shrink-0">
        <View className="px-4 pb-10 pt-2">
          <OwnerText className="font-familjen-bold text-headline-lg">
            Lịch sân
          </OwnerText>
        </View>
        <DateSelector
          dates={viewModel.dates}
          selectedIndex={viewModel.selectedDateIndex}
          onSelect={viewModel.selectDate}
        />
        <View className="px-4 pb-3 pt-3">
          <OwnerText tone="muted" className="text-caption leading-4">
            Chạm giờ đã đặt hoặc chờ duyệt để xem chi tiết.
          </OwnerText>
        </View>
      </View>

      <View className="min-h-0 flex-1 pt-2">
        {viewModel.loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : viewModel.error ? (
          <View className="flex-1 items-center justify-center px-4">
            <OwnerText tone="muted" className="text-center text-caption">
              {viewModel.error}
            </OwnerText>
          </View>
        ) : viewModel.courts.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <OwnerText tone="muted" className="text-center text-caption">
              Chưa có sân nào đang hoạt động.
            </OwnerText>
          </View>
        ) : viewModel.isClosed ? (
          <View className="flex-1 items-center justify-center px-4">
            <OwnerText tone="muted" className="text-center text-caption">
              Sân nghỉ vào ngày này theo giờ mở cửa đã cài đặt.
            </OwnerText>
          </View>
        ) : (
          <CourtScheduleGrid
            courts={viewModel.courts}
            onOpenBooking={viewModel.openBookingDetail}
          />
        )}
      </View>
      <BookingDetailSheet
        detail={viewModel.bookingDetail}
        visible={viewModel.isBookingDetailVisible}
        onClose={viewModel.closeBookingDetail}
      />
    </OwnerPage>
  );
}
