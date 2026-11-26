import { useCallback, useEffect, useMemo, useState } from "react";

import { bookingRepository } from "@/data/repositories/bookingRepository";
import { venueRepository } from "@/data/repositories/venueRepository";
import { useOwnerVenueAccess } from "@/features/venue/useOwnerVenueAccess";
import {
  useRealtimeRefresh,
  useScheduleSubscription,
} from "@/features/realtime/RealtimeProvider";
import type { ApiBooking } from "@/models/booking";
import type { BookingDetail, ScheduleCourt, ScheduleDate, ScheduleSlot } from "@/models/schedule";
import {
  formatBookingDate,
  formatMoney,
  formatTimeRange,
  toDateKey,
} from "@/shared/format";

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const DEFAULT_OPEN_TIME = "06:00";
const DEFAULT_CLOSE_TIME = "22:00";
const SLOT_MINUTES = 60;

function toMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function buildSlotHours(openTime: string, closeTime: string) {
  const openMinutes = toMinutes(openTime);
  const closeMinutes = toMinutes(closeTime);
  const slots: string[] = [];

  for (let start = openMinutes; start + SLOT_MINUTES <= closeMinutes; start += SLOT_MINUTES) {
    slots.push(
      `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`,
    );
  }
  return slots;
}

function bookingIsActive(booking: ApiBooking) {
  if (booking.status === "cancelled") return false;
  return !(
    booking.status === "pending" &&
    booking.holdExpiresAt &&
    Date.parse(booking.holdExpiresAt) < Date.now()
  );
}

function buildDates(count = 6): ScheduleDate[] {
  const today = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return {
      day: index === 0 ? "Hôm nay" : WEEKDAY_LABELS[date.getDay()],
      label: `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`,
      dayOfWeek: date.getDay(),
    };
  });
}

function toDetail(booking: ApiBooking): BookingDetail {
  return {
    title: `${booking.court?.name ?? "Sân"} · ${formatBookingDate(booking.bookingDate)} · ${booking.startTime.slice(0, 5)}`,
    rows: [
      ["Người đặt", booking.contactName],
      ["Số điện thoại", booking.contactPhone],
      ["Thời gian", formatTimeRange(booking.startTime, booking.endTime)],
      ["Tiền sân", formatMoney(booking.totalAmount)],
      ["Thanh toán", booking.paymentStatus === "paid" ? "Đã thanh toán" : "Trả tại sân"],
    ],
  };
}

type ScheduleSnapshot = {
  courts: ScheduleCourt[];
  bookings: ApiBooking[];
  isClosed: boolean;
};

const scheduleCache = new Map<string, ScheduleSnapshot>();

export function useScheduleViewModel() {
  const { primaryVenue, loading: accessLoading, error: accessError } = useOwnerVenueAccess();
  const venueId = primaryVenue?.id ?? null;
  const dates = useMemo(() => buildDates(), []);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const dateKey = useMemo(() => {
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() + selectedDateIndex);
    return toDateKey(date);
  }, [selectedDateIndex]);
  const cacheKey = venueId === null ? null : `${venueId}:${dateKey}`;
  const cached = cacheKey === null ? undefined : scheduleCache.get(cacheKey);
  const [courts, setCourts] = useState<ScheduleCourt[]>(cached?.courts ?? []);
  const [bookings, setBookings] = useState<ApiBooking[]>(cached?.bookings ?? []);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isBookingDetailVisible, setBookingDetailVisible] = useState(false);
  const [loading, setLoading] = useState(cached === undefined);
  const [error, setError] = useState("");
  const [isClosed, setIsClosed] = useState(cached?.isClosed ?? false);
  const [reloadKey, setReloadKey] = useState(0);

  const selectedDate = dates[selectedDateIndex]?.label;
  const selectedDayOfWeek = dates[selectedDateIndex]?.dayOfWeek;

  const requestReload = useCallback(() => setReloadKey((value) => value + 1), []);
  useScheduleSubscription(venueId ?? undefined, dateKey, requestReload);
  useRealtimeRefresh(["booking.payment_reported"], requestReload);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active || accessLoading) return;
      if (accessError) {
        setError(accessError);
        setLoading(false);
        return;
      }
      if (venueId === null || cacheKey === null) {
        setError("Không tìm thấy thông tin sân của tài khoản này.");
        setLoading(false);
        return;
      }

      const previous = scheduleCache.get(cacheKey);
      if (previous) {
        setCourts(previous.courts);
        setBookings(previous.bookings);
        setIsClosed(previous.isClosed);
      }
      setLoading(previous === undefined);
      setError("");
      void Promise.all([
        venueRepository.get(venueId),
        bookingRepository.listAll({ venueId, date: dateKey }),
      ])
        .then(([venue, dayBookings]) => {
          if (!active) return;
          setBookings(dayBookings);
          const openingHours = venue.operatingHours?.find(
            (hours) => hours.dayOfWeek === selectedDayOfWeek,
          );
          const closed = openingHours?.isOpen === false;
          setIsClosed(closed);
          const slotHours = closed
            ? []
            : buildSlotHours(
                openingHours?.openTime ?? DEFAULT_OPEN_TIME,
                openingHours?.closeTime ?? DEFAULT_CLOSE_TIME,
              );
          const activeCourts = (venue.courts ?? []).filter((court) => court.isActive !== false);
          const nextCourts = activeCourts.map((court) => ({
              id: court.id,
              name: court.name,
              slots: slotHours.map((hour) => {
                const slotStart = toMinutes(hour);
                const booking = dayBookings.find((item) => {
                  if (item.courtId !== court.id || !bookingIsActive(item)) return false;
                  return toMinutes(item.startTime) < slotStart + SLOT_MINUTES && toMinutes(item.endTime) > slotStart;
                });
                const status: ScheduleSlot["status"] = !booking
                  ? "Còn trống"
                  : booking.status === "pending"
                    ? "Chờ duyệt"
                    : "Đã đặt";
                return {
                  hour,
                  status,
                  bookingId: booking?.id,
                };
              }),
            }));
          setCourts(nextCourts);
          scheduleCache.set(cacheKey, { courts: nextCourts, bookings: dayBookings, isClosed: closed });
        })
        .catch((e) => {
          if (active && previous === undefined) {
            setError(e instanceof Error ? e.message : "Không tải được lịch sân.");
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [accessError, accessLoading, cacheKey, dateKey, reloadKey, selectedDayOfWeek, venueId]);

  const selectDate = useCallback((index: number) => {
    setSelectedDateIndex(index);
    setBookingDetailVisible(false);
  }, []);

  const openBookingDetail = useCallback((bookingId: number) => {
    setSelectedBookingId(bookingId);
    setBookingDetailVisible(true);
  }, []);

  const closeBookingDetail = useCallback(() => setBookingDetailVisible(false), []);

  const bookingDetail: BookingDetail = useMemo(() => {
    const booking = bookings.find((item) => item.id === selectedBookingId);
    if (!booking) return { title: "", rows: [] };
    return toDetail(booking);
  }, [bookings, selectedBookingId]);

  return {
    dates,
    courts,
    bookingDetail,
    selectedDateIndex,
    selectDate,
    isBookingDetailVisible,
    openBookingDetail,
    closeBookingDetail,
    loading,
    error,
    selectedDate,
    isClosed,
  };
}
