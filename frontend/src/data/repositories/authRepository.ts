import { apiRequest } from '@/data/api/client';
import type { AuthResponse, LoginInput, RegisterInput, User } from '@/models/auth';

export const authRepository = {
  login(input: LoginInput) {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: input,
      auth: false,
    });
  },

  register(input: RegisterInput) {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: input,
      auth: false,
    });
  },

  me() {
    return apiRequest<User>('/auth/me');
  },
};
