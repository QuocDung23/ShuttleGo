import axios, { AxiosError } from 'axios';
import { API_URL } from '../config/env';

/** Một instance Axios dùng chung; token được gắn tự động. */
export const api = axios.create({ baseURL: API_URL, timeout: 10000 });

let token: string | null = null;
export const setApiToken = (t: string | null) => { token = t; };
api.interceptors.request.use((cfg) => {
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/** Chuyển lỗi Axios thành câu thông báo tiếng Việt từ server. */
export function errorMessage(e: unknown): string {
  const err = e as AxiosError<{ message?: string }>;
  return err.response?.data?.message ?? (err.request ? 'Không kết nối được máy chủ' : 'Đã có lỗi xảy ra');
}
