import { create } from 'zustand';

/** Các khung giờ đang được chọn trên lưới (chưa gửi lên server). */
export interface DraftSlot { courtId: string; courtName: string; startTime: string; price: number }
interface DraftState {
  venueId: string | null; playDate: string; slots: DraftSlot[];
  start: (venueId: string, playDate: string) => void;
  toggle: (s: DraftSlot) => void;
  clear: () => void;
}
export const useBookingDraft = create<DraftState>((set, get) => ({
  venueId: null, playDate: '', slots: [],
  start: (venueId, playDate) => set({ venueId, playDate, slots: [] }),
  toggle: (s) => {
    const exists = get().slots.some((x) => x.courtId === s.courtId && x.startTime === s.startTime);
    set({ slots: exists ? get().slots.filter((x) => !(x.courtId === s.courtId && x.startTime === s.startTime)) : [...get().slots, s] });
  },
  clear: () => set({ slots: [] }),
}));
