export const mockAccounts: {
  name: string;
  phone: string;
  password: string;
  role: "player" | "owner";
}[] = [
  {
    name: "Người chơi demo",
    phone: "0909 123 456",
    password: "user123",
    role: "player",
  },
  {
    name: "Chủ sân demo",
    phone: "0909 123 457",
    password: "owner123",
    role: "owner",
  },
];
