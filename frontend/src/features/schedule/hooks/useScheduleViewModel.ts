import { useState } from "react";

import type {
  BookingDetail,
  ScheduleCourt,
  ScheduleDate,
} from "@/models/schedule";

const dates: ScheduleDate[] = [
  { day: "Hôm nay", label: "31/10" },
  { day: "CN", label: "01/11" },
  { day: "T2", label: "02/11" },
  { day: "T3", label: "03/11" },
  { day: "T4", label: "04/11" },
  { day: "T5", label: "05/11" },
];

const hours = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
];
const courts: ScheduleCourt[] = Array.from({ length: 6 }, (_, courtIndex) => ({
  id: courtIndex + 1,
  name: `Sân ${courtIndex + 1}`,
  slots: hours.map((hour, hourIndex) => ({
    hour,
    status: courtIndex === 1 && hourIndex === 0 ? "Chờ duyệt" : "Đã đặt",
  })),
}));
const bookingDetail: BookingDetail = {
  title: "Sân 2 · T7, 31/10 · 19:00",
  rows: [
    ["Người đặt", "Trần Quốc Bảo"],
    ["Số điện thoại", "0903 456 789"],
    ["Thời gian", "19:00 – 21:00"],
    ["Tiền sân", "260.000đ"],
    ["Thanh toán", "Trả tại sân"],
  ],
};

export function useScheduleViewModel() {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [isBookingDetailVisible, setBookingDetailVisible] = useState(false);

  return {
    dates,
    courts,
    bookingDetail,
    selectedDateIndex,
    selectDate: setSelectedDateIndex,
    isBookingDetailVisible,
    openBookingDetail: () => setBookingDetailVisible(true),
    closeBookingDetail: () => setBookingDetailVisible(false),
  };
}
