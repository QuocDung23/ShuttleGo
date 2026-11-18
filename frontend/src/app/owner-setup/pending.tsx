import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

import { OwnerButton, OwnerText, ownerColors } from "@/components/ui/owner-ui";
import {
  getMockAccount,
  updateCurrentAccountApproval,
} from "@/features/auth/mockSession";
import type { ApprovalStatus } from "@/features/auth/mockAccounts";

export default function OwnerSetupPendingPage() {
  const router = useRouter();
  const account = getMockAccount();
  const [status, setStatus] = useState<ApprovalStatus>(
    account?.approvalStatus ?? "pending"
  );

  const handleSimulateStatus = (newStatus: ApprovalStatus) => {
    setStatus(newStatus);
    updateCurrentAccountApproval(newStatus);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="grow px-6 py-6 justify-between max-w-[480px] self-center w-full"
      >
        <View className="items-center gap-6 pt-4">
          {/* Status Icon */}
          <View
            className={`h-20 w-20 items-center justify-center rounded-full ${
              status === "approved"
                ? "bg-emerald-100"
                : status === "rejected"
                ? "bg-rose-100"
                : "bg-primary-container"
            }`}
          >
            <SymbolView
              name={
                status === "approved"
                  ? {
                      ios: "checkmark.circle.fill",
                      android: "check_circle",
                      web: "check_circle",
                    }
                  : status === "rejected"
                  ? {
                      ios: "xmark.circle.fill",
                      android: "cancel",
                      web: "cancel",
                    }
                  : { ios: "clock.fill", android: "schedule", web: "schedule" }
              }
              size={40}
              tintColor={
                status === "approved"
                  ? "#059669"
                  : status === "rejected"
                  ? "#E11D48"
                  : ownerColors.accent
              }
            />
          </View>

          {/* Status Badge */}
          <View
            className={`rounded-full px-4 py-1.5 ${
              status === "approved"
                ? "bg-emerald-100 border border-emerald-300"
                : status === "rejected"
                ? "bg-rose-100 border border-rose-300"
                : "bg-primary-container border border-divider"
            }`}
          >
            <OwnerText
              className={`font-familjen-semibold text-caption ${
                status === "approved"
                  ? "text-emerald-800"
                  : status === "rejected"
                  ? "text-rose-800"
                  : "text-primary"
              }`}
            >
              {status === "approved"
                ? "✓ ĐÃ ĐƯỢC DUYỆT"
                : status === "rejected"
                ? "✕ BỊ TỪ CHỐI"
                : "⏳ ĐANG CHỜ HỆ THỐNG DUYỆT"}
            </OwnerText>
          </View>

          {/* Title & Description */}
          <View className="items-center gap-2.5">
            <OwnerText className="text-center font-familjen-bold text-headline-lg">
              {status === "approved"
                ? "Hồ sơ đã được duyệt!"
                : status === "rejected"
                ? "Hồ sơ chưa được duyệt"
                : "Chờ hệ thống duyệt"}
            </OwnerText>

            <OwnerText
              tone="muted"
              className="text-center text-body-lg leading-6"
            >
              {status === "approved" ? (
                <>
                  Chúc mừng bạn! Sân{" "}
                  <OwnerText className="font-familjen-semibold">
                    {account?.venueName ?? "của bạn"}
                  </OwnerText>{" "}
                  đã được phê duyệt. Bạn đã có đầy đủ quyền sử dụng ứng dụng và
                  quản lý lịch đặt.
                </>
              ) : status === "rejected" ? (
                <>
                  Rất tiếc, hồ sơ đăng ký sân của bạn chưa đạt yêu cầu kiểm duyệt.{" "}
                  <OwnerText className="font-familjen-semibold text-error">
                    Bạn hiện chưa có quyền sử dụng ứng dụng.
                  </OwnerText>{" "}
                  Vui lòng kiểm tra lại thông tin sân hoặc ảnh mã QR ngân hàng.
                </>
              ) : (
                <>
                  Hồ sơ sân và mã QR thanh toán của bạn đã được gửi thành công.
                  Ban quản trị ShuttleGo sẽ kiểm tra và xét duyệt trong vòng{" "}
                  <OwnerText className="font-familjen-semibold">
                    24 giờ làm việc
                  </OwnerText>
                  .
                </>
              )}
            </OwnerText>
          </View>

          {/* Summary Checklist */}
          <View className="w-full gap-3 rounded-3xl border border-divider bg-surface p-5">
            <InfoRow
              icon={{
                ios: "checkmark.circle",
                android: "check_circle",
                web: "check_circle",
              }}
              title="Tài khoản chủ sân"
              desc={account?.phone ?? "0909 123 457"}
            />
            <InfoRow
              icon={{
                ios: "mappin.circle",
                android: "store",
                web: "store",
              }}
              title="Thông tin sân & Tiện ích"
              desc={account?.venueName ?? "Sân cầu lông Kỳ Hòa"}
            />
            <InfoRow
              icon={{
                ios: "qrcode",
                android: "qr_code",
                web: "qr_code",
              }}
              title="Giá sân & Mã QR ngân hàng"
              desc="Đã liên kết mã VietQR nhận tiền"
            />
            <InfoRow
              icon={{
                ios: "shield.checkmark",
                android: "verified_user",
                web: "verified_user",
              }}
              title="Quyền truy cập hệ thống"
              desc={
                status === "approved"
                  ? "Đã cấp quyền truy cập"
                  : status === "rejected"
                  ? "Bị từ chối truy cập"
                  : "Chờ phê duyệt trước khi cấp quyền"
              }
              highlight={status !== "approved"}
            />
          </View>

          {/* Test / Simulator Switcher */}
          <View className="w-full gap-2 rounded-2xl border border-dashed border-outline/60 bg-surfaceContainerLow p-3.5">
            <OwnerText tone="muted" className="text-center text-caption font-familjen-semibold">
              🛠️ MÔ PHỎNG DUYỆT HỆ THỐNG (TEST FLOW)
            </OwnerText>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleSimulateStatus("approved")}
                className={`flex-1 items-center justify-center rounded-xl py-2 px-1 ${
                  status === "approved" ? "bg-emerald-600" : "bg-surface border border-divider"
                }`}
              >
                <OwnerText
                  className={`text-caption font-familjen-semibold ${
                    status === "approved" ? "text-white" : "text-emerald-700"
                  }`}
                >
                  ✓ Duyệt (Approve)
                </OwnerText>
              </Pressable>

              <Pressable
                onPress={() => handleSimulateStatus("rejected")}
                className={`flex-1 items-center justify-center rounded-xl py-2 px-1 ${
                  status === "rejected" ? "bg-rose-600" : "bg-surface border border-divider"
                }`}
              >
                <OwnerText
                  className={`text-caption font-familjen-semibold ${
                    status === "rejected" ? "text-white" : "text-rose-700"
                  }`}
                >
                  ✕ Từ chối (Reject)
                </OwnerText>
              </Pressable>

              <Pressable
                onPress={() => handleSimulateStatus("pending")}
                className={`flex-1 items-center justify-center rounded-xl py-2 px-1 ${
                  status === "pending" ? "bg-primary" : "bg-surface border border-divider"
                }`}
              >
                <OwnerText
                  className={`text-caption font-familjen-semibold ${
                    status === "pending" ? "text-white" : "text-primary"
                  }`}
                >
                  ⏳ Chờ duyệt
                </OwnerText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Footer Actions */}
        <View className="mt-8 gap-3">
          {status === "approved" ? (
            <OwnerButton
              title="Vào quản lý sân ngay (Dashboard) →"
              onPress={() => router.replace("/(owner)/dashboard")}
            />
          ) : status === "rejected" ? (
            <OwnerButton
              title="Chỉnh sửa & Gửi lại hồ sơ"
              onPress={() => router.push("/owner-setup/venue-info")}
            />
          ) : (
            <OwnerButton
              title="Về trang đăng nhập"
              outline
              onPress={() => router.replace("/login")}
            />
          )}

          {status !== "pending" && (
            <Pressable
              onPress={() => router.replace("/login")}
              className="items-center py-2"
            >
              <OwnerText tone="muted" className="text-body font-familjen-semibold">
                Quay lại trang đăng nhập
              </OwnerText>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  title,
  desc,
  highlight = false,
}: {
  icon: any;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-container">
        <SymbolView name={icon} size={18} tintColor={ownerColors.accent} />
      </View>
      <View className="flex-1">
        <OwnerText className="font-familjen-semibold text-caption">
          {title}
        </OwnerText>
        <OwnerText
          tone={highlight ? "pending" : "muted"}
          className="text-caption"
        >
          {desc}
        </OwnerText>
      </View>
    </View>
  );
}
