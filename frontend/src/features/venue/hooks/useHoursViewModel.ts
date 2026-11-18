import { useCallback, useEffect, useState } from "react";

import { operatingHourRepository } from "@/data/repositories/operatingHourRepository";
import { useOwnerVenueAccess } from "@/features/venue/useOwnerVenueAccess";
import type { OpeningHoursDay, OperatingHour } from "@/models/venue";

const DAY_LABELS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function toDays(hours: OperatingHour[]): OpeningHoursDay[] {
  const byDay = new Map(hours.map((hour) => [hour.dayOfWeek, hour]));
  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const hour = byDay.get(dayOfWeek);
    return {
      dayOfWeek,
      label: DAY_LABELS[dayOfWeek],
      isOpen: hour?.isOpen ?? false,
      openTime: hour?.openTime ?? "06:00",
      closeTime: hour?.closeTime ?? "22:00",
    };
  });
}

export function useHoursViewModel() {
  const { primaryVenue, loading: accessLoading, error: accessError } = useOwnerVenueAccess();
  const primaryVenueId = primaryVenue?.id ?? null;
  const cached = primaryVenueId === null ? null : operatingHourRepository.getCached(primaryVenueId);
  const [days, setDays] = useState<OpeningHoursDay[]>(() => cached ? toDays(cached) : []);
  const [venueId, setVenueId] = useState<number | null>(cached ? primaryVenueId : null);
  const [loading, setLoading] = useState(cached === null);
  const [saving, setSaving] = useState(false);
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
      if (primaryVenueId === null) {
        setError("Không tìm thấy thông tin sân của tài khoản này.");
        setLoading(false);
        return;
      }

      const previous = operatingHourRepository.getCached(primaryVenueId);
      if (previous) {
        setVenueId(primaryVenueId);
        setDays(toDays(previous));
      }
      setLoading(previous === null);
      setError("");
      void operatingHourRepository
        .list(primaryVenueId)
        .then((hours) => {
          if (!active) return;
          setVenueId(primaryVenueId);
          setDays(toDays(hours));
        })
        .catch((e) => {
          if (active && previous === null) {
            setError(e instanceof Error ? e.message : "Không tải được giờ mở cửa.");
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [accessError, accessLoading, primaryVenueId]);

  const setDay = useCallback((dayOfWeek: number, patch: Partial<OpeningHoursDay>) => {
    setDays((current) =>
      current.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day)),
    );
  }, []);

  const save = useCallback(async () => {
    if (venueId === null) return;
    setSaving(true);
    setError("");
    try {
      const updated = await operatingHourRepository.replace(
        venueId,
        days.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          isOpen: day.isOpen,
          openTime: day.isOpen ? day.openTime : null,
          closeTime: day.isOpen ? day.closeTime : null,
        })),
      );
      setDays(toDays(updated));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu giờ mở cửa. Vui lòng thử lại.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [days, venueId]);

  return { days, setDay, save, loading, saving, error, canSave: venueId !== null };
}
