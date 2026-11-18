export type PendingBooking = {
  id: string;
  customerName: string;
  time: string;
  details: string;
};

export type BookingHistoryItem = PendingBooking & {
  status: "Chờ duyệt" | "Đã xác nhận" | "Hoàn tất";
};
