# Màu sắc

## Thương hiệu

| Token                | Hex       | Dùng cho                                         |
| -------------------- | --------- | ------------------------------------------------ |
| `primary`            | `#C2410C` | Nút chính, hành động chốt, điểm nhấn thương hiệu |
| `onPrimary`          | `#FFFFFF` | Chữ và icon trên `primary`                       |
| `primaryContainer`   | `#FFE2D1` | Tab đang chọn, chip và vùng nhấn nhẹ             |
| `onPrimaryContainer` | `#4A1A05` | Chữ và icon trên `primaryContainer`              |
| `shuttle`            | `#FF8A1F` | Slot đang chọn và điểm nhấn đặc trưng ShuttleGo  |
| `onShuttle`          | `#2B1200` | Chữ và icon trên `shuttle`                       |

## Bề mặt

| Token                  | Hex       | Dùng cho                             |
| ---------------------- | --------- | ------------------------------------ |
| `background`           | `#FFF8F3` | Nền màn hình                         |
| `surface`              | `#FFFFFF` | Card, dialog và ô nhập               |
| `surfaceContainerLow`  | `#FDF1E9` | Bottom sheet, vùng nền nổi nhẹ       |
| `surfaceContainer`     | `#F8EBE2` | Navigation bar và vùng gom nhóm      |
| `surfaceContainerHigh` | `#F3E5DB` | Search bar và vùng cần tách khỏi nền |
| `inverseSurface`       | `#382E28` | Bề mặt tương phản tối                |

## Chữ và viền

| Token              | Hex       | Dùng cho                         |
| ------------------ | --------- | -------------------------------- |
| `onSurface`        | `#231A14` | Chữ chính, tiêu đề và icon chính |
| `onSurfaceVariant` | `#5C4C42` | Chữ phụ, mô tả và icon phụ       |
| `outline`          | `#8C7A6E` | Viền control và nút outline      |
| `divider`          | `#EADBD0` | Đường phân cách và viền card     |

## Lỗi

| Token              | Hex       | Dùng cho                            |
| ------------------ | --------- | ----------------------------------- |
| `error`            | `#B3261E` | Viền lỗi, chữ lỗi và badge cảnh báo |
| `errorContainer`   | `#F9DEDC` | Nền thông báo lỗi                   |
| `onErrorContainer` | `#410E0B` | Chữ và icon trên `errorContainer`   |

## Khám phá sân

Frame Khám phá dùng bề mặt tối nâu và chữ sáng, riêng với nền sáng của các màn xác thực.

| Token                   | Hex       | Dùng cho                        |
| ----------------------- | --------- | ------------------------------- |
| `guestBackground`       | `#35251E` | Nền màn Khám phá                |
| `guestSurface`          | `#2B1B15` | Thanh tìm kiếm và thanh tab     |
| `guestOnSurface`        | `#FFF0E7` | Chữ chính trên nền guest        |
| `guestOnSurfaceVariant` | `#EBD3C4` | Chữ phụ và icon trên nền guest  |
| `guestOutline`          | `#9B8172` | Viền trên nền guest             |
| `guestSelected`         | `#F8DFDD` | Tab và bộ lọc đang chọn         |
| `guestSelectedInk`      | `#2B1B15` | Chữ và icon trên vùng đang chọn |

## Trạng thái lưới giờ

| Token                     | Hex       | Trạng thái |
| ------------------------- | --------- | ---------- |
| `slotAvailableBackground` | `#E6F4EA` | Còn trống  |
| `slotSelectedBackground`  | `#FF8A1F` | Đang chọn  |
| `slotPendingBackground`   | `#DCE9FF` | Chờ duyệt  |
| `slotBookedBackground`    | `#E7E3DF` | Đã đặt     |

Không truyền đạt trạng thái chỉ bằng màu. Slot và status chip cần thêm icon hoặc nhãn chữ như trong Figma.

## Sử dụng với NativeWind

Tên token camelCase được đổi thành kebab-case trong utility class:

```tsx
<View className="bg-background">
  <View className="border border-divider bg-surface">
    <Text className="text-on-surface">Nội dung</Text>
  </View>
</View>
```

Nguồn token runtime nằm tại `frontend/src/shared/theme/tokens.json`.
