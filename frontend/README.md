# ShuttleGo Frontend (Expo)

Ứng dụng Expo/React Native (Expo Router) cho ShuttleGo.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Cấu hình API backend

   ```bash
   cp .env.example .env
   ```

   Chỉnh `EXPO_PUBLIC_API_URL` trong `.env` theo nơi chạy app (backend cùng máy dev):

   - Web / iOS Simulator: `http://localhost:3000/api`
   - Android Emulator: `http://10.0.2.2:3000/api`
   - Thiết bị thật: `http://<IP_LAN_MÁY_DEV>:3000/api`

   Ghi chú:

   - Port phải khớp `PORT` trong `backend/.env`.
   - Android Emulator không dùng `localhost` để trỏ về máy dev.
   - Khi chạy Expo web, thêm origin web vào `CORS_ORIGIN` của backend (ví dụ `http://localhost:8081`).
   - Không đặt secret vào biến `EXPO_PUBLIC_*` (biến này được nhúng vào bundle).
   - Sau khi đổi `.env`, khởi động lại Expo.
   - Realtime dùng cùng origin với `EXPO_PUBLIC_API_URL`; không cần thêm URL hay port.
     App tự reconnect và refetch REST khi kết nối lại/return foreground.

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

This project uses [Expo Router](https://docs.expo.dev/router/introduction). Keep route files in `src/app`; screens and feature-specific components live in `src/features`.

## Source structure

- `src/app`: Expo Router route entries
- `src/navigation`: root navigator and platform-specific tabs
- `src/features`: screens and components grouped by feature
- `src/shared`: providers, reusable components, hooks, theme, and constants
- `assets`: app images and fonts

Route/page nằm trong `src/app/`, component giao diện nằm trong `src/components/`, và hook ViewModel của từng tính năng nằm trong `src/features/`.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
