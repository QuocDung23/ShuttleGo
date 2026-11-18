const { colors } = require('./src/shared/theme/tokens.json');

const tailwindColors = Object.fromEntries(
  Object.entries(colors).map(([name, value]) => [
    name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
    value,
  ]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: tailwindColors,
      fontFamily: {
        familjen: ['FamiljenGrotesk_400Regular'],
        'familjen-medium': ['FamiljenGrotesk_500Medium'],
        'familjen-semibold': ['FamiljenGrotesk_600SemiBold'],
        'familjen-bold': ['FamiljenGrotesk_700Bold'],
      },
      fontSize: {
        'headline-lg': ['28px', { lineHeight: '34px', letterSpacing: '-0.5px' }],
        headline: ['24px', { lineHeight: '30px', letterSpacing: '-0.3px' }],
        title: ['20px', { lineHeight: '26px' }],
        'title-sm': ['16px', { lineHeight: '22px' }],
        label: ['14px', { lineHeight: '20px' }],
        caption: ['12px', { lineHeight: '16px' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        body: ['14px', { lineHeight: '20px' }],
        'body-sm': ['12px', { lineHeight: '16px' }],
      },
    },
  },
  plugins: [],
};
