import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { priceRuleRepository } from '@/data/repositories/priceRuleRepository';
import { venueRepository } from '@/data/repositories/venueRepository';
import {
  closeMinutes,
  createEmptyOwnerSetupPricing,
  minutesToHHmm,
  openMinutes,
  type OwnerSetupPricing,
} from '@/features/venue/ownerSetupContext';
import { useOwnerVenueAccess } from '@/features/venue/useOwnerVenueAccess';
import type { Venue } from '@/models/venue';

function timeToMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    throw new Error('Khung giờ của sân không hợp lệ.');
  }
  return hours * 60 + minutes;
}

function getVenueRules(venue: Venue) {
  const regular = venue.priceRules?.find((rule) => rule.label === 'Giờ thường');
  const peak = venue.priceRules?.find((rule) => rule.label === 'Giờ cao điểm');
  if (!regular || !peak) throw new Error('Không tìm thấy đủ hai khung giá của sân.');
  return { regular, peak };
}

function toPricing(venue: Venue): OwnerSetupPricing {
  const { regular, peak } = getVenueRules(venue);
  const peakStartMinutes = timeToMinutes(peak.startTime);
  if (peakStartMinutes <= openMinutes || peakStartMinutes >= closeMinutes) {
    throw new Error('Giờ bắt đầu cao điểm của sân không hợp lệ.');
  }

  return {
    regularPrice: regular.pricePerHour,
    peakPrice: peak.pricePerHour,
    peakStartMinutes,
    weekendSurcharge: venue.weekendSurcharge ?? 0,
    bankName: venue.bankName ?? '',
    bankAccountNo: venue.bankAccountNo ?? '',
    bankAccountHolder: venue.bankAccountHolder ?? '',
    bankQrImageUrl: venue.bankQrImageUrl ?? '',
  };
}

function getCachedPricing(venueId: number | null) {
  if (venueId === null) return null;
  const venue = venueRepository.getCached(venueId);
  if (!venue) return null;
  try {
    return { venueId: venue.id, pricing: toPricing(venue) };
  } catch {
    return null;
  }
}

export function usePricingViewModel() {
  const { primaryVenue, loading: accessLoading, error: accessError } = useOwnerVenueAccess();
  const primaryVenueId = primaryVenue?.id ?? null;
  const cached = getCachedPricing(primaryVenueId);
  const [venueId, setVenueId] = useState<number | null>(cached?.venueId ?? null);
  const [pricing, setPricingState] = useState<OwnerSetupPricing>(() =>
    cached?.pricing ?? createEmptyOwnerSetupPricing(),
  );
  const [savedPricing, setSavedPricing] = useState<OwnerSetupPricing | null>(
    cached?.pricing ?? null,
  );
  const [loading, setLoading] = useState(cached === null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
        setError('Không tìm thấy thông tin sân của tài khoản này.');
        setLoading(false);
        return;
      }

      const previous = getCachedPricing(primaryVenueId);
      if (previous) {
        setVenueId(previous.venueId);
        setPricingState(previous.pricing);
        setSavedPricing(previous.pricing);
      }
      setLoading(previous === null);
      setError('');
      void venueRepository
        .get(primaryVenueId)
        .then((venue) => {
          if (!active) return;
          setVenueId(venue.id);
          const nextPricing = toPricing(venue);
          setPricingState(nextPricing);
          setSavedPricing(nextPricing);
        })
        .catch((e) => {
          if (active && previous === null) {
            setError(e instanceof Error ? e.message : 'Không tải được thông tin giá của sân.');
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

  const setPricing = useCallback((patch: Partial<OwnerSetupPricing>) => {
    setPricingState((prev) => ({ ...prev, ...patch }));
  }, []);

  const save = useCallback(async () => {
    if (venueId === null) return;
    setSaving(true);
    setError('');
    try {
      // Read current rule times so retries after a partial save choose a safe update order.
      const currentVenue = await venueRepository.get(venueId);
      const { regular, peak } = getVenueRules(currentVenue);
      const nextPeakStart = minutesToHHmm(pricing.peakStartMinutes);
      const regularInput = {
        startTime: minutesToHHmm(openMinutes),
        endTime: nextPeakStart,
        pricePerHour: Math.round(pricing.regularPrice),
      };
      const peakInput = {
        startTime: nextPeakStart,
        endTime: minutesToHHmm(closeMinutes),
        pricePerHour: Math.round(pricing.peakPrice),
      };

      // shortcut: rules and venue fields use separate writes; add a transactional pricing endpoint if partial saves become unacceptable.
      if (pricing.peakStartMinutes > timeToMinutes(peak.startTime)) {
        await priceRuleRepository.update(peak.id, peakInput);
        await priceRuleRepository.update(regular.id, regularInput);
      } else {
        await priceRuleRepository.update(regular.id, regularInput);
        await priceRuleRepository.update(peak.id, peakInput);
      }

      await venueRepository.update(venueId, {
        weekendSurcharge: Math.max(0, Math.round(pricing.weekendSurcharge)),
        bankName: pricing.bankName.trim() || null,
        bankAccountNo: pricing.bankAccountNo.trim() || null,
        bankAccountHolder: pricing.bankAccountHolder.trim() || null,
        bankQrImageUrl: pricing.bankQrImageUrl.trim() || null,
      });
      setSavedPricing(pricing);
      Alert.alert('Đã lưu', 'Giá và thông tin thanh toán đã được cập nhật.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể lưu giá. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }, [pricing, venueId]);

  const hasChanges =
    savedPricing !== null && JSON.stringify(pricing) !== JSON.stringify(savedPricing);

  return {
    pricing,
    setPricing,
    save,
    loading,
    saving,
    error,
    canSave: venueId !== null,
    hasChanges,
  };
}
