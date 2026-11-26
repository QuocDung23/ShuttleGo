import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Alert } from 'react-native';

import { ApiError, setAuthToken, setOnUnauthorized } from '@/data/api/client';
import { authRepository } from '@/data/repositories/authRepository';
import { deleteStoredToken, getStoredToken, setStoredToken } from '@/data/storage/tokenStorage';
import type { LoginInput, RegisterInput, User } from '@/models/auth';

export type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  isRestoring: boolean;
  restoreError: string | null;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  retryRestore: () => Promise<void>;
  refreshMe: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const restoringRef = useRef(false);
  const signingOutRef = useRef(false);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    await deleteStoredToken();
    setUser(null);
    setRestoreError(null);
    setStatus('signedOut');
  }, []);

  const applySession = useCallback(async (token: string, nextUser: User) => {
    setAuthToken(token);
    await setStoredToken(token);
    setUser(nextUser);
    setRestoreError(null);
    setStatus('signedIn');
  }, []);

  const validateUser = useCallback((nextUser: User) => {
    if (nextUser.status !== 'active') {
      throw new ApiError(403, { message: 'Tài khoản không hoạt động.' });
    }
    return nextUser;
  }, []);

  const restore = useCallback(async () => {
    if (restoringRef.current) return;
    restoringRef.current = true;
    setStatus('restoring');
    setRestoreError(null);
    try {
      const token = await getStoredToken();
      if (!token) {
        setAuthToken(null);
        setUser(null);
        setStatus('signedOut');
        return;
      }
      setAuthToken(token);
      const me = await authRepository.me();
      try {
        validateUser(me);
      } catch (error) {
        await clearSession();
        if (error instanceof ApiError) {
          Alert.alert('Không thể khôi phục phiên', error.message);
        }
        return;
      }
      setUser(me);
      setStatus('signedIn');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
        await clearSession();
        return;
      }
      setRestoreError(
        error instanceof ApiError
          ? error.message
          : 'Không thể khôi phục phiên đăng nhập. Vui lòng thử lại.',
      );
      setStatus('restoring');
    } finally {
      restoringRef.current = false;
    }
  }, [clearSession, validateUser]);

  useEffect(() => {
    setOnUnauthorized(() => {
      if (signingOutRef.current) return;
      signingOutRef.current = true;
      void clearSession().finally(() => {
        signingOutRef.current = false;
      });
    });
    const timer = setTimeout(() => {
      void restore();
    }, 0);
    return () => {
      clearTimeout(timer);
      setOnUnauthorized(null);
    };
  }, [clearSession, restore]);

  const login = useCallback(
    async (input: LoginInput) => {
      const res = await authRepository.login(input);
      try {
        validateUser(res.user);
      } catch (error) {
        await clearSession();
        throw error;
      }
      await applySession(res.token, res.user);
      return res.user;
    },
    [applySession, clearSession, validateUser],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const res = await authRepository.register(input);
      try {
        validateUser(res.user);
      } catch (error) {
        await clearSession();
        throw error;
      }
      await applySession(res.token, res.user);
      return res.user;
    },
    [applySession, clearSession, validateUser],
  );

  const logout = useCallback(async () => {
    signingOutRef.current = true;
    try {
      await clearSession();
    } finally {
      signingOutRef.current = false;
    }
  }, [clearSession]);

  const retryRestore = useCallback(async () => {
    await restore();
  }, [restore]);

  const refreshMe = useCallback(async () => {
    try {
      const me = await authRepository.me();
      try {
        validateUser(me);
      } catch {
        await clearSession();
        return null;
      }
      setUser(me);
      return me;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
        await clearSession();
      }
      throw error;
    }
  }, [clearSession, validateUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isRestoring: status === 'restoring',
      restoreError,
      login,
      register,
      logout,
      retryRestore,
      refreshMe,
    }),
    [login, logout, refreshMe, register, restoreError, retryRestore, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
