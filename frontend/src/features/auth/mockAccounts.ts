export type ApprovalStatus = "approved" | "pending" | "rejected";

export type UserAccount = {
  name: string;
  phone: string;
  password: string;
  role: "player" | "owner";
  approvalStatus?: ApprovalStatus;
  venueName?: string;
};

export const mockAccounts: UserAccount[] = [
  {
    name: "Người chơi demo",
    phone: "0909 123 456",
    password: "user123",
    role: "player",
    approvalStatus: "approved",
  },
  {
    name: "Chủ sân demo (Đã duyệt)",
    phone: "0909 123 457",
    password: "owner123",
    role: "owner",
    approvalStatus: "approved",
    venueName: "Sân cầu lông Kỳ Hòa",
  },
  {
    name: "Chủ sân demo (Chờ duyệt)",
    phone: "0909 123 458",
    password: "owner123",
    role: "owner",
    approvalStatus: "pending",
    venueName: "Sân cầu lông Tân Bình 2",
  },
  {
    name: "Chủ sân demo (Bị từ chối)",
    phone: "0909 123 459",
    password: "owner123",
    role: "owner",
    approvalStatus: "rejected",
    venueName: "Sân cầu lông Bình Thạnh",
  },
];
