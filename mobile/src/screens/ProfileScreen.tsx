import { ScrollView, Text } from 'react-native';
import { Button, Input, s } from '../components/ui';
import { useProfileViewModel } from '../viewmodels/useProfileViewModel';

export default function ProfileScreen() {
  const vm = useProfileViewModel();
  return (
    <ScrollView style={s.screen}>
      <Text style={s.title}>{vm.user?.email}</Text>
      <Text style={[s.sub, { marginBottom: 12 }]}>{vm.user?.role === 'OWNER' ? 'Chủ sân' : 'Người chơi'}</Text>
      <Input label="Họ tên" value={vm.fullName} onChangeText={vm.setFullName} />
      <Input label="Số điện thoại" value={vm.phone} onChangeText={vm.setPhone} keyboardType="phone-pad" />
      <Button title="Lưu hồ sơ" onPress={vm.save} loading={vm.loading} />
      <Text style={s.h2}>Đổi mật khẩu</Text>
      <Input label="Mật khẩu cũ" value={vm.pw.old} onChangeText={(v) => vm.setPw({ ...vm.pw, old: v })} secureTextEntry />
      <Input label="Mật khẩu mới" value={vm.pw.new} onChangeText={(v) => vm.setPw({ ...vm.pw, new: v })} secureTextEntry />
      <Button title="Đổi mật khẩu" variant="outline" onPress={vm.changePassword} />
      <Button title="Đăng xuất" variant="danger" onPress={vm.logout} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}
