import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme, FONTS } from '../../core/constants/theme';

export interface TextProps extends RNTextProps {
  weight?: 'regular' | 'semiBold' | 'bold';
}

const FONT_MAP: Record<string, string> = {
  regular: FONTS.regular,
  semiBold: FONTS.semiBold,
  bold: FONTS.bold,
};

export function Text({ style, weight = 'regular', ...props }: TextProps) {
  const fontFamily = FONT_MAP[weight] || FONTS.regular;
  const { colors } = useTheme();

  return (
    <RNText 
      style={[{ fontFamily, color: colors.text }, style]} 
      {...props} 
    />
  );
}
