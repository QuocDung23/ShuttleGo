import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { errorMessage } from '../services/apiClient';

/** Bọc một thao tác async: quản lý loading + hiển thị lỗi. Dùng trong các ViewModel. */
export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const run = useCallback(async <T,>(fn: () => Promise<T>, okMsg?: string): Promise<T | undefined> => {
    setLoading(true);
    try {
      const r = await fn();
      if (okMsg) Alert.alert('Thành công', okMsg);
      return r;
    } catch (e) {
      Alert.alert('Lỗi', errorMessage(e));
    } finally { setLoading(false); }
  }, []);
  return { loading, run };
}
