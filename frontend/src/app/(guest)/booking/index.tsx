import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScheduleLegend } from "@/components/schedule/ScheduleLegend";
import { OwnerButton, OwnerText } from "@/components/ui/owner-ui";
import { ApiError } from "@/data/api/client";
import { bookingRepository } from "@/data/repositories/bookingRepository";
import { venueRepository } from "@/data/repositories/venueRepository";
import { useAuth } from "@/features/auth/AuthContext";
import {
  buildHourSlots,
  calculateBookingTotal,
  formatCountdown,
  hasValidBankDetails,
  isContiguousIndexes,
  isSlotOccupied,
  priceForSlot,
} from "@/features/booking/pricing";
import { useScheduleSubscription } from "@/features/realtime/RealtimeProvider";
import type { BookingHold, VenueAvailability } from "@/models/booking";
import type { Venue } from "@/models/venue";
import { formatBookingDate, formatMoney, toDateKey } from "@/shared/format";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function buildDays(count = 7) {
  const result: { key: string; label: string; sub: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    result.push({
      key: toDateKey(date),
      label: i === 0 ? "Hôm nay" : DAY_LABELS[date.getDay()],
      sub: `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`,
    });
  }
  return result;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message || fallback : fallback;
}

function updateOwnHold(
  availability: VenueAvailability | null,
  previous: BookingHold | null,
  next: BookingHold | null,
) {
  if (!availability) return null;
  let changed = false;
  const courts = availability.courts.map((court) => {
    let heldRanges = court.heldRanges;
    if (previous?.bookingDate === availability.date && previous.courtId === court.id) {
      const filtered = heldRanges.filter(
        (range) =>
          range.startTime !== previous.startTime || range.endTime !== previous.endTime,
      );
      changed ||= filtered.length !== heldRanges.length;
      heldRanges = filtered;
    }
    if (
      next?.bookingDate === availability.date &&
      next.courtId === court.id &&
      !heldRanges.some(
        (range) => range.startTime === next.startTime && range.endTime === next.endTime,
      )
    ) {
      heldRanges = [...heldRanges, { startTime: next.startTime, endTime: next.endTime }];
      changed = true;
    }
    return heldRanges === court.heldRanges ? court : { ...court, heldRanges };
  });
  return changed ? { ...availability, courts } : availability;
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ venueId?: string }>();
  const { user, status } = useAuth();

  const venueId = Number(params.venueId);
  const validVenueId = Number.isInteger(venueId) && venueId > 0;

  const days = useMemo(() => buildDays(7), []);
  const [selectedDate, setSelectedDate] = useState(days[0].key);
  const cachedVenue = validVenueId ? venueRepository.getCached(venueId) : null;
  const cachedAvailability = validVenueId
    ? bookingRepository.getCachedVenueAvailability(venueId, selectedDate)
    : null;

  const [venue, setVenue] = useState<Venue | null>(cachedVenue);
  const [availability, setAvailability] = useState<VenueAvailability | null>(
    cachedAvailability,
  );
  const [loadingVenue, setLoadingVenue] = useState(cachedVenue === null);
  const [loadingAvailability, setLoadingAvailability] = useState(cachedAvailability === null);
  const [venueError, setVenueError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");

  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [selectedSlotIndexes, setSelectedSlotIndexes] = useState<number[]>([]);
  const [activeHold, setActiveHold] = useState<BookingHold | null>(null);
  const [holdUpdating, setHoldUpdating] = useState(false);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const holdRequestRef = useRef(false);
  const availabilityRevisionRef = useRef(0);
  const [reloadKey, setReloadKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const applyHold = useCallback((hold: BookingHold | null) => {
    setActiveHold((previous) =>
      previous?.id === hold?.id &&
      previous?.expiresAt === hold?.expiresAt &&
      previous?.courtId === hold?.courtId &&
      previous?.bookingDate === hold?.bookingDate &&
      previous?.startTime === hold?.startTime &&
      previous?.endTime === hold?.endTime
        ? previous
        : hold,
    );
  }, []);

  const syncOwnHold = useCallback(
    (previous: BookingHold | null, next: BookingHold | null) => {
      const dates = new Set<string>();
      if (previous) dates.add(previous.bookingDate);
      if (next) dates.add(next.bookingDate);
      dates.forEach((date) => {
        const cached = bookingRepository.getCachedVenueAvailability(venueId, date);
        const updated = updateOwnHold(cached, previous, next);
        if (updated) bookingRepository.setCachedVenueAvailability(updated);
      });
      setAvailability((current) => updateOwnHold(current, previous, next));
    },
    [venueId],
  );

  // Venue detail (name, address, bank info, price rules) is loaded once.
  useEffect(() => {
    if (!validVenueId) return;
    let cancelled = false;
    (async () => {
      const previous = venueRepository.getCached(venueId);
      try {
        if (previous) setVenue(previous);
        setLoadingVenue(previous === null);
        setVenueError("");
        const data = await venueRepository.get(venueId);
        if (!cancelled) setVenue(data);
      } catch (error) {
        if (!cancelled && previous === null)
          setVenueError(errorMessage(error, "Không thể tải thông tin sân."));
      } finally {
        if (!cancelled) setLoadingVenue(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [venueId, validVenueId]);

  // Availability (open window, active courts, occupied ranges) follows the date.
  useEffect(() => {
    if (!validVenueId) return;
    let cancelled = false;
    const revision = availabilityRevisionRef.current;
    (async () => {
      const previous = bookingRepository.getCachedVenueAvailability(
        venueId,
        selectedDate,
      );
      try {
        if (previous) setAvailability(previous);
        setLoadingAvailability(previous === null);
        setAvailabilityError("");
        const data = await bookingRepository.getVenueAvailability(
          venueId,
          selectedDate,
        );
        if (cancelled || revision !== availabilityRevisionRef.current) return;
        setAvailability(data);
        setSelectedCourtId((previous) =>
          data.courts.some((court) => court.id === previous)
            ? previous
            : (data.courts[0]?.id ?? null),
        );
      } catch (error) {
        if (!cancelled && previous === null) {
          setAvailabilityError(
            errorMessage(error, "Không thể tải lịch trống."),
          );
          setAvailability(null);
        }
      } finally {
        if (!cancelled) setLoadingAvailability(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [venueId, validVenueId, selectedDate, reloadKey]);

  // Restore this player's selection after reopening the booking screen.
  useEffect(() => {
    if (status !== "signedIn" || user?.role !== "player") {
      queueMicrotask(() => setActiveHold(null));
      return;
    }
    let cancelled = false;
    const revision = availabilityRevisionRef.current;
    bookingRepository
      .getMyHold()
      .then((hold) => {
        if (
          !cancelled &&
          revision === availabilityRevisionRef.current &&
          !holdRequestRef.current
        ) {
          applyHold(hold);
        }
      })
      .catch(() => {
        if (!cancelled) setActiveHold(null);
      });
    return () => {
      cancelled = true;
    };
  }, [applyHold, status, user?.id, user?.role]);

  useScheduleSubscription(
    validVenueId ? venueId : undefined,
    selectedDate,
    () => {
      setReloadKey((value) => value + 1);
      if (
        status === "signedIn" &&
        user?.role === "player" &&
        !holdRequestRef.current
      ) {
        const revision = availabilityRevisionRef.current;
        void bookingRepository
          .getMyHold()
          .then((hold) => {
            if (
              revision === availabilityRevisionRef.current &&
              !holdRequestRef.current
            ) {
              applyHold(hold);
            }
          })
          .catch(() => undefined);
      }
    },
    status === "signedIn",
  );

  useEffect(() => {
    if (!activeHold) return;
    const timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeHold]);

  const slots = useMemo(() => {
    if (
      !availability?.isOpen ||
      !availability.openTime ||
      !availability.closeTime
    )
      return [];
    return buildHourSlots(availability.openTime, availability.closeTime);
  }, [availability]);

  const selectedCourt = availability?.courts.find(
    (court) => court.id === selectedCourtId,
  );
  const occupiedRanges = useMemo(
    () => selectedCourt?.occupiedRanges ?? [],
    [selectedCourt],
  );
  const heldRanges = useMemo(
    () => selectedCourt?.heldRanges ?? [],
    [selectedCourt],
  );
  const checkoutRanges = useMemo(
    () => selectedCourt?.checkoutRanges ?? [],
    [selectedCourt],
  );
  const ownHoldMatches = Boolean(
    activeHold &&
    activeHold.courtId === selectedCourtId &&
    activeHold.bookingDate === selectedDate &&
    activeHold.expiresAt &&
    new Date(activeHold.expiresAt).getTime() > clockNow,
  );
  const holdRemainingMs = activeHold
    ? new Date(activeHold.expiresAt).getTime() - clockNow
    : 0;

  useEffect(() => {
    if (holdRemainingMs > 0 || !activeHold) return;
    queueMicrotask(() => {
      availabilityRevisionRef.current += 1;
      syncOwnHold(activeHold, null);
      setActiveHold(null);
      setSelectedSlotIndexes([]);
      setReloadKey((value) => value + 1);
    });
  }, [activeHold, holdRemainingMs, syncOwnHold]);

  // Restore the selected range represented by the server-side hold.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (!activeHold) {
        setSelectedSlotIndexes([]);
        return;
      }
      if (
        activeHold.bookingDate !== selectedDate ||
        !availability?.courts.some((court) => court.id === activeHold.courtId)
      ) {
        setSelectedSlotIndexes([]);
        return;
      }
      if (selectedCourtId !== activeHold.courtId)
        setSelectedCourtId(activeHold.courtId);
      if (slots.length === 0) return;
      const indexes = slots
        .map((slot, index) => ({ slot, index }))
        .filter(
          ({ slot }) =>
            slot.startTime >= activeHold.startTime &&
            slot.endTime <= activeHold.endTime,
        )
        .map(({ index }) => index);
      if (indexes.length > 0) {
        setSelectedCourtId(activeHold.courtId);
        setSelectedSlotIndexes((previous) =>
          previous.length === indexes.length &&
          previous.every((value, index) => value === indexes[index])
            ? previous
            : indexes,
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeHold, availability, selectedDate, selectedCourtId, slots]);

  const selectableIndexes = useMemo(
    () =>
      slots
        .map((slot, index) => ({ slot, index }))
        .filter(
          ({ slot }) =>
            priceForSlot(venue?.priceRules ?? [], slot) !== null &&
            !isSlotOccupied(slot, occupiedRanges) &&
            !isSlotOccupied(slot, checkoutRanges) &&
            (!isSlotOccupied(slot, heldRanges) ||
              (ownHoldMatches && isSlotOccupied(slot, [activeHold!]))),
        )
        .map(({ index }) => index),
    [
      slots,
      venue,
      occupiedRanges,
      heldRanges,
      checkoutRanges,
      ownHoldMatches,
      activeHold,
    ],
  );

  const selectedSlots = useMemo(
    () =>
      [...selectedSlotIndexes]
        .sort((a, b) => a - b)
        .map((index) => slots[index])
        .filter(Boolean),
    [selectedSlotIndexes, slots],
  );

  const total = useMemo(
    () =>
      calculateBookingTotal({
        rules: venue?.priceRules ?? [],
        weekendSurcharge: venue?.weekendSurcharge,
        bookingDate: selectedDate,
        slots: selectedSlots,
      }),
    [venue, selectedDate, selectedSlots],
  );

  const bankReady = hasValidBankDetails(venue ?? {});
  const selectedDay = days.find((day) => day.key === selectedDate) ?? days[0];
  const summary =
    selectedSlots.length > 0
      ? `${selectedDay.label === "Hôm nay" ? formatBookingDate(selectedDate) : selectedDay.label} · ${selectedCourt?.name ?? "Sân"} · ${selectedSlots.length} giờ`
      : "Chưa chọn giờ";
  const timeRange =
    selectedSlots.length > 0
      ? `${selectedSlots[0].startTime.slice(0, 5)} – ${selectedSlots[selectedSlots.length - 1].endTime.slice(0, 5)}`
      : "";

  const redirectToLogin = () => {
    router.push({
      pathname: "/login",
      params: { redirect: `/(guest)/booking?venueId=${venueId}` },
    });
  };

  const releaseHold = async () => {
    if (holdRequestRef.current) return;
    const previousHold = activeHold;
    holdRequestRef.current = true;
    availabilityRevisionRef.current += 1;
    setHoldUpdating(true);
    syncOwnHold(previousHold, null);
    setActiveHold(null);
    setSelectedSlotIndexes([]);
    try {
      if (status === "signedIn" && user?.role === "player") {
        await bookingRepository.releaseMyHold();
      }
      syncOwnHold(previousHold, null);
    } catch {
      syncOwnHold(null, previousHold);
      // The server will expire an unreachable hold after four minutes.
    } finally {
      holdRequestRef.current = false;
      setHoldUpdating(false);
    }
  };

  const toggleSlot = async (index: number) => {
    if (
      !selectableIndexes.includes(index) ||
      holdRequestRef.current ||
      submitting ||
      !selectedCourtId
    )
      return;
    if (status === "signedOut") {
      redirectToLogin();
      return;
    }
    if (status !== "signedIn" || user?.role !== "player") return;

    const previous = [...selectedSlotIndexes];
    const previousHold = activeHold;
    let next: number[];
    if (previous.includes(index)) {
      next = previous.filter((value) => value !== index);
    } else if (previous.length === 0) {
      next = [index];
    } else {
      const min = Math.min(...previous);
      const max = Math.max(...previous);
      if (index === min - 1 || index === max + 1) {
        const combined = [...previous, index];
        next = isContiguousIndexes(combined)
          ? combined.sort((a, b) => a - b)
          : [index];
      } else {
        next = [index];
      }
    }

    setSubmitError("");
    holdRequestRef.current = true;
    availabilityRevisionRef.current += 1;
    setHoldUpdating(true);
    try {
      if (next.length === 0) {
        syncOwnHold(previousHold, null);
        setActiveHold(null);
        setSelectedSlotIndexes([]);
        await bookingRepository.releaseMyHold();
      } else {
        const ordered = [...next].sort((a, b) => a - b);
        const first = slots[ordered[0]];
        const last = slots[ordered[ordered.length - 1]];
        const hold = await bookingRepository.selectHold({
          courtId: selectedCourtId,
          bookingDate: selectedDate,
          startTime: first.startTime,
          endTime: last.endTime,
        });
        syncOwnHold(previousHold, hold);
        setActiveHold(hold);
        setSelectedSlotIndexes(ordered);
      }
    } catch (error) {
      if (next.length === 0) {
        syncOwnHold(null, previousHold);
        setActiveHold(previousHold);
        setSelectedSlotIndexes(previous);
      }
      setSubmitError(
        errorMessage(error, "Không thể giữ khung giờ. Vui lòng thử lại."),
      );
      setReloadKey((value) => value + 1);
    } finally {
      holdRequestRef.current = false;
      setHoldUpdating(false);
    }
  };

  const onSubmit = async () => {
    if (submitting || holdUpdating || holdRequestRef.current) return;
    if (status === "signedOut" || !user) {
      redirectToLogin();
      return;
    }
    if (
      !validVenueId ||
      !selectedCourtId ||
      selectedSlots.length === 0 ||
      total === null ||
      !activeHold ||
      !ownHoldMatches ||
      holdRemainingMs <= 0
    )
      return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const booking = await bookingRepository.create({
        courtId: selectedCourtId,
        contactName: user.fullName,
        contactPhone: user.phone,
        bookingDate: selectedDate,
        startTime: selectedSlots[0].startTime,
        endTime: selectedSlots[selectedSlots.length - 1].endTime,
        totalAmount: total,
        paymentMethod: "bank_transfer",
      });
      router.push({
        pathname: "/(guest)/booking/confirm",
        params: { bookingId: String(booking.id) },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        redirectToLogin();
        return;
      }
      if (error instanceof ApiError && error.status === 409) {
        setSubmitError("Khung giờ vừa thay đổi. Vui lòng chọn giờ khác.");
        availabilityRevisionRef.current += 1;
        syncOwnHold(activeHold, null);
        setSelectedSlotIndexes([]);
        setActiveHold(null);
        await bookingRepository.releaseMyHold().catch(() => undefined);
        setReloadKey((value) => value + 1);
        return;
      }
      setSubmitError(
        errorMessage(error, "Đặt sân thất bại. Vui lòng thử lại."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!validVenueId) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        className="flex-1 items-center justify-center bg-guest-background px-6"
      >
        <OwnerText className="text-center text-body text-guest-on-surface-variant">
          {venueError || "Không tìm thấy sân."}
        </OwnerText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-guest-background"
    >
      {/* Header */}
      <View className="flex-row items-center px-2 pb-1 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <OwnerText
            style={{ fontSize: 26, lineHeight: 26 }}
            className="text-guest-on-surface-variant"
          >
            ‹
          </OwnerText>
        </Pressable>
        <OwnerText className="ml-1 flex-1 font-familjen-bold text-title text-guest-on-surface">
          {venue?.name ?? "Đặt sân"}
        </OwnerText>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerClassName="gap-6 px-5 pb-6 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Venue info */}
        {!bankReady && !loadingVenue && venue ? (
          <View className="rounded-2xl border border-guest-outline bg-guest-surface p-4">
            <OwnerText className="text-body text-guest-on-surface">
              Sân chưa cấu hình thông tin nhận thanh toán.
            </OwnerText>
            <OwnerText className="mt-1 text-body-sm text-guest-on-surface-variant">
              Vui lòng liên hệ sân qua số{" "}
              {venue.phone ?? "đã đăng trên trang sân"} để được hỗ trợ đặt sân.
            </OwnerText>
          </View>
        ) : null}

        {/* Date */}
        <View className="gap-3">
          <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
            Chọn ngày
          </OwnerText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            {days.map((day) => {
              const active = day.key === selectedDate;
              return (
                <Pressable
                  key={day.key}
                  disabled={holdUpdating || submitting}
                  onPress={() => {
                    if (holdRequestRef.current) return;
                    if (day.key === selectedDate) return;
                    const nextAvailability = bookingRepository.getCachedVenueAvailability(
                      venueId,
                      day.key,
                    );
                    setAvailability(nextAvailability);
                    setLoadingAvailability(nextAvailability === null);
                    setAvailabilityError("");
                    setSelectedDate(day.key);
                    void releaseHold();
                  }}
                  className={`min-w-[72px] items-center rounded-xl border px-3 py-2 ${
                    active
                      ? "border-primary bg-primary"
                      : "border-guest-outline bg-guest-surface"
                  }`}
                >
                  <OwnerText
                    className={`text-caption font-familjen-medium ${
                      active
                        ? "text-on-primary"
                        : "text-guest-on-surface-variant"
                    }`}
                  >
                    {day.label}
                  </OwnerText>
                  <OwnerText
                    className={`font-familjen-semibold text-label ${
                      active ? "text-on-primary" : "text-guest-on-surface"
                    }`}
                  >
                    {day.sub}
                  </OwnerText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Court */}
        <View className="gap-3">
          <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
            Chọn sân
          </OwnerText>
          {loadingAvailability ? (
            <OwnerText className="text-body text-guest-on-surface-variant">
              Đang tải sân...
            </OwnerText>
          ) : availabilityError ? (
            <OwnerText className="text-body text-error">
              {availabilityError}
            </OwnerText>
          ) : (availability?.courts.length ?? 0) === 0 ? (
            <OwnerText className="text-body text-guest-on-surface-variant">
              Không có sân nào hoạt động trong ngày này.
            </OwnerText>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {availability?.courts.map((court) => {
                const active = court.id === selectedCourtId;
                return (
                  <Pressable
                    key={court.id}
                    disabled={holdUpdating || submitting}
                    onPress={() => {
                      if (holdRequestRef.current) return;
                      if (court.id === selectedCourtId) return;
                      setSelectedCourtId(court.id);
                      void releaseHold();
                    }}
                    className={`min-w-[72px] items-center rounded-xl border px-4 py-2 ${
                      active
                        ? "border-shuttle bg-shuttle/15"
                        : "border-guest-outline bg-guest-surface"
                    }`}
                  >
                    <OwnerText
                      className={`font-familjen-semibold text-label ${
                        active ? "text-shuttle" : "text-guest-on-surface"
                      }`}
                    >
                      {court.name}
                    </OwnerText>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Hours */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <OwnerText className="font-familjen-semibold text-label text-guest-on-surface">
              Chọn giờ
            </OwnerText>
            <OwnerText className="text-caption text-guest-on-surface-variant">
              Chọn các giờ liên tiếp
            </OwnerText>
          </View>
          {slots.length === 0 ? (
            <OwnerText className="text-body text-guest-on-surface-variant">
              {availability?.isOpen === false
                ? "Sân không mở cửa vào ngày này."
                : "Không có khung giờ phù hợp."}
            </OwnerText>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {slots.map((slot, index) => {
                const isSelected = selectedSlotIndexes.includes(index);
                const price = priceForSlot(venue?.priceRules ?? [], slot);
                const occupied = isSlotOccupied(slot, occupiedRanges);
                const held = isSlotOccupied(slot, heldRanges);
                const checkout = isSlotOccupied(slot, checkoutRanges);
                const heldByMe =
                  ownHoldMatches && isSlotOccupied(slot, [activeHold!]);
                const selectable =
                  price !== null &&
                  !occupied &&
                  !checkout &&
                  (!held || heldByMe);

                const bgClass = isSelected
                  ? "bg-slot-selected-background"
                  : occupied || price === null
                    ? "bg-slot-booked-background"
                    : (held && !heldByMe) || checkout
                      ? "bg-slot-pending-background"
                      : "bg-slot-available-background";
                const borderClass = isSelected
                  ? "border-shuttle"
                  : (held && !heldByMe) || checkout
                    ? "border-slot-pending-background"
                    : selectable
                      ? "border-slot-available-outline"
                      : "border-guest-outline";
                const textClass = isSelected
                  ? "text-on-primary"
                  : (held && !heldByMe) || checkout
                    ? "text-slot-pending-foreground"
                    : selectable
                      ? "text-slot-available-foreground"
                      : "text-guest-on-surface-variant";

                return (
                  <Pressable
                    key={slot.startTime}
                    onPress={() => toggleSlot(index)}
                    disabled={!selectable || holdUpdating}
                    className={`h-[76px] w-[23%] items-center justify-center gap-1 rounded-xl border px-1 py-2 ${bgClass} ${borderClass}`}
                  >
                    <OwnerText
                      numberOfLines={1}
                      className={`font-familjen-semibold text-label ${textClass}`}
                    >
                      {slot.startTime.slice(0, 5)}
                    </OwnerText>
                    <OwnerText
                      numberOfLines={2}
                      className={`h-8 text-center text-caption leading-4 ${textClass}`}
                    >
                      {isSelected
                        ? "Đang chọn"
                        : occupied
                          ? "Đã đặt"
                          : checkout
                            ? "Đang chọn"
                            : held
                              ? "Đã được chọn"
                              : price === null
                                ? "Không có giá"
                                : `${Math.round(price / 1000)}k`}
                    </OwnerText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {submitError ? (
          <OwnerText className="text-body text-error">{submitError}</OwnerText>
        ) : null}
          <ScheduleLegend />
      </ScrollView>

      <View className="border-t border-guest-outline bg-guest-surface px-5 pb-5 pt-3">
        <View className="mb-3 flex-row items-center justify-between">
          <View>
            <OwnerText className="text-body text-guest-on-surface-variant">
              {summary}
            </OwnerText>
            <OwnerText className="h-6 text-body text-guest-on-surface-variant">
              {timeRange}
            </OwnerText>
          </View>
          <OwnerText className="font-familjen-bold text-title text-guest-on-surface">
            {total !== null ? formatMoney(total) : "0đ"}
          </OwnerText>
        </View>
        <View className="mb-2 h-4 justify-center">
          {activeHold && holdRemainingMs > 0 && ownHoldMatches ? (
            <OwnerText className="text-center text-[11px] leading-4 text-guest-on-surface-variant">
              Còn giữ giờ {formatCountdown(holdRemainingMs)}
            </OwnerText>
          ) : null}
        </View>
        <OwnerButton
          title={
            status === "signedOut"
              ? "Đăng nhập để đặt"
              : submitting
                ? "Đang đặt sân..."
                : "Đặt ngay"
          }
          disabled={
            submitting ||
            total === null ||
            !bankReady ||
            !activeHold ||
            !ownHoldMatches ||
            holdRemainingMs <= 0
          }
          onPress={() => void onSubmit()}
        />
      </View>
    </SafeAreaView>
  );
}
