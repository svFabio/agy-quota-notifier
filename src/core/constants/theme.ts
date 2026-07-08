import { useColorScheme } from 'react-native';

export const lightColors = {
  primary: '#238636',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#333333',
  textMuted: '#666666',
  border: '#E0E0E0',
  inputBackground: '#FAFAFA',
  error: '#FF3B30',
  // model colors
  gemini: '#238636',
  claude: '#D97757',
  // accent
  accent: '#E8960C',
  
  // utils
  overlay: 'rgba(0,0,0,0.5)',
  shadow: '#000000',
};

export const darkColors = {
  primary: '#2EA043',
  background: '#0D1117',
  surface: '#161B22',
  text: '#C9D1D9',
  textMuted: '#8B949E',
  border: '#30363D',
  inputBackground: '#010409',
  error: '#FF7B72',
  // model colors
  gemini: '#2EA043',
  claude: '#D97757',
  // accent
  accent: '#F5A623',
  
  // utils
  overlay: 'rgba(0,0,0,0.7)',
  shadow: '#000000',
};

// Mantenemos una referencia a los colores por defecto (light) por si alguien importa COLORS directamente,
// aunque se recomienda usar useTheme().
export const COLORS = lightColors;

export const SIZES = {
  // spacing
  base: 8,
  small: 10,
  font: 12,
  medium: 14,
  large: 16,
  extraLarge: 20,

  // padding
  padding: 16,
  screenTop: 36,
  
  // radius
  radius: 8,
  cardRadius: 10,
  modalRadius: 20,

  // typography
  h1: 25,
  h2: 19,
  h3: 17,
  h4: 15,
  body1: 14,
  body2: 13,
  smallText: 11,
};

export const FONTS = {
  regular: 'Montserrat_400Regular',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
};

import { useAppTheme } from '../contexts/ThemeContext';

export function useTheme() {
  const context = useAppTheme();
  // Si context es undefined, fall back a useColorScheme local por seguridad
  if (context && context.colors) {
    return {
      isDark: context.isDark,
      colors: context.colors,
      toggleTheme: context.toggleTheme,
      mode: context.mode,
    };
  }
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
    toggleTheme: () => {},
    mode: 'system' as const,
  };
}
