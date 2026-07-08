import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, SIZES, FONTS } from '../../core/constants/theme';
import { Text } from './Text';

const FAB_SIZE = 60;

export function FAB({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={onPress}>
      <Text style={[styles.text, { color: colors.surface, fontFamily: FONTS.bold }]}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: SIZES.h1,
    right: SIZES.large,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 100,
  },
  text: {
    fontSize: SIZES.h1,
  },
});
