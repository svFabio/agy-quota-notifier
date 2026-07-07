import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../core/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function OptionsModal({ visible, onClose, onEdit, onDelete }: OptionsModalProps) {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text weight="bold" style={[styles.title, { color: colors.text }]}>Opciones</Text>
              
              <TouchableOpacity style={[styles.optionBtn, styles.borderBottom, { borderBottomColor: colors.border }]} onPress={onEdit}>
                <Ionicons name="pencil" size={20} color={colors.text} style={styles.optionIcon} />
                <Text weight="semiBold" style={[styles.optionText, { color: colors.text }]}>Editar Aviso</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.optionBtn, styles.borderBottom, { borderBottomColor: colors.border }]} onPress={onDelete}>
                <Ionicons name="trash" size={20} color={colors.error} style={styles.optionIcon} />
                <Text weight="semiBold" style={[styles.optionText, { color: colors.error }]}>Eliminar Aviso</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text weight="bold" style={[styles.cancelText, { color: colors.primary }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 15,
    paddingVertical: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  optionBtn: {
    width: '100%',
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  cancelBtn: {
    marginTop: 15,
  },
  cancelText: {
    fontSize: 16,
  },
});
