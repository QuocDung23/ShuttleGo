import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { Role, User } from '../models';
import { setApiToken } from '../services/apiClient';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';

/** Trạng thái đăng nhập toàn cục. Token lưu cục bộ bằng SecureStore (mã hóa). */
interface AuthState {
  user: User | null; token: string | null; ready: boolean;
  restore: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (d: { fullName: string; email: string; password: string; phone?: string; role?: Role }) => Promise<void>;
  setUser: (u: User) => void;
  logout: () => Promise<void>;
}
const KEY = 'shuttlego_token';

export const useAuthStore = create<AuthState>((set) => {
  const signIn = async (token: string, user: User) => {
    setApiToken(token);
    await SecureStore.setItemAsync(KEY, token);
    set({ token, user });
    notificationService.registerPush();
  };
  return {
    user: null, token: null, ready: false,
    restore: async () => {
      const token = await SecureStore.getItemAsync(KEY);
      if (token) {
        setApiToken(token);
        try { set({ token, user: await authService.me() }); } catch { setApiToken(null); await SecureStore.deleteItemAsync(KEY); }
      }
      set({ ready: true });
    },
    login: async (email, password) => { const r = await authService.login(email, password); await signIn(r.token, r.user); },
    register: async (d) => { const r = await authService.register(d); await signIn(r.token, r.user); },
    setUser: (user) => set({ user }),
    logout: async () => { setApiToken(null); await SecureStore.deleteItemAsync(KEY); set({ user: null, token: null }); },
  };
});
