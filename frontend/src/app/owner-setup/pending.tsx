import { useRouter } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OwnerButton, OwnerText, ownerColors } from "@/components/ui/owner-ui";
import { useAuth } from "@/features/auth/AuthContext";

type SymbolName = SymbolViewProps["name"];

export default function OwnerSetupPendingPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="grow justify-between self-center w-full max-w-[480px] px-6 py-6"
      >
        <View className="items-center gap-6 pt-8">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-container">
            <SymbolView
              name={{ ios: "checkmark.circle", android: "check_circle", web: "check_circle" }}
              size={40}
              tintColor={ownerColors.accent}
            />
          </View>

          <View className="items-center gap-2.5">
            <OwnerText className="text-center font-familjen-bold text-headline-lg">
              Hoàn tất thiết lập
            </OwnerText>
            <OwnerText tone="muted" className="text-center text-body-lg leading-6">
              Thông tin sân đã được nhập ở các bước thiết lập trên thiết bị. Tài khoản chủ sân
              {user?.fullName ? (
                <>
                  {" "}
                  <OwnerText className="font-familjen-semibold">{user.fullName}</OwnerText>
                </>
              ) : null}{" "}
              đã được tạo và sẵn sàng sử dụng ứng dụng. Việc lưu thông tin sân lên hệ thống và
              các bước xét duyệt (nếu có) sẽ được bổ sung ở giai đoạn sau.
            </OwnerText>
          </View>

          <View className="w-full gap-3 rounded-3xl border border-divider bg-surface p-5">
            <InfoRow
              icon={{ ios: "person.crop.circle", android: "person", web: "person" }}
              title="Tài khoản chủ sân"
              desc={user?.phone ?? "Đã đăng nhập"}
            />
            <InfoRow
              icon={{ ios: "building.2", android: "store", web: "store" }}
              title="Thông tin sân"
              desc="Đã nhập trên thiết bị (chưa đồng bộ máy chủ)"
            />
          </View>
        </View>

        <View className="mt-8 gap-3">
          <OwnerButton
            title="Vào trang quản lý"
            onPress={() => router.replace("/(owner)/dashboard")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  title,
  desc,
}: {
  icon: SymbolName;
  title: string;
  desc: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-container">
        <SymbolView name={icon} size={18} tintColor={ownerColors.accent} />
      </View>
      <View className="flex-1">
        <OwnerText className="font-familjen-semibold text-caption">{title}</OwnerText>
        <OwnerText tone="muted" className="text-caption">
          {desc}
        </OwnerText>
      </View>
    </View>
  );
}
