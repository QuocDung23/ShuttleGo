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

export function usePricingViewModel() {
  const { primaryVenue, loading: accessLoading, error: accessError } = useOwnerVenueAccess();
  const [venueId, setVenueId] = useState<number | null>(null);
  const [pricing, setPricingState] = useState<OwnerSetupPricing>(createEmptyOwnerSetupPricing);
  const [loading, setLoading] = useState(true);
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
      if (!primaryVenue) {
        setError('Không tìm thấy thông tin sân của tài khoản này.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setVenueId(null);
      void venueRepository
        .get(primaryVenue.id)
        .then((venue) => {
          if (!active) return;
          setVenueId(venue.id);
          setPricingState(toPricing(venue));
        })
        .catch((e) => {
          if (active) setError(e instanceof Error ? e.message : 'Không tải được thông tin giá của sân.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [accessError, accessLoading, primaryVenue]);

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
      Alert.alert('Đã lưu', 'Giá và thông tin thanh toán đã được cập nhật.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể lưu giá. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }, [pricing, venueId]);

  return { pricing, setPricing, save, loading, saving, error, canSave: venueId !== null };
}
