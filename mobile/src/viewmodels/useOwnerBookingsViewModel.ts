import { useCallback, useEffect, useState } from 'react';
import { Booking } from '../models';
import { bookingService } from '../services/bookingService';
import { useAsyncAction } from '../utils/useAsync';

/** ViewModel duyệt lịch đặt của chủ sân. */
export function useOwnerBookingsViewModel() {
  const [status, setStatus] = useState('PENDING');
  const [items, setItems] = useState<Booking[]>([]);
  const { loading, run } = useAsyncAction();
  const load = useCallback(() => run(async () => setItems(await bookingService.forOwner({ status }))), [status, run]);
  useEffect(() => { load(); }, [load]);
  const drop = (id: string) => setItems((xs) => xs.filter((x) => x.id !== id));
  return {
    status, setStatus, items, loading, reload: load,
    approve: (b: Booking) => run(async () => { await bookingService.approve(b.id); drop(b.id); }, `Đã duyệt đơn ${b.code}`),
    reject: (b: Booking, reason: string) => run(async () => { await bookingService.reject(b.id, reason); drop(b.id); }, `Đã từ chối đơn ${b.code}`),
  };
}
