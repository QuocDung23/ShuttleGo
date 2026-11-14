# Kiểu chữ

## Font family

- Font chính: **Familjen Grotesk**
- Fallback đề xuất: `System`, `sans-serif`
- Các weight sử dụng: Regular `400`, Medium `500`, SemiBold `600`, Bold `700`
- Tiêu đề lớn dùng letter spacing âm để chữ gọn hơn.

## Thang chữ

| Token        | Size / line height | Weight | Letter spacing | Dùng cho                        |
| ------------ | ------------------ | ------ | -------------- | ------------------------------- |
| `headlineLg` | `28 / 34`          | `700`  | `-0.5`         | Tiêu đề chính của màn           |
| `headline`   | `24 / 30`          | `700`  | `-0.3`         | Tiêu đề section lớn             |
| `title`      | `20 / 26`          | `600`  | `0`            | Tiêu đề card, dialog và app bar |
| `titleSm`    | `16 / 22`          | `600`  | `0`            | Tiêu đề nhóm và hàng danh sách  |
| `label`      | `14 / 20`          | `600`  | `0`            | Nút, chip và nhãn điều khiển    |
| `caption`    | `12 / 16`          | `500`  | `0`            | Chú thích, metadata và badge    |
| `bodyLg`     | `16 / 24`          | `400`  | `0`            | Nội dung chính và ô nhập        |
| `body`       | `14 / 20`          | `400`  | `0`            | Nội dung mặc định               |
| `bodySm`     | `12 / 16`          | `400`  | `0`            | Nội dung phụ nhỏ                |

Đơn vị `size`, `line height` và `letter spacing` trong bảng là pixel theo Figma. Với React Native, dùng trực tiếp các giá trị số tương ứng.

## Sử dụng với NativeWind

```tsx
<Text className="font-familjen-bold text-headline-lg">Tổng quan</Text>
<Text className="font-familjen-semibold text-title">Đơn chờ duyệt</Text>
<Text className="font-familjen text-body">Nội dung mặc định</Text>
```

Font family: `font-familjen`, `font-familjen-medium`, `font-familjen-semibold`, `font-familjen-bold`.

Thang chữ: `text-headline-lg`, `text-headline`, `text-title`, `text-title-sm`, `text-label`, `text-caption`, `text-body-lg`, `text-body`, `text-body-sm`.
