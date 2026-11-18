import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { OwnerButton, OwnerInput, OwnerText } from "@/components/ui/owner-ui";
import { pickVenueImage } from "@/components/venue/pickVenueImage";
import {
  closeMinutes,
  minutesToHHmm,
  openMinutes,
  type OwnerSetupPricing,
} from "@/features/venue/ownerSetupContext";

const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

const TIME_STEP = 30;
const MONEY_STEP = 10000;

type PricingFormProps = {
  value: OwnerSetupPricing;
  onChange: (patch: Partial<OwnerSetupPricing>) => void;
};

export function PricingForm({ value, onChange }: PricingFormProps) {
  const [pickingQr, setPickingQr] = useState(false);
  const peakStart = minutesToHHmm(value.peakStartMinutes);
  const rows = [
    {
      label: "Giờ thường",
      description: `06:00 – ${peakStart}`,
      display: value.regularPrice > 0 ? money(value.regularPrice) : "Chưa nhập",
      onMinus: () => onChange({ regularPrice: Math.max(0, value.regularPrice - MONEY_STEP) }),
      onPlus: () => onChange({ regularPrice: value.regularPrice + MONEY_STEP }),
    },
    {
      label: "Giờ cao điểm",
      description: `${peakStart} – 22:00`,
      display: value.peakPrice > 0 ? money(value.peakPrice) : "Chưa nhập",
      onMinus: () => onChange({ peakPrice: Math.max(0, value.peakPrice - MONEY_STEP) }),
      onPlus: () => onChange({ peakPrice: value.peakPrice + MONEY_STEP }),
    },
    {
      label: "Bắt đầu cao điểm",
      description: "Áp dụng giá cao điểm từ giờ này",
      display: peakStart,
      onMinus: () =>
        onChange({
          peakStartMinutes: Math.max(openMinutes + TIME_STEP, value.peakStartMinutes - TIME_STEP),
        }),
      onPlus: () =>
        onChange({
          peakStartMinutes: Math.min(closeMinutes - TIME_STEP, value.peakStartMinutes + TIME_STEP),
        }),
    },
    {
      label: "Phụ thu cuối tuần",
      description: "Cộng thêm mỗi giờ vào T7, CN",
      display: value.weekendSurcharge > 0 ? money(value.weekendSurcharge) : "Chưa nhập",
      onMinus: () =>
        onChange({ weekendSurcharge: Math.max(0, value.weekendSurcharge - MONEY_STEP) }),
      onPlus: () => onChange({ weekendSurcharge: value.weekendSurcharge + MONEY_STEP }),
    },
  ] as const;

  const selectQrImage = async () => {
    setPickingQr(true);
    const bankQrImageUrl = await pickVenueImage({ aspect: [1, 1], width: 1024 });
    if (bankQrImageUrl) onChange({ bankQrImageUrl });
    setPickingQr(false);
  };

  return (
    <>
      <OwnerText tone="muted" className="text-body-lg">
        Giá tính cho mỗi giờ trên một sân. Người chơi thấy giá này khi chọn giờ.
      </OwnerText>

      <View className="overflow-hidden rounded-3xl border border-divider bg-surface">
        {rows.map((row, index) => (
          <View
            key={row.label}
            className={`min-h-[72px] flex-row items-center gap-2 px-3.5 ${index < rows.length - 1 ? "border-b border-divider" : ""}`}
          >
            <View className="flex-1">
              <OwnerText className="font-familjen-semibold">{row.label}</OwnerText>
              <OwnerText tone="muted" className="text-caption">
                {row.description}
              </OwnerText>
            </View>
            <Pressable
              onPress={row.onMinus}
              className="h-12 w-12 items-center justify-center rounded-full border border-outline"
            >
              <OwnerText className="text-[22px]">−</OwnerText>
            </Pressable>
            <OwnerText className="w-[82px] text-center font-familjen-semibold">
              {row.display}
            </OwnerText>
            <Pressable
              onPress={row.onPlus}
              className="h-12 w-12 items-center justify-center rounded-full border border-outline"
            >
              <OwnerText className="text-[22px]">+</OwnerText>
            </Pressable>
          </View>
        ))}
      </View>

      <View className="mt-2 gap-3">
        <View className="gap-1">
          <OwnerText className="font-familjen-bold text-title">
            Mã QR ngân hàng nhận tiền
          </OwnerText>
          <OwnerText tone="muted" className="text-body">
            Nhập thông tin tài khoản và chọn ảnh mã QR để người chơi quét khi thanh toán đặt sân.
          </OwnerText>
        </View>

        <View className="items-center gap-4 rounded-3xl border border-divider bg-surface p-5">
          <View className="relative h-56 w-56 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-outline bg-primary-container/30 p-2">
            {value.bankQrImageUrl.trim() ? (
              <Image
                source={{ uri: value.bankQrImageUrl.trim() }}
                contentFit="contain"
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <OwnerText tone="muted" className="text-center text-caption">
                Ảnh mã QR sẽ hiển thị ở đây
              </OwnerText>
            )}
          </View>
          <OwnerButton
            title={pickingQr ? "Đang mở thư viện..." : value.bankQrImageUrl ? "Đổi ảnh mã QR" : "Chọn ảnh mã QR"}
            outline
            disabled={pickingQr}
            onPress={() => void selectQrImage()}
          />

          <View className="w-full gap-1.5 rounded-xl bg-surfaceContainerLow p-3">
            <View className="flex-row justify-between">
              <OwnerText tone="muted" className="text-caption">
                Ngân hàng:
              </OwnerText>
              <OwnerText className="font-familjen-semibold text-caption">
                {value.bankName || "Chưa nhập"}
              </OwnerText>
            </View>
            <View className="flex-row justify-between">
              <OwnerText tone="muted" className="text-caption">
                Số tài khoản:
              </OwnerText>
              <OwnerText className="font-familjen-semibold text-caption text-primary">
                {value.bankAccountNo || "Chưa nhập"}
              </OwnerText>
            </View>
            <View className="flex-row justify-between">
              <OwnerText tone="muted" className="text-caption">
                Chủ tài khoản:
              </OwnerText>
              <OwnerText className="font-familjen-semibold text-caption">
                {value.bankAccountHolder || "Chưa nhập"}
              </OwnerText>
            </View>
          </View>

          <View className="w-full gap-3 pt-2">
            <OwnerInput
              label="Tên ngân hàng"
              value={value.bankName}
              onChangeText={(text) => onChange({ bankName: text })}
            />
            <OwnerInput
              label="Số tài khoản"
              value={value.bankAccountNo}
              keyboardType="numeric"
              onChangeText={(text) => onChange({ bankAccountNo: text })}
            />
            <OwnerInput
              label="Tên chủ tài khoản"
              value={value.bankAccountHolder}
              onChangeText={(text) => onChange({ bankAccountHolder: text })}
            />
          </View>

          <OwnerText tone="muted" className="text-center text-[12px]">
            Mã QR này sẽ hiển thị trực tiếp tại bước xác nhận thanh toán khi người chơi đặt sân.
          </OwnerText>
        </View>
      </View>
    </>
  );
}
