import Constants from 'expo-constants';
/** Địa chỉ backend. Khi chạy Expo Go trên điện thoại thật, đổi thành IP LAN của máy chạy backend trong app.json -> extra.apiUrl */
export const API_URL: string = (Constants.expoConfig?.extra as any)?.apiUrl ?? 'http://localhost:4000/api';
