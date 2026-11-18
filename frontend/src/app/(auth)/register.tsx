import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AuthField, InlineLink, RoleToggle } from '@/components/auth/AuthControls';
import { AuthScaffold } from '@/components/auth/AuthScaffold';
import { OwnerButton, OwnerText } from '@/components/ui/owner-ui';
import { ApiError } from '@/data/api/client';
import { useAuth } from '@/features/auth/AuthContext';
import { normalizePhone } from '@/models/auth';

type FieldErrors = Partial<Record<'fullName' | 'phone' | 'password' | 'general', string>>;

function getValidationDetails(error: ApiError) {
  const details = error.body?.details;
  if (!Array.isArray(details)) return null;
  const out: FieldErrors = {};
  for (const item of details) {
    if (!item || typeof item !== 'object') continue;
    const path = (item as { path?: unknown }).path;
    const message = (item as { message?: unknown }).message;
    if (typeof path === 'string' && typeof message === 'string') {
      if (path === 'fullName' || path === 'phone' || path === 'password') out[path] = message;
    }
  }
  return out;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = useState<'player' | 'owner'>('player');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => !submitting, [submitting]);

  const onContinue = async () => {
    const fullName = name.trim();
    const normalizedPhone = normalizePhone(phone);
    const nextErrors: FieldErrors = {};

    if (!fullName) nextErrors.fullName = 'Vui lòng nhập họ và tên.';
    if (!normalizedPhone) nextErrors.phone = 'Vui lòng nhập số điện thoại.';
    if (!password) nextErrors.password = 'Vui lòng nhập mật khẩu.';
    else if (password.length < 6 || password.length > 72) {
      nextErrors.password = 'Mật khẩu phải từ 6 đến 72 ký tự.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const user = await register({ fullName, phone: normalizedPhone, password, role });
      if (user.role === 'owner') {
        router.replace('/owner-setup/venue-info');
      } else {
        router.replace('/(guest)/explore');
      }
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 409) {
          setErrors({ phone: 'Số điện thoại đã được sử dụng.' });
        } else if (e.status === 400) {
          const details = getValidationDetails(e);
          if (details && Object.keys(details).length > 0) {
            setErrors(details);
          } else {
            setErrors({ general: e.message || 'Thông tin đăng ký không hợp lệ.' });
          }
        } else if (e.status === 403) {
          setErrors({ general: e.message || 'Tài khoản không hoạt động.' });
        } else {
          setErrors({ general: e.message || 'Đăng ký thất bại. Vui lòng thử lại.' });
        }
      } else {
        setErrors({ general: 'Đăng ký thất bại. Vui lòng thử lại.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      footer={
        <OwnerButton
          title={submitting ? 'Đang tạo tài khoản...' : 'Tiếp tục'}
          onPress={() => void onContinue()}
          disabled={!canSubmit}
        />
      }
    >
      <View className="mb-9 mt-1 items-center">
        <OwnerText className="font-familjen-semibold text-title">Tạo tài khoản</OwnerText>
      </View>
      <OwnerText className="font-familjen-semibold text-title-sm">Bạn dùng ShuttleGo để</OwnerText>
      <View className="mt-5 gap-4">
        <RoleToggle selected={role} onSelect={(next) => { setRole(next); setErrors({}); }} />
        <View className="gap-1">
          <AuthField
            label="Họ và tên"
            icon={{ ios: 'person', android: 'person', web: 'person' }}
            floatingLabel={false}
            value={name}
            onChangeText={(v) => {
              setName(v);
              setErrors((prev) => ({ ...prev, fullName: undefined, general: undefined }));
            }}
            editable={!submitting}
          />
          {errors.fullName ? <OwnerText className="px-1 text-caption text-error">{errors.fullName}</OwnerText> : null}
        </View>
        <View className="gap-1">
          <AuthField
            label="Số điện thoại"
            icon={{ ios: 'phone', android: 'phone', web: 'phone' }}
            floatingLabel={false}
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              setErrors((prev) => ({ ...prev, phone: undefined, general: undefined }));
            }}
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={!submitting}
          />
          {errors.phone ? <OwnerText className="px-1 text-caption text-error">{errors.phone}</OwnerText> : null}
        </View>
        <View className="gap-1">
          <AuthField
            label="Mật khẩu"
            icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
            trailingIcon={{ ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }}
            floatingLabel={false}
            helper="Tối thiểu 6 ký tự."
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
            }}
            secureTextEntry
            editable={!submitting}
          />
          {errors.password ? <OwnerText className="px-1 text-caption text-error">{errors.password}</OwnerText> : null}
        </View>
        {errors.general ? <OwnerText className="px-1 text-error">{errors.general}</OwnerText> : null}
        <OwnerText tone="muted" className="px-1 text-center text-caption">
          Bằng việc tiếp tục, bạn đồng ý với <InlineLink>Điều khoản sử dụng</InlineLink> và{' '}
          <InlineLink>Chính sách bảo mật</InlineLink> của ShuttleGo.
        </OwnerText>
      </View>
    </AuthScaffold>
  );
}
