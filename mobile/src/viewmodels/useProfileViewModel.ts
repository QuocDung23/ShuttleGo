import { useState } from 'react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useAsyncAction } from '../utils/useAsync';

/** ViewModel hồ sơ: SỬA thông tin, đổi mật khẩu, đăng xuất. */
export function useProfileViewModel() {
  const { user, setUser, logout } = useAuthStore();
  const { loading, run } = useAsyncAction();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [pw, setPw] = useState({ old: '', new: '' });
  return {
    user, fullName, setFullName, phone, setPhone, pw, setPw, loading, logout,
    save: () => run(async () => setUser(await authService.updateProfile({ fullName, phone: phone || null })), 'Đã lưu hồ sơ'),
    changePassword: () => run(async () => { await authService.changePassword(pw.old, pw.new); setPw({ old: '', new: '' }); }, 'Đã đổi mật khẩu'),
  };
}
