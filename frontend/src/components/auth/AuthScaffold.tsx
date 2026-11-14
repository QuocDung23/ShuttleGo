import { SymbolView } from "expo-symbols";
import type { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OwnerText, ownerColors } from "@/components/ui/owner-ui";

export function AuthScaffold({
  children,
  footer,
}: PropsWithChildren<{ footer?: ReactNode }>) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="w-full max-w-[480px] grow self-center px-6 pb-6 pt-3"
        >
          {children}
          {footer ? <View className="mt-auto pt-8">{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthBackHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View className="mb-10 h-12 flex-row items-center">
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        className="-ml-3 h-12 w-12 items-center justify-center"
      >
        <SymbolView
          name={{
            ios: "chevron.left",
            android: "arrow_back",
            web: "arrow_back",
          }}
          size={22}
          tintColor={ownerColors.ink}
        />
      </Pressable>
      <OwnerText className="font-familjen-semibold text-title-sm">
        {title}
      </OwnerText>
    </View>
  );
}

export function AuthTitle({
  title,
  description,
}: {
  title: string;
  description?: ReactNode;
}) {
  return (
    <View className="gap-3">
      <OwnerText className="font-familjen-bold text-headline-lg">
        {title}
      </OwnerText>
      {description ? (
        <OwnerText tone="muted" className="text-body-lg">
          {description}
        </OwnerText>
      ) : null}
    </View>
  );
}
