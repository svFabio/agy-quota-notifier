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
};

// Mantenemos una referencia a los colores por defecto (light) por si alguien importa COLORS directamente,
// aunque se recomienda usar useTheme().
export const COLORS = lightColors;

export const SIZES = {
  padding: 20,
  radius: 8,
  cardRadius: 10,
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
