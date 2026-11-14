export type ScheduleDate = {
  day: string;
  label: string;
};

export type ScheduleCourt = {
  id: number;
  name: string;
  slots: { hour: string; status: "Chờ duyệt" | "Đã đặt" }[];
};

export type BookingDetail = {
  title: string;
  rows: [label: string, value: string][];
};
