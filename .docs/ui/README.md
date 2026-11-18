# ShuttleGo UI foundations

Nguồn: [Figma – Design system, node 27:2706](https://www.figma.com/design/yDxGTJbf0x8Seiewu1HIj1/Untitled?node-id=27-2706)

Phạm vi tài liệu:

- [Màu sắc](./colors.md)
- [Kiểu chữ](./typography.md)
- [Token dạng JSON](./tokens.json)

## Nguyên tắc sử dụng

1. Trong code, dùng tên token theo ngữ nghĩa; không đặt tên theo màu như `orange500`.
2. Chữ và icon trên nền màu phải dùng token `on-*` tương ứng.
3. `shuttle` là màu nhấn cho trạng thái đang chọn. Hành động chính dùng `primary`.
4. Font giao diện là **Familjen Grotesk**. Icon dùng **Tabler Icons**, không dùng font chữ để giả icon.
5. Bộ token hiện dành cho giao diện sáng theo frame Figma.
6. Frontend dùng NativeWind; token được đăng ký trong `frontend/tailwind.config.js` và dùng bằng `className`.

## Ghi chú nguồn Figma

Trong nhóm màu bề mặt, nhãn hex của bốn swatch không khớp với màu fill đang hiển thị. Tài liệu chọn **fill đang render** để giữ đúng giao diện tông ấm:

| Token                  | Fill đang render | Nhãn đang ghi trong Figma |
| ---------------------- | ---------------- | ------------------------- |
| `surfaceContainerLow`  | `#FDF1E9`        | `#F0F4EF`                 |
| `surfaceContainer`     | `#F8EBE2`        | `#EAEFE9`                 |
| `surfaceContainerHigh` | `#F3E5DB`        | `#E4EAE3`                 |
| `inverseSurface`       | `#382E28`        | `#2A332D`                 |

Nếu các nhãn này được sửa trong Figma, cập nhật lại `colors.md` và `tokens.json` cùng lúc.
