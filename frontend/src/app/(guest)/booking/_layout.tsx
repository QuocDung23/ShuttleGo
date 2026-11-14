import { Stack } from "expo-router";

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="confirm"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.72, 1],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen name="payment" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
