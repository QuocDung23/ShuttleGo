import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Amenity, DayType, Venue, VenueDetail, VenueInput } from '../models';
import { venueService } from '../services/venueService';
import { useAsyncAction } from '../utils/useAsync';

/** ViewModel danh sách cơ sở của chủ sân + XÓA cơ sở. */
export function useOwnerVenuesViewModel() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const { loading, run } = useAsyncAction();
  const load = useCallback(() => run(async () => setVenues(await venueService.mine())), [run]);
  useEffect(() => { load(); }, [load]);
  const remove = (v: Venue) => Alert.alert('Xóa cơ sở', `Xóa "${v.name}"?`, [{ text: 'Không' },
    { text: 'Xóa', style: 'destructive', onPress: () => run(async () => { await venueService.remove(v.id); setVenues((xs) => xs.filter((x) => x.id !== v.id)); }) }]);
  return { venues, loading, reload: load, remove };
}

const EMPTY: VenueInput = { name: '', address: '', district: '', phone: '', openTime: '06:00', closeTime: '22:00', amenities: [] };

/**
 * ViewModel form cơ sở: THÊM / SỬA cơ sở; THÊM / SỬA / XÓA sân con và bảng giá.
 * venueId = undefined -> chế độ thêm mới.
 */
export function useVenueFormViewModel(venueId?: string) {
  const [id, setId] = useState(venueId);
  const [form, setForm] = useState<VenueInput>(EMPTY);
  const [detail, setDetail] = useState<VenueDetail | null>(null);
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const { loading, run } = useAsyncAction();

  const apply = (d: VenueDetail) => {
    setDetail(d); setId(d.id);
    setForm({ name: d.name, address: d.address, district: d.district ?? '', phone: d.phone ?? '', description: d.description ?? '',
      openTime: d.openTime.slice(0, 5), closeTime: d.closeTime.slice(0, 5), amenities: d.amenities, isActive: d.isActive });
  };
  useEffect(() => {
    venueService.amenities().then(setAllAmenities).catch(() => {});
    if (venueId) run(async () => apply(await venueService.detail(venueId)));
  }, [venueId, run]);

  const set = <K extends keyof VenueInput>(k: K, v: VenueInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (code: string) => set('amenities', form.amenities?.includes(code) ? form.amenities.filter((c) => c !== code) : [...(form.amenities ?? []), code]);
  const refresh = async () => { if (id) apply(await venueService.detail(id)); };

  return {
    isEdit: !!id, form, set, toggleAmenity, allAmenities, detail, loading,
    save: () => run(async () => apply(id ? await venueService.update(id, form) : await venueService.create(form)), id ? 'Đã cập nhật cơ sở' : 'Đã tạo cơ sở'),
    // Sân con
    addCourt: (name: string) => id && run(async () => { await venueService.addCourt(id, name); await refresh(); }),
    renameCourt: (courtId: string, name: string) => run(async () => { await venueService.updateCourt(courtId, { name }); await refresh(); }),
    toggleCourt: (courtId: string, isActive: boolean) => run(async () => { await venueService.updateCourt(courtId, { isActive }); await refresh(); }),
    removeCourt: (courtId: string) => run(async () => { await venueService.removeCourt(courtId); await refresh(); }),
    // Bảng giá
    addPrice: (p: { dayType: DayType; startTime: string; endTime: string; pricePerSlot: number }) =>
      id && run(async () => { await venueService.addPrice(id, p); await refresh(); }),
    updatePrice: (priceId: string, pricePerSlot: number) => run(async () => { await venueService.updatePrice(priceId, { pricePerSlot }); await refresh(); }),
    removePrice: (priceId: string) => run(async () => { await venueService.removePrice(priceId); await refresh(); }),
  };
}
