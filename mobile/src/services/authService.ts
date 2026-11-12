import { AuthResult, Role, User } from '../models';
import { api } from './apiClient';

export const authService = {
  login: (email: string, password: string) => api.post<AuthResult>('/auth/login', { email, password }).then((r) => r.data),
  register: (d: { fullName: string; email: string; password: string; phone?: string; role?: Role }) =>
    api.post<AuthResult>('/auth/register', d).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
  updateProfile: (d: Partial<Pick<User, 'fullName' | 'phone' | 'avatarUrl'>>) => api.put<User>('/auth/me', d).then((r) => r.data),
  changePassword: (oldPassword: string, newPassword: string) => api.put('/auth/password', { oldPassword, newPassword }),
};
