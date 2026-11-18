import { useCallback, useEffect, useState } from "react";

import { bookingRepository } from "@/data/repositories/bookingRepository";
import { venueRepository } from "@/data/repositories/venueRepository";
import { toPendingBooking } from "@/features/booking/bookingView";
import { usePendingBookingCount } from "@/features/home/PendingBookingCountContext";
import { useOwnerVenueAccess } from "@/features/venue/useOwnerVenueAccess";
import type { PendingBooking } from "@/models/booking";
import { closeMinutes, openMinutes } from "@/features/venue/ownerSetupContext";
import { timeToMinutes, toDateKey } from "@/shared/format";

export function useHomeViewModel() {
  const { primaryVenue, loading: accessLoading, error: accessError } = useOwnerVenueAccess();
  const { setCount: setPendingCount } = usePendingBookingCount();
  const [venueName, setVenueName] = useState("");
  const [occupancyLabel, setOccupancyLabel] = useState("0/0 giờ");
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
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
      const venueId = primaryVenue.id;
      setVenueName(primaryVenue.name);

      void Promise.all([
        venueRepository.get(venueId),
        bookingRepository.list({ venueId, status: "pending", limit: 100 }),
        bookingRepository.list({ venueId, date: toDateKey(new Date()), limit: 100 }),
      ])
        .then(([venue, pendingRes, todayRes]) => {
          if (!active) return;
          setPendingBookings(pendingRes.data.map(toPendingBooking));
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
          setOccupancyLabel(`${bookedHours}/${totalHours} giờ`);
        })
        .catch((e) => {
          if (active) setError(e instanceof Error ? e.message : "Không tải được dữ liệu tổng quan.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [accessError, accessLoading, primaryVenue]);

  const resolveBooking = useCallback(async (id: string, status: "confirmed" | "cancelled") => {
    try {
      await bookingRepository.updateStatus(Number(id), status);
      setPendingBookings((current) => current.filter((booking) => booking.id !== id));
      setPendingCount((current) => Math.max(0, current - 1));
    } catch {
      // Keep the booking in the list so the owner can retry.
    }
  }, [setPendingCount]);

  return { venueName, occupancyLabel, pendingBookings, resolveBooking, loading, error };
}
