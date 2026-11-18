import { useCallback, useEffect, useState } from "react";

import { bookingRepository } from "@/data/repositories/bookingRepository";
import { venueRepository } from "@/data/repositories/venueRepository";
import { toPendingBooking } from "@/features/booking/bookingView";
import { usePendingBookingCount } from "@/features/home/PendingBookingCountContext";
import { useRealtimeRefresh } from "@/features/realtime/RealtimeProvider";
import { useOwnerVenueAccess } from "@/features/venue/useOwnerVenueAccess";
import type { PendingBooking } from "@/models/booking";
import { closeMinutes, openMinutes } from "@/features/venue/ownerSetupContext";
import { timeToMinutes, toDateKey } from "@/shared/format";

type HomeSnapshot = {
  venueName: string;
  occupancyLabel: string;
  pendingBookings: PendingBooking[];
};

const homeCache = new Map<number, HomeSnapshot>();

export function useHomeViewModel() {
  const { primaryVenue, loading: accessLoading, error: accessError } = useOwnerVenueAccess();
  const venueId = primaryVenue?.id ?? null;
  const cached = venueId === null ? undefined : homeCache.get(venueId);
  const { setCount: setPendingCount } = usePendingBookingCount();
  const [venueName, setVenueName] = useState(cached?.venueName ?? "");
  const [occupancyLabel, setOccupancyLabel] = useState(cached?.occupancyLabel ?? "0/0 giờ");
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>(cached?.pendingBookings ?? []);
  const [loading, setLoading] = useState(cached === undefined);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useRealtimeRefresh(
    ["booking.payment_reported", "booking.status_changed"],
    () => setReloadKey((value) => value + 1),
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active || accessLoading) return;
      if (accessError) {
        setError(accessError);
        setLoading(false);
        return;
      }
      if (venueId === null) {
        setError("Không tìm thấy thông tin sân của tài khoản này.");
        setLoading(false);
        return;
      }

      const previous = homeCache.get(venueId);
      if (previous) {
        setVenueName(previous.venueName);
        setOccupancyLabel(previous.occupancyLabel);
        setPendingBookings(previous.pendingBookings);
      }
      setLoading(previous === undefined);
      setError("");
      setVenueName(primaryVenue?.name ?? previous?.venueName ?? "");

      void Promise.all([
        venueRepository.get(venueId),
        bookingRepository.list({ venueId, status: "pending", limit: 100 }),
        bookingRepository.list({ venueId, date: toDateKey(new Date()), limit: 100 }),
      ])
        .then(([venue, pendingRes, todayRes]) => {
          if (!active) return;
          const nextPendingBookings = pendingRes.data.map(toPendingBooking);
          setPendingBookings(nextPendingBookings);
          setPendingCount(pendingRes.meta.total);

          const courtCount = venue.courts?.filter((court) => court.isActive !== false).length ?? 0;
          const totalHours = ((closeMinutes - openMinutes) / 60) * courtCount;
          const bookedMinutes = todayRes.data
            .filter((booking) => booking.status !== "cancelled")
            .reduce(
              (sum, booking) =>
                sum + Math.max(0, timeToMinutes(booking.endTime) - timeToMinutes(booking.startTime)),
              0,
            );
          const bookedHours = Math.round((bookedMinutes / 60) * 10) / 10;
          const nextOccupancyLabel = `${bookedHours}/${totalHours} giờ`;
          setOccupancyLabel(nextOccupancyLabel);
          homeCache.set(venueId, {
            venueName: primaryVenue?.name ?? venue.name,
            occupancyLabel: nextOccupancyLabel,
            pendingBookings: nextPendingBookings,
          });
        })
        .catch((e) => {
          if (active && previous === undefined) {
            setError(e instanceof Error ? e.message : "Không tải được dữ liệu tổng quan.");
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [accessError, accessLoading, primaryVenue?.name, reloadKey, setPendingCount, venueId]);

  const resolveBooking = useCallback(async (id: string, status: "confirmed" | "cancelled") => {
    try {
      await bookingRepository.updateStatus(Number(id), status);
      setPendingBookings((current) => {
        const next = current.filter((booking) => booking.id !== id);
        if (venueId !== null) {
          const snapshot = homeCache.get(venueId);
          if (snapshot) homeCache.set(venueId, { ...snapshot, pendingBookings: next });
        }
        return next;
      });
      setPendingCount((current) => Math.max(0, current - 1));
    } catch {
      // Keep the booking in the list so the owner can retry.
    }
  }, [setPendingCount, venueId]);

  return { venueName, occupancyLabel, pendingBookings, resolveBooking, loading, error };
}
