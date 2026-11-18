import { useState } from "react";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Alert, Pressable, View } from "react-native";

import { OwnerButton, OwnerInput, OwnerText, ownerColors } from "@/components/ui/owner-ui";
import {
  defaultBankInfo,
  type BankAccountInfo,
} from "@/features/venue/hooks/usePricingViewModel";

const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

const sampleQRs = [
  {
    name: "MB Bank",
    accountNumber: "0912 345 678",
    accountHolder: "SÂN CẦU LÔNG KỲ HÒA",
    url: "https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=0&addInfo=DAT%20SAN%20CAU%20LONG&accountName=SAN%20CAU%20LONG%20KY%20HOA",
  },
  {
    name: "Vietcombank",
    accountNumber: "9876 543 210",
    accountHolder: "SÂN CẦU LÔNG KỲ HÒA",
    url: "https://img.vietqr.io/image/VCB-9876543210-compact2.png?amount=0&addInfo=DAT%20SAN%20CAU%20LONG&accountName=SAN%20CAU%20LONG%20KY%20HOA",
  },
  {
    name: "Techcombank",
    accountNumber: "1903 888 999",
    accountHolder: "SÂN CẦU LÔNG KỲ HÒA",
    url: "https://img.vietqr.io/image/TCB-1903888999-compact2.png?amount=0&addInfo=DAT%20SAN%20CAU%20LONG&accountName=SAN%20CAU%20LONG%20KY%20HOA",
  },
];

export function PricingForm({
  rows,
  prices,
  onChangePrice,
  bankInfo = defaultBankInfo,
  onUpdateBankInfo,
}: {
  rows: readonly (readonly [string, string])[];
  prices: number[];
  onChangePrice: (index: number, delta: number) => void;
  bankInfo?: BankAccountInfo;
  onUpdateBankInfo?: (info: Partial<BankAccountInfo>) => void;
}) {
  const [currentQrIndex, setCurrentQrIndex] = useState(0);
  const [showEditFields, setShowEditFields] = useState(false);

  const handlePickQrImage = () => {
    const nextIndex = (currentQrIndex + 1) % sampleQRs.length;
    setCurrentQrIndex(nextIndex);
    const chosen = sampleQRs[nextIndex];
    if (onUpdateBankInfo) {
      onUpdateBankInfo({
        bankName: chosen.name,
        accountNumber: chosen.accountNumber,
        accountHolder: chosen.accountHolder,
        qrImageUrl: chosen.url,
      });
    }
    Alert.alert(
      "Đã chọn ảnh mã QR",
      `Đã cập nhật mã QR ngân hàng ${chosen.name}. Người chơi sẽ quét mã này để thanh toán.`
    );
  };

  const activeBank = sampleQRs[currentQrIndex];

  return (
    <>
      {/* ── Pricing configuration table ── */}
      <OwnerText tone="muted" className="text-body-lg">
        Giá tính cho mỗi giờ trên một sân. Người chơi thấy giá này khi chọn giờ.
      </OwnerText>

      <View className="overflow-hidden rounded-3xl border border-divider bg-surface">
        {rows.map(([label, description], index) => (
          <View
            key={label}
            className="min-h-[72px] flex-row items-center gap-2 border-b border-divider px-3.5"
          >
            <View className="flex-1">
              <OwnerText className="font-familjen-semibold">{label}</OwnerText>
              <OwnerText tone="muted" className="text-caption">
                {description}
              </OwnerText>
            </View>
            <Pressable
              onPress={() => onChangePrice(index, -10000)}
              className="h-12 w-12 items-center justify-center rounded-full border border-outline"
            >
              <OwnerText className="text-[22px]">−</OwnerText>
            </Pressable>
            <OwnerText className="w-[82px] text-center font-familjen-semibold">
              {index === 2 ? "17:00" : money(prices[index])}
            </OwnerText>
            <Pressable
              onPress={() => onChangePrice(index, 10000)}
              className="h-12 w-12 items-center justify-center rounded-full border border-outline"
            >
              <OwnerText className="text-[22px]">+</OwnerText>
            </Pressable>
          </View>
        ))}
      </View>

      {/* ── Section: Chọn ảnh QR ngân hàng nhận tiền ── */}
      <View className="mt-2 gap-3">
        <View className="gap-1">
          <OwnerText className="font-familjen-bold text-title">
            Mã QR ngân hàng nhận tiền
          </OwnerText>
          <OwnerText tone="muted" className="text-body">
            Chọn ảnh mã QR tài khoản ngân hàng để người chơi quét chuyển khoản thanh toán khi đặt sân.
          </OwnerText>
        </View>

        {/* Card hiển thị QR đã chọn */}
        <View className="items-center gap-4 rounded-3xl border border-divider bg-surface p-5">
          {/* Khung ảnh QR */}
          <View className="relative h-56 w-56 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-outline bg-primary-container/30 p-2">
            <Image
              source={{ uri: bankInfo.qrImageUrl || activeBank.url }}
              contentFit="contain"
              style={{ width: "100%", height: "100%" }}
            />
            {/* Badge đã tải ảnh */}
            <View className="absolute bottom-2 right-2 flex-row items-center gap-1 rounded-full bg-surface px-2.5 py-1 shadow-sm border border-divider">
              <View className="h-2 w-2 rounded-full bg-emerald-600" />
              <OwnerText className="font-familjen-semibold text-[11px]">
                VietQR
              </OwnerText>
            </View>
          </View>

          {/* Thông tin tài khoản kèm theo */}
          <View className="w-full gap-1.5 rounded-xl bg-surfaceContainerLow p-3">
            <View className="flex-row justify-between">
              <OwnerText tone="muted" className="text-caption">
                Ngân hàng:
              </OwnerText>
              <OwnerText className="font-familjen-semibold text-caption">
                {bankInfo.bankName || activeBank.name}
              </OwnerText>
            </View>
            <View className="flex-row justify-between">
              <OwnerText tone="muted" className="text-caption">
                Số tài khoản:
              </OwnerText>
              <OwnerText className="font-familjen-semibold text-caption text-primary">
                {bankInfo.accountNumber || activeBank.accountNumber}
              </OwnerText>
            </View>
            <View className="flex-row justify-between">
              <OwnerText tone="muted" className="text-caption">
                Chủ tài khoản:
              </OwnerText>
              <OwnerText className="font-familjen-semibold text-caption">
                {bankInfo.accountHolder || activeBank.accountHolder}
              </OwnerText>
            </View>
          </View>

          {/* Nút hành động chọn / đổi ảnh QR */}
          <View className="w-full gap-2">
            <OwnerButton
              title="📷 Chọn ảnh mã QR ngân hàng"
              outline
              onPress={handlePickQrImage}
            />
            <Pressable
              onPress={() => setShowEditFields(!showEditFields)}
              className="items-center py-1"
            >
              <OwnerText tone="primary" className="text-caption font-familjen-semibold">
                {showEditFields ? "▲ Thu gọn thông tin" : "▼ Chỉnh sửa thông tin tài khoản"}
              </OwnerText>
            </Pressable>
          </View>

          {/* Trường nhập thông tin chi tiết (nếu muốn chỉnh) */}
          {showEditFields && (
            <View className="w-full gap-3 pt-2">
              <OwnerInput
                label="Tên ngân hàng"
                defaultValue={bankInfo.bankName || activeBank.name}
                onChangeText={(text) => onUpdateBankInfo?.({ bankName: text })}
              />
              <OwnerInput
                label="Số tài khoản"
                defaultValue={bankInfo.accountNumber || activeBank.accountNumber}
                keyboardType="numeric"
                onChangeText={(text) => onUpdateBankInfo?.({ accountNumber: text })}
              />
              <OwnerInput
                label="Tên chủ tài khoản"
                defaultValue={bankInfo.accountHolder || activeBank.accountHolder}
                onChangeText={(text) => onUpdateBankInfo?.({ accountHolder: text })}
              />
            </View>
          )}

          <OwnerText tone="muted" className="text-center text-[12px]">
            Mã QR này sẽ hiển thị trực tiếp tại bước xác nhận thanh toán khi người chơi đặt sân.
          </OwnerText>
        </View>
      </View>
    </>
  );
}
