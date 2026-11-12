import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tabs: undefined;
  VenueDetail: { venueId: string };
  BookingGrid: { venueId: string; venueName: string };
  Payment: { bookingId: string };
  VenueForm: { venueId?: string };
};
export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
