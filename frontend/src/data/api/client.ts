import type { ApiErrorBody } from '@/models/auth';

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, fallbackMessage?: string) {
    super(
      (body && typeof body.message === 'string' && body.message) ||
        fallbackMessage ||
        `Request failed (${status})`,
    );
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

function getBaseUrl() {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    throw new ApiError(0, null, 'Chưa cấu hình EXPO_PUBLIC_API_URL.');
  }
  return url.replace(/\/+$/, '');
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, null, 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng hoặc địa chỉ API.');
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (res.status === 401 && auth && onUnauthorized) {
    onUnauthorized();
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data && typeof data === 'object' ? (data as ApiErrorBody) : null,
    );
  }

  return data as T;
}
