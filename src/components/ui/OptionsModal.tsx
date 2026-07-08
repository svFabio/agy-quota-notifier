import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text } from './Text';
import { useTheme, SIZES } from '../../core/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ICON_SIZE = 20;

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
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
              <Text weight="bold" style={[styles.title, { color: colors.text }]}>Opciones</Text>
              
              <TouchableOpacity style={[styles.optionBtn, styles.borderBottom, { borderBottomColor: colors.border }]} onPress={onEdit}>
                <Ionicons name="pencil" size={ICON_SIZE} color={colors.text} style={styles.optionIcon} />
                <Text weight="semiBold" style={[styles.optionText, { color: colors.text }]}>Editar Aviso</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.optionBtn, styles.borderBottom, { borderBottomColor: colors.border }]} onPress={onDelete}>
                <Ionicons name="trash" size={ICON_SIZE} color={colors.error} style={styles.optionIcon} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: SIZES.medium,
    paddingVertical: SIZES.large,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: SIZES.base,
    elevation: 5,
  },
  title: {
    fontSize: SIZES.h3,
    marginBottom: SIZES.large,
  },
  optionBtn: {
    width: '100%',
    paddingVertical: SIZES.h4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: SIZES.base,
  },
  optionText: {
    fontSize: SIZES.body1,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  cancelBtn: {
    marginTop: SIZES.medium,
  },
  cancelText: {
    fontSize: SIZES.body1,
  },
});
