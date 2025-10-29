/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform, useColorScheme } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark  = '#ffffff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    subText: '#6B7280',
    divider: '#E5E7EB',
    outline: '#D1D5DB',
    card: '#FFFFFF',
    buttonBg: '#000000',
    buttonText: '#FFFFFF',
    link: '#0071E2',
    gradient: ['#FFFFFF', '#0071E2'] as [string, string],
    gradientStart: { x: -1, y: 1 },
    gradientEnd: { x: 2, y: 0 },
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    subText: '#9CA3AF',
    divider: '#262626',
    outline: '#374151',
    card: '#121212',
    buttonBg: '#2F97FF',
    buttonText: '#0B1220',
    link: '#2F97FF',
    gradient: ['#2F97FF', '#000000'] as [string, string],
    gradientStart: { x: -1, y: 1 },
    gradientEnd: { x: 1, y: 0 },
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const useColors = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
};