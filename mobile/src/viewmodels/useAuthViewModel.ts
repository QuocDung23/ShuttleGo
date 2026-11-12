import { useState } from 'react';
import { Role } from '../models';
import { useAuthStore } from '../store/authStore';
import { useAsyncAction } from '../utils/useAsync';

/** ViewModel cho màn Đăng nhập / Đăng ký. */
export function useAuthViewModel() {
  const { login, register } = useAuthStore();
  const { loading, run } = useAsyncAction();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', role: 'PLAYER' as Role });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  return {
    form, set, loading,
    submitLogin: () => run(() => login(form.email.trim(), form.password)),
    submitRegister: () => run(() => register({ ...form, email: form.email.trim(), phone: form.phone || undefined })),
  };
}
