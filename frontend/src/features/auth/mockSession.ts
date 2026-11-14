import { mockAccounts } from '@/features/auth/mockAccounts';

export type MockAccount = (typeof mockAccounts)[number];

let currentAccount: MockAccount | null = null;

export function loginMockAccount(phone: string, password: string, role: MockAccount['role']) {
  const account = mockAccounts.find(
    (item) => item.role === role && item.phone.replace(/\D/g, '') === phone.replace(/\D/g, '') && item.password === password,
  );
  currentAccount = account ?? null;
  return account;
}

export function getMockAccount() {
  return currentAccount;
}

export function logoutMockAccount() {
  currentAccount = null;
}
