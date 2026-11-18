import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { PricingForm } from "@/components/venue/PricingForm";
import { SettingsPage } from "@/components/venue/SettingsPage";
import { OwnerText } from "@/components/ui/owner-ui";
import { ApiError } from "@/data/api/client";
import { venueRepository } from "@/data/repositories/venueRepository";
import { useAuth } from "@/features/auth/AuthContext";
import { minutesToHHmm, useOwnerSetup } from "@/features/venue/ownerSetupContext";
import type { CreateVenueInput } from "@/models/venue";

function toOptional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function OwnerSetupPricingPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { venueInfo, pricing, setPricing, setCreatedVenue } = useOwnerSetup();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const backToLogin = () => {
    void logout().then(
      () => router.replace("/login"),
      () => router.replace("/login"),
    );
  };

  const onSubmit = async () => {
    const name = venueInfo.name.trim();
    const address = venueInfo.address.trim();
    const district = venueInfo.district.trim();
    const city = venueInfo.city.trim();

    if (!name || !address || !district || !city) {
      setError("Vui lòng nhập đầy đủ tên sân, địa chỉ, quận/huyện và thành phố ở bước thông tin sân.");
      return;
    }
    if (pricing.regularPrice <= 0 || pricing.peakPrice <= 0) {
      setError("Vui lòng thiết lập giá giờ thường và giờ cao điểm.");
      return;
    }
    if (
      !pricing.bankName.trim() ||
      !pricing.bankAccountNo.trim() ||
      !pricing.bankAccountHolder.trim() ||
      !pricing.bankQrImageUrl.trim()
    ) {
      setError("Vui lòng nhập đầy đủ thông tin tài khoản và URL ảnh mã QR ngân hàng.");
      return;
    }

    const peakStart = minutesToHHmm(pricing.peakStartMinutes);
    const payload: CreateVenueInput = {
      name,
      address,
      district,
      city,
      phone: toOptional(venueInfo.phone),
      description: toOptional(venueInfo.description),
      coverImageUrl: toOptional(venueInfo.coverImageUrl),
      weekendSurcharge: Math.max(0, Math.round(pricing.weekendSurcharge)),
      bankName: toOptional(pricing.bankName),
      bankAccountNo: toOptional(pricing.bankAccountNo),
      bankAccountHolder: toOptional(pricing.bankAccountHolder),
      bankQrImageUrl: toOptional(pricing.bankQrImageUrl),
      amenityIds: venueInfo.amenityIds,
      priceRules: [
        {
          label: "Giờ thường",
          startTime: "06:00",
          endTime: peakStart,
          pricePerHour: Math.max(0, Math.round(pricing.regularPrice)),
        },
        {
          label: "Giờ cao điểm",
          startTime: peakStart,
          endTime: "22:00",
          pricePerHour: Math.max(0, Math.round(pricing.peakPrice)),
        },
      ],
    };

    setSubmitting(true);
    setError("");
    try {
      const venue = await venueRepository.create(payload);
      setCreatedVenue(venue);
      router.replace("/owner-setup/pending");
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message || "Không thể lưu thông tin sân. Vui lòng thử lại.");
      } else {
        setError("Không thể lưu thông tin sân. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SettingsPage
      title="Giá & Mã QR thanh toán"
      saveTitle={submitting ? "Đang lưu..." : "Xác nhận đăng ký →"}
      onBack={backToLogin}
      onSave={() => void onSubmit()}
      disabled={submitting}
    >
      <PricingForm value={pricing} onChange={setPricing} />
      {error ? (
        <View className="rounded-xl border border-error/30 bg-error/10 px-3 py-2">
          <OwnerText className="text-error text-body">{error}</OwnerText>
        </View>
      ) : null}
    </SettingsPage>
  );
}
