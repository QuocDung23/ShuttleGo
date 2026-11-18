import { Platform } from 'react-native';

const KEY = 'shuttlego.auth.token';

export async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(KEY) : null;
    } catch {
      return null;
    }
  }
  const SecureStore = await import('expo-secure-store');
  return SecureStore.getItemAsync(KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(KEY, token);
    } catch {}
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.setItemAsync(KEY, token);
}

export async function deleteStoredToken(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(KEY);
    } catch {}
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.deleteItemAsync(KEY);
}
