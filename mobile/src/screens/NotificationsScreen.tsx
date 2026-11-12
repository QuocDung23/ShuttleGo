import { FlatList, Pressable, Text, View } from 'react-native';
import { Button, C, Card, Empty, s } from '../components/ui';
import { useNotificationsViewModel } from '../viewmodels/useNotificationsViewModel';

export default function NotificationsScreen() {
  const vm = useNotificationsViewModel();
  return (
    <View style={s.screen}>
      {vm.unread > 0 && <Button title={`Đánh dấu đã đọc (${vm.unread})`} variant="outline" onPress={vm.readAll} />}
      <FlatList
        data={vm.items} keyExtractor={(n) => n.id} refreshing={vm.loading} onRefresh={vm.reload}
        ListEmptyComponent={!vm.loading ? <Empty text="Chưa có thông báo" /> : null}
        renderItem={({ item: n }) => (
          <Pressable onPress={() => vm.read(n)} onLongPress={() => vm.remove(n)}>
            <Card style={!n.isRead ? { borderColor: C.primary } : undefined}>
              <Text style={{ fontWeight: n.isRead ? '400' : '700' }}>{n.title}</Text>
              <Text style={s.sub}>{n.body}</Text>
              <Text style={[s.sub, { fontSize: 11 }]}>{new Date(n.createdAt).toLocaleString('vi-VN')} · giữ để xóa</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
