import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { COLORS } from '../../core/constants/theme';

export interface TextProps extends RNTextProps {
  weight?: 'regular' | 'semiBold' | 'bold';
}

export function Text({ style, weight = 'regular', ...props }: TextProps) {
  let fontFamily = 'Montserrat_400Regular';
  
  if (weight === 'bold') fontFamily = 'Montserrat_700Bold';
  if (weight === 'semiBold') fontFamily = 'Montserrat_600SemiBold';

  return (
    <RNText 
      style={[{ fontFamily, color: COLORS.text }, style]} 
      {...props} 
    />
  );
}
