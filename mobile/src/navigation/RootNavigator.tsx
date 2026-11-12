import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { LoginScreen, RegisterScreen } from '../screens/AuthScreens';
import BookingGridScreen from '../screens/BookingGridScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { OwnerBookingsScreen, OwnerVenuesScreen } from '../screens/OwnerScreens';
import PaymentScreen from '../screens/PaymentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VenueDetailScreen from '../screens/VenueDetailScreen';
import VenueFormScreen from '../screens/VenueFormScreen';
import VenueListScreen from '../screens/VenueListScreen';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function PlayerTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#0E9F6E' }}>
      <Tab.Screen name="Home" component={VenueListScreen} options={{ title: 'Tìm sân' }} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'Lịch đặt' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Thông báo' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}
function OwnerTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#0E9F6E' }}>
      <Tab.Screen name="OwnerBookings" component={OwnerBookingsScreen} options={{ title: 'Duyệt lịch' }} />
      <Tab.Screen name="OwnerVenues" component={OwnerVenuesScreen} options={{ title: 'Sân của tôi' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Thông báo' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, ready } = useAuthStore();
  if (!ready) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  return (
    <Stack.Navigator>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Tabs" component={user.role === 'OWNER' ? OwnerTabs : PlayerTabs} options={{ headerShown: false }} />
          <Stack.Screen name="VenueDetail" component={VenueDetailScreen} options={{ title: 'Chi tiết sân' }} />
          <Stack.Screen name="BookingGrid" component={BookingGridScreen} options={{ title: 'Chọn giờ' }} />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Thanh toán' }} />
          <Stack.Screen name="VenueForm" component={VenueFormScreen} options={({ route }) => ({ title: route.params?.venueId ? 'Sửa cơ sở' : 'Thêm cơ sở' })} />
        </>
      )}
    </Stack.Navigator>
  );
}
