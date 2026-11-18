export type AppNotification = {
  id: string;
  title: string;
  description: string;
  ago: string;
  isCancellation?: boolean;
};

/** Raw notification shape returned by GET /notifications. */
export type ApiNotification = {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  bookingId: number | null;
  isRead: boolean;
  createdAt: string;
};
