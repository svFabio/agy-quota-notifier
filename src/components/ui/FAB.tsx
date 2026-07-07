import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../core/constants/theme';
import { Text } from './Text';

export function FAB({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={onPress}>
      <Text style={[styles.text, { color: colors.surface }]}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 100,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
