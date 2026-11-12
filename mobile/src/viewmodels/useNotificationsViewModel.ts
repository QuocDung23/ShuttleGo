import { useCallback, useEffect, useState } from 'react';
import { AppNotification } from '../models';
import { notificationService } from '../services/notificationService';
import { useAsyncAction } from '../utils/useAsync';

export function useNotificationsViewModel() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const { loading, run } = useAsyncAction();
  const load = useCallback(() => run(async () => setItems(await notificationService.list())), [run]);
  useEffect(() => { load(); }, [load]);
  return {
    items, loading, reload: load, unread: items.filter((n) => !n.isRead).length,
    read: (n: AppNotification) => !n.isRead && run(async () => { await notificationService.markRead(n.id); setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))); }),
    readAll: () => run(async () => { await notificationService.markAllRead(); setItems((xs) => xs.map((x) => ({ ...x, isRead: true }))); }),
    remove: (n: AppNotification) => run(async () => { await notificationService.remove(n.id); setItems((xs) => xs.filter((x) => x.id !== n.id)); }),
  };
}
