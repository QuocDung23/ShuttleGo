export type ScheduleDate = {
  day: string;
  label: string;
  dayOfWeek: number;
};

export type ScheduleSlot = {
  hour: string;
  status: "Còn trống" | "Chờ duyệt" | "Đã đặt";
  bookingId?: number;
};

export type ScheduleCourt = {
  id: number;
  name: string;
  slots: ScheduleSlot[];
};

export type BookingDetail = {
  title: string;
  rows: [label: string, value: string][];
};
