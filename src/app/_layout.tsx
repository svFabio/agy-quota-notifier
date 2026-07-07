import { DarkTheme, DefaultTheme, ThemeProvider, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { 
  useFonts, 
  Montserrat_400Regular, 
  Montserrat_600SemiBold, 
  Montserrat_700Bold 
} from '@expo-google-fonts/montserrat';

import { ThemeProviderWrapper } from '@/core/contexts/ThemeContext';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProviderWrapper>
      <AnimatedSplashOverlay />
      <Slot />
    </ThemeProviderWrapper>
  );
}
