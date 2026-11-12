import { useCallback, useEffect, useMemo, useState } from 'react';
import { Availability, Booking } from '../models';
import { bookingService } from '../services/bookingService';
import { venueService } from '../services/venueService';
import { useBookingDraft } from '../store/bookingDraftStore';
import { useAsyncAction } from '../utils/useAsync';
import { vnToday } from '../utils/format';

/** ViewModel lưới sân x khung giờ: chọn ngày, chọn nhiều slot, gửi đặt sân (THÊM đơn). */
export function useBookingGridViewModel(venueId: string) {
  const [date, setDate] = useState(vnToday());
  const [grid, setGrid] = useState<Availability | null>(null);
  const draft = useBookingDraft();
  const { loading, run } = useAsyncAction();

  const load = useCallback(async () => {
    await run(async () => { setGrid(await venueService.availability(venueId, date)); });
  }, [venueId, date, run]);
  useEffect(() => { draft.start(venueId, date); load(); }, [venueId, date]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = useMemo(() => draft.slots.reduce((a, s) => a + s.price, 0), [draft.slots]);
  const isSelected = (courtId: string, startTime: string) => draft.slots.some((s) => s.courtId === courtId && s.startTime === startTime);

  const submit = async (note?: string): Promise<Booking | undefined> => {
    const b = await run(() => bookingService.create({
      venueId, playDate: date, note, slots: draft.slots.map(({ courtId, startTime }) => ({ courtId, startTime })),
    }));
    if (b) draft.clear(); else load(); // lỗi 409 (vừa có người đặt) -> tải lại lưới
    return b;
  };
  return { date, setDate, grid, selected: draft.slots, toggle: draft.toggle, isSelected, total, loading, reload: load, submit };
}
