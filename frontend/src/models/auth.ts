export type UserRole = 'player' | 'owner' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'banned';

export type User = {
  id: number;
  fullName: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ApiErrorDetail = {
  path: string;
  message: string;
};

export type ApiErrorBody = {
  message?: string;
  details?: unknown;
};

export type RegisterInput = {
  fullName: string;
  phone: string;
  password: string;
  role?: 'player' | 'owner';
};

export type LoginInput = {
  phone: string;
  password: string;
};

export function normalizePhone(value: string) {
  return value.replace(/[\s().-]/g, '');
}
