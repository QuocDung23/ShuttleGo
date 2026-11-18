import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { OwnerInput, OwnerText } from "@/components/ui/owner-ui";
import { PricingForm } from "@/components/venue/PricingForm";
import { SettingsPage } from "@/components/venue/SettingsPage";
import { ApiError } from "@/data/api/client";
import { venueRepository } from "@/data/repositories/venueRepository";
import { useAuth } from "@/features/auth/AuthContext";
import { minutesToHHmm, useOwnerSetup } from "@/features/venue/ownerSetupContext";
import type { CreateVenueInput } from "@/models/venue";

const COURT_COUNT_EMPTY_ERROR = "Vui lòng nhập số lượng sân.";
const COURT_COUNT_INVALID_ERROR = "Số lượng sân phải là số nguyên từ 1 đến 100.";

function parseCourtCount(raw: string): { value: number | null; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null, error: COURT_COUNT_EMPTY_ERROR };
  if (!/^\d+$/.test(trimmed)) return { value: null, error: COURT_COUNT_INVALID_ERROR };
  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    return { value: null, error: COURT_COUNT_INVALID_ERROR };
  }
  return { value, error: "" };
}

function toOptional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function OwnerSetupPricingPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { venueInfo, pricing, courtCount, setCourtCount, setPricing, setCreatedVenue } =
    useOwnerSetup();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [courtCountError, setCourtCountError] = useState("");

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

    const parsedCount = parseCourtCount(courtCount);
    if (parsedCount.value === null) {
      setCourtCountError(parsedCount.error);
      return;
    }

    setSubmitting(true);
    setError("");
    setCourtCountError("");
    try {
      // Preflight before create: an earlier request may have saved the venue already.
      // If /venues/mine is unreachable, stop instead of posting blindly.
      let hasExistingVenue: boolean;
      try {
        hasExistingVenue = (await venueRepository.listMine()).data.length > 0;
      } catch {
        setError("Không thể kiểm tra hồ sơ sân hiện có. Vui lòng thử lại.");
        return;
      }
      if (hasExistingVenue) {
        // The pending screen routes by status (pending/approved/rejected/suspended).
        router.replace("/owner-setup/pending");
        return;
      }

      const peakStart = minutesToHHmm(pricing.peakStartMinutes);
      const payload: CreateVenueInput = {
        name,
        address,
        district,
        city,
        courtCount: parsedCount.value,
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

      const venue = await venueRepository.create(payload);
      setCreatedVenue(venue);
      router.replace("/owner-setup/pending");
    } catch (e) {
      if (e instanceof ApiError && e.isNetworkError) {
        // Ambiguous failure: the POST may have reached the server despite the error.
        try {
          if ((await venueRepository.listMine()).data.length > 0) {
            router.replace("/owner-setup/pending");
            return;
          }
        } catch {
          // Keep the message below when the check itself fails.
        }
        setError("Không thể xác nhận trạng thái hồ sơ. Vui lòng thử lại trước khi gửi lại.");
        return;
      }
      setError(
        e instanceof ApiError
          ? e.message || "Không thể lưu thông tin sân. Vui lòng thử lại."
          : "Không thể lưu thông tin sân. Vui lòng thử lại.",
      );
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
      <View className="gap-1.5">
        <OwnerInput
          label="Số lượng sân"
          value={courtCount}
          onChangeText={(text) => {
            setCourtCount(text);
            setCourtCountError("");
          }}
          keyboardType="number-pad"
          placeholder="Từ 1 đến 100"
          autoCorrect={false}
        />
        {courtCountError ? (
          <OwnerText className="text-error text-caption">{courtCountError}</OwnerText>
        ) : null}
      </View>
      <PricingForm value={pricing} onChange={setPricing} />
      {error ? (
        <View className="rounded-xl border border-error/30 bg-error/10 px-3 py-2">
          <OwnerText className="text-error text-body">{error}</OwnerText>
        </View>
      ) : null}
    </SettingsPage>
  );
}
