import { mockAccounts, type ApprovalStatus, type UserAccount } from "@/features/auth/mockAccounts";

export type MockAccount = UserAccount;

let currentAccount: MockAccount | null = null;

export function loginMockAccount(
  phone: string,
  password: string,
  role: MockAccount["role"]
) {
  const account = mockAccounts.find(
    (item) =>
      item.role === role &&
      item.phone.replace(/\D/g, "") === phone.replace(/\D/g, "") &&
      item.password === password
  );
  currentAccount = account ?? null;
  return account;
}

export function registerOwnerAccount({
  name,
  phone,
  password,
  venueName,
}: {
  name: string;
  phone: string;
  password: string;
  venueName?: string;
}) {
  const existing = mockAccounts.find(
    (item) =>
      item.role === "owner" &&
      item.phone.replace(/\D/g, "") === phone.replace(/\D/g, "")
  );
  if (existing) {
    existing.approvalStatus = "pending";
    existing.venueName = venueName ?? existing.venueName;
    currentAccount = existing;
    return existing;
  }
  const newAccount: UserAccount = {
    name,
    phone,
    password,
    role: "owner",
    approvalStatus: "pending",
    venueName: venueName ?? "Sân cầu lông mới",
  };
  mockAccounts.push(newAccount);
  currentAccount = newAccount;
  return newAccount;
}

export function updateCurrentAccountApproval(status: ApprovalStatus) {
  if (currentAccount) {
    currentAccount.approvalStatus = status;
  }
}

export function getMockAccount() {
  return currentAccount;
}

export function logoutMockAccount() {
  currentAccount = null;
}
