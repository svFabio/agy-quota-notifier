import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../core/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success';
  onClose: () => void;
}

export function AlertModal({ visible, title, message, type = 'error', onClose }: AlertModalProps) {
  const { colors } = useTheme();

  if (!visible) return null;
  
  const iconName = type === 'error' ? 'warning' : 'checkmark-circle';
  const iconColor = type === 'error' ? colors.error : colors.primary;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]}>
      <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName} size={32} color={iconColor} />
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

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999999, // Superponer sobre cualquier otro modal
    elevation: 999999,
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 999999,
    zIndex: 999999, // Asegurar que el contenido también esté por encima
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});
