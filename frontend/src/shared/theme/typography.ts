import { FamiljenGrotesk_400Regular } from '@expo-google-fonts/familjen-grotesk/400Regular';
import { FamiljenGrotesk_500Medium } from '@expo-google-fonts/familjen-grotesk/500Medium';
import { FamiljenGrotesk_600SemiBold } from '@expo-google-fonts/familjen-grotesk/600SemiBold';
import { FamiljenGrotesk_700Bold } from '@expo-google-fonts/familjen-grotesk/700Bold';
import type { TextStyle } from 'react-native';

export const fontFamilies = {
  regular: 'FamiljenGrotesk_400Regular',
  medium: 'FamiljenGrotesk_500Medium',
  semibold: 'FamiljenGrotesk_600SemiBold',
  bold: 'FamiljenGrotesk_700Bold',
} as const;

export type FontWeight = keyof typeof fontFamilies;

export const fontAssets = {
  [fontFamilies.regular]: FamiljenGrotesk_400Regular,
  [fontFamilies.medium]: FamiljenGrotesk_500Medium,
  [fontFamilies.semibold]: FamiljenGrotesk_600SemiBold,
  [fontFamilies.bold]: FamiljenGrotesk_700Bold,
};

export const typography = {
  headlineLg: { fontFamily: fontFamilies.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  headline: { fontFamily: fontFamilies.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  title: { fontFamily: fontFamilies.semibold, fontSize: 20, lineHeight: 26, letterSpacing: 0 },
  titleSm: { fontFamily: fontFamilies.semibold, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  label: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  caption: { fontFamily: fontFamilies.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0 },
  bodyLg: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  body: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  bodySm: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 16, letterSpacing: 0 },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
