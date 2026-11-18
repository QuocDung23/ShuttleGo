import { useEffect, useMemo, useState } from "react";

import { bookingRepository } from "@/data/repositories/bookingRepository";
import { useOwnerVenueAccess } from "@/features/venue/useOwnerVenueAccess";
import { toBookingHistoryItem } from "@/features/booking/bookingView";
import type { BookingHistoryItem } from "@/models/booking";
import type { RevenueBar, RevenueFilter } from "@/models/revenue";
import { formatCompactMoney, timeToMinutes, toDateKey } from "@/shared/format";

const filters: RevenueFilter[] = [
  "Tất cả",
  "Chờ duyệt",
  "Đã xác nhận",
  "Đã hủy",
];

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function buildBars(bookings: Awaited<ReturnType<typeof bookingRepository.listAll>>): {
  bars: RevenueBar[];
  totalRevenue: number;
  bookingCount: number;
  hoursSold: number;
} {
  const today = new Date();
  const totals = new Map<string, number>();
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    totals.set(toDateKey(day), 0);
  }

  let totalRevenue = 0;
  let bookingCount = 0;
  let hoursSold = 0;
  for (const booking of bookings) {
    if (booking.status === "cancelled") continue;
    totalRevenue += booking.totalAmount;
    bookingCount += 1;
    hoursSold += Math.max(0, timeToMinutes(booking.endTime) - timeToMinutes(booking.startTime)) / 60;
    const key = booking.bookingDate;
    if (totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + booking.totalAmount);
  }

  const max = Math.max(1, ...totals.values());
  const bars: RevenueBar[] = Array.from(totals.entries()).map(([key, value], index) => {
    const date = new Date(`${key}T00:00:00`);
    const label = index === 6 ? "H.nay" : WEEKDAY_LABELS[date.getDay()];
    return [label, Math.max(8, Math.round((value / max) * 100)), formatCompactMoney(value)];
  });

  return { bars, totalRevenue, bookingCount, hoursSold: Math.round(hoursSold) };
}

export function useRevenueViewModel() {
  const { primaryVenue, loading: accessLoading, error: accessError } = useOwnerVenueAccess();
  const [filter, setFilter] = useState<RevenueFilter>("Tất cả");
  const [allBookings, setAllBookings] = useState<BookingHistoryItem[]>([]);
  const [stats, setStats] = useState(() => buildBars([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active || accessLoading) return;
      if (accessError) {
        setError(accessError);
        setLoading(false);
        return;
      }
      if (!primaryVenue) {
        setError("Không tìm thấy thông tin sân của tài khoản này.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      void bookingRepository
        .listAll({ venueId: primaryVenue.id })
        .then((bookings) => {
          if (!active) return;
          setAllBookings(bookings.map(toBookingHistoryItem));
          setStats(buildBars(bookings));
        })
        .catch((e) => {
          if (active) setError(e instanceof Error ? e.message : "Không tải được dữ liệu doanh thu.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [accessError, accessLoading, primaryVenue]);

  const visibleBookings = useMemo(
    () =>
      filter === "Tất cả"
        ? allBookings
        : allBookings.filter((booking) => booking.status === filter),
    [allBookings, filter],
  );

  return {
    bars: stats.bars,
    totalRevenue: stats.totalRevenue,
    bookingCount: stats.bookingCount,
    hoursSold: stats.hoursSold,
    filters,
    filter,
    setFilter,
    visibleBookings,
    loading,
    error,
  };
}
