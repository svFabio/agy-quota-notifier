import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme, SIZES } from '../../core/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success';
  onClose: () => void;
}

const ICON_SIZE = 32;
const ICON_CIRCLE_SIZE = 60;

export function AlertModal({ visible, title, message, type = 'error', onClose }: AlertModalProps) {
  const { colors } = useTheme();

  if (!visible) return null;
  
  const iconName = type === 'error' ? 'warning' : 'checkmark-circle';
  const iconColor = type === 'error' ? colors.error : colors.primary;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: colors.overlay }]}>
      <View style={[styles.modalContent, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName} size={ICON_SIZE} color={iconColor} />
        </View>
        <Text weight="bold" style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: iconColor }]} onPress={onClose}>
          <Text weight="bold" style={[styles.buttonText, { color: colors.surface }]}>Entendido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large,
    zIndex: 999999,
    elevation: 999999,
  },
  modalContent: {
    width: '85%',
    borderRadius: SIZES.large,
    padding: SIZES.padding,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: SIZES.large,
    elevation: 999999,
    zIndex: 999999,
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  title: {
    fontSize: SIZES.h3,
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  message: {
    fontSize: SIZES.body1,
    textAlign: 'center',
    marginBottom: SIZES.large,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    paddingVertical: SIZES.body2,
    borderRadius: SIZES.cardRadius,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: SIZES.body1,
  },
});
