import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button, C, Input, s } from '../components/ui';
import { ScreenProps } from '../navigation/types';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

export function LoginScreen({ navigation }: ScreenProps<'Login'>) {
  const vm = useAuthViewModel();
  return (
    <View style={[s.screen, { justifyContent: 'center' }]}>
      <Text style={{ fontSize: 34, fontWeight: '800', color: C.primary, textAlign: 'center' }}>ShuttleGO</Text>
      <Text style={[s.sub, { textAlign: 'center', marginBottom: 24 }]}>Đặt sân cầu lông trong vài chạm</Text>
      <Input label="Email" value={vm.form.email} onChangeText={vm.set('email')} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Mật khẩu" value={vm.form.password} onChangeText={vm.set('password')} secureTextEntry />
      <Button title="Đăng nhập" onPress={vm.submitLogin} loading={vm.loading} />
      <Pressable onPress={() => navigation.navigate('Register')}><Text style={{ textAlign: 'center', color: C.primary, marginTop: 12 }}>Chưa có tài khoản? Đăng ký</Text></Pressable>
    </View>
  );
}

export function RegisterScreen() {
  const vm = useAuthViewModel();
  return (
    <ScrollView style={s.screen}>
      <Input label="Họ tên" value={vm.form.fullName} onChangeText={vm.set('fullName')} />
      <Input label="Email" value={vm.form.email} onChangeText={vm.set('email')} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Số điện thoại" value={vm.form.phone} onChangeText={vm.set('phone')} keyboardType="phone-pad" />
      <Input label="Mật khẩu (≥ 6 ký tự)" value={vm.form.password} onChangeText={vm.set('password')} secureTextEntry />
      <Text style={s.label}>Bạn là</Text>
      <View style={[s.row, { marginBottom: 16 }]}>
        {(['PLAYER', 'OWNER'] as const).map((r) => (
          <Pressable key={r} onPress={() => vm.set('role')(r)} style={[s.chip, vm.form.role === r && { backgroundColor: C.primary, borderColor: C.primary }]}>
            <Text style={{ color: vm.form.role === r ? '#fff' : C.text }}>{r === 'PLAYER' ? 'Người chơi' : 'Chủ sân'}</Text>
          </Pressable>
        ))}
      </View>
      <Button title="Tạo tài khoản" onPress={vm.submitRegister} loading={vm.loading} />
    </ScrollView>
  );
}
