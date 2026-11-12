import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { OwnerText, ownerColors } from '@/components/ui/owner-ui';
import type { AppNotification } from '@/models/notification';

export function NotificationList({ notifications, unreadIds, onMarkRead }: { notifications: AppNotification[]; unreadIds: Set<string>; onMarkRead: (id: string) => void }) {
  return (
    <ScrollView>
      {notifications.map((notification) => {
        const unread = unreadIds.has(notification.id);
        return <Pressable key={notification.id} onPress={() => onMarkRead(notification.id)} style={[styles.notice, { backgroundColor: unread ? '#fff' : ownerColors.page }]}><View style={styles.icon}><OwnerText size={20} color="#4a1a05">{notification.isCancellation ? '↶' : '▣'}</OwnerText></View><View style={styles.content}><View style={styles.title}><OwnerText weight="semibold" size={16}>{notification.title}</OwnerText>{unread && <View style={styles.dot} />}</View><OwnerText color={ownerColors.muted} style={styles.description}>{notification.description}</OwnerText><OwnerText size={12} color={ownerColors.muted}>{notification.ago}</OwnerText></View></Pressable>;
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  notice: { minHeight: 107, padding: 16, flexDirection: 'row', gap: 12, borderBottomWidth: 1, borderBottomColor: ownerColors.border },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: ownerColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, gap: 3 },
  title: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ownerColors.accent },
  description: { lineHeight: 20 },
});
