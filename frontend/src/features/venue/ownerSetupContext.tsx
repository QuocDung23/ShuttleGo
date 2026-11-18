import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Venue } from '@/models/venue';

export type OwnerSetupVenueInfo = {
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  description: string;
  coverImageUrl: string;
  amenityIds: number[];
};

export type OwnerSetupPricing = {
  regularPrice: number;
  peakPrice: number;
  peakStartMinutes: number; // minutes since midnight
  weekendSurcharge: number;
  bankName: string;
  bankAccountNo: string;
  bankAccountHolder: string;
  bankQrImageUrl: string;
};

type OwnerSetupContextValue = {
  venueInfo: OwnerSetupVenueInfo;
  pricing: OwnerSetupPricing;
  createdVenue: Venue | null;
  setVenueInfo: (patch: Partial<OwnerSetupVenueInfo>) => void;
  setPricing: (patch: Partial<OwnerSetupPricing>) => void;
  setCreatedVenue: (venue: Venue | null) => void;
  reset: () => void;
};

export const createEmptyOwnerSetupVenueInfo = (): OwnerSetupVenueInfo => ({
  name: '',
  address: '',
  district: '',
  city: '',
  phone: '',
  description: '',
  coverImageUrl: '',
  amenityIds: [],
});

export const defaultPeakStartMinutes = 17 * 60; // 17:00
export const openMinutes = 6 * 60; // 06:00
export const closeMinutes = 22 * 60; // 22:00

export const createEmptyOwnerSetupPricing = (): OwnerSetupPricing => ({
  regularPrice: 0,
  peakPrice: 0,
  peakStartMinutes: defaultPeakStartMinutes,
  weekendSurcharge: 0,
  bankName: '',
  bankAccountNo: '',
  bankAccountHolder: '',
  bankQrImageUrl: '',
});

const OwnerSetupContext = createContext<OwnerSetupContextValue | null>(null);

export function OwnerSetupProvider({ children }: PropsWithChildren) {
  const [venueInfo, setVenueInfoState] = useState<OwnerSetupVenueInfo>(createEmptyOwnerSetupVenueInfo);
  const [pricing, setPricingState] = useState<OwnerSetupPricing>(createEmptyOwnerSetupPricing);
  const [createdVenue, setCreatedVenue] = useState<Venue | null>(null);

  const setVenueInfo = useCallback((patch: Partial<OwnerSetupVenueInfo>) => {
    setVenueInfoState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setPricing = useCallback((patch: Partial<OwnerSetupPricing>) => {
    setPricingState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setVenueInfoState(createEmptyOwnerSetupVenueInfo());
    setPricingState(createEmptyOwnerSetupPricing());
    setCreatedVenue(null);
  }, []);

  const value = useMemo(
    () => ({
      venueInfo,
      pricing,
      createdVenue,
      setVenueInfo,
      setPricing,
      setCreatedVenue,
      reset,
    }),
    [createdVenue, pricing, reset, setPricing, setVenueInfo, venueInfo],
  );

  return <OwnerSetupContext.Provider value={value}>{children}</OwnerSetupContext.Provider>;
}

export function useOwnerSetup() {
  const ctx = useContext(OwnerSetupContext);
  if (!ctx) throw new Error('useOwnerSetup must be used within OwnerSetupProvider');
  return ctx;
}

export function minutesToHHmm(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
