import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import {
  AuthField,
  InlineLink,
  RoleToggle,
  type AccountRole,
} from "@/components/auth/AuthControls";
import { AuthScaffold, AuthTitle } from "@/components/auth/AuthScaffold";
import { OwnerButton, OwnerText } from "@/components/ui/owner-ui";
import { mockAccounts } from "@/features/auth/mockAccounts";
import { loginMockAccount } from "@/features/auth/mockSession";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<AccountRole>("player");
  const [phone, setPhone] = useState(mockAccounts[0].phone);
  const [password, setPassword] = useState(mockAccounts[0].password);
  const [error, setError] = useState("");
  const demoAccount = mockAccounts.find((account) => account.role === role)!;

  const selectRole = (nextRole: AccountRole) => {
    const account = mockAccounts.find((item) => item.role === nextRole)!;
    setRole(nextRole);
    setPhone(account.phone);
    setPassword(account.password);
    setError("");
  };

  const login = () => {
    const account = loginMockAccount(phone, password, role);
    if (!account) {
      setError("Số điện thoại hoặc mật khẩu không đúng với vai trò đã chọn.");
      return;
    }
    router.replace(account.role === "owner" ? "/(owner)/dashboard" : "/(guest)/explore");
  };

  return (
    <AuthScaffold
      footer={
        <>
          <OwnerButton title="Đăng nhập" onPress={login} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/register")}
            className="min-h-12 flex-row items-center justify-center gap-1"
          >
            <OwnerText tone="muted">Chưa có tài khoản?</OwnerText>
            <InlineLink>Đăng ký</InlineLink>
          </Pressable>
        </>
      }
    >
      <View className="mb-10 mt-16">
        <OwnerText tone="primary" className="font-familjen-bold text-title">
          ShuttleGo
        </OwnerText>
      </View>
      <AuthTitle
        title="Đăng nhập"
        description="Chào bạn quay lại. Đăng nhập để đặt sân và xem lịch của bạn."
      />
      <View className="mt-8 gap-5">
        <RoleToggle selected={role} onSelect={selectRole} />
        <OwnerText tone="muted" className="-mt-3 text-caption">
          Demo: {demoAccount.phone} / {demoAccount.password}
        </OwnerText>
        <AuthField
          label="Số điện thoại"
          icon={{ ios: "phone", android: "phone", web: "phone" }}
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            setError("");
          }}
          keyboardType="phone-pad"
        />
        <AuthField
          label="Mật khẩu"
          icon={{ ios: "lock", android: "lock", web: "lock" }}
          trailingIcon={{
            ios: "eye.slash",
            android: "visibility_off",
            web: "visibility_off",
          }}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setError("");
          }}
          secureTextEntry
        />
        {error ? <OwnerText className="text-error">{error}</OwnerText> : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/forgot-password")}
          className="self-end px-1 py-1"
        >
          <InlineLink>Quên mật khẩu?</InlineLink>
        </Pressable>
      </View>
    </AuthScaffold>
  );
}
