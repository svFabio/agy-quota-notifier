import React from 'react';
import { Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../core/constants/theme';
import { Text } from '../../../components/ui/Text';
import { AlertModal } from '../../../components/ui/AlertModal';

interface NotificationFormProps {
  visible: boolean;
  onClose: () => void;
  accountName: string;
  setAccountName: (val: string) => void;
  hours: string;
  setHours: (val: string) => void;
  browser: string;
  setBrowser: (val: string) => void;
  isEditing: boolean;
  onSubmit: () => void;
  alertConfig: { visible: boolean; title: string; message: string; type: 'error' | 'success' };
  hideAlert: () => void;
}

export function NotificationForm({
  visible,
  onClose,
  accountName,
  setAccountName,
  hours,
  setHours,
  browser,
  setBrowser,
  isEditing,
  onSubmit,
  alertConfig,
  hideAlert
}: NotificationFormProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Capa invisible de fondo para cerrar teclado al tocar afuera */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardContainer}>
          <View style={[styles.form, { backgroundColor: colors.surface }]}>
            
            <View style={styles.header}>
              <Text weight="bold" style={[styles.title, { color: colors.text }]}>{isEditing ? 'Editar Aviso' : 'Nuevo Aviso'}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text weight="bold" style={[styles.closeText, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text weight="semiBold" style={[styles.label, { color: colors.textMuted }]}>Nombre de la Cuenta</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border,
                backgroundColor: colors.inputBackground,
                color: colors.text
              }]}
              placeholder="Ej. cuenta@gmail.com"
              value={accountName}
              onChangeText={setAccountName}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textMuted}
            />

            <Text weight="semiBold" style={[styles.label, { color: colors.textMuted }]}>Horas restantes</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border,
                backgroundColor: colors.inputBackground,
                color: colors.text
              }]}
              placeholder="Ej. 1.5"
              value={hours}
              onChangeText={setHours}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />

            <Text weight="semiBold" style={[styles.label, { color: colors.textMuted }]}>Navegador (Opcional)</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border,
                backgroundColor: colors.inputBackground,
                color: colors.text
              }]}
              placeholder="Ej. Chrome, Firefox..."
              value={browser}
              onChangeText={setBrowser}
              autoCapitalize="words"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onSubmit}>
              <Text weight="bold" style={[styles.buttonText, { color: colors.surface }]}>
                {isEditing ? 'Guardar Cambios' : 'Programar Aviso'}
              </Text>
            </TouchableOpacity>
            
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Alerta insertada DENTRO del Modal nativo para asegurar que siempre esté encima */}
      <AlertModal 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
  },
  form: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
  },
  closeBtn: {
    padding: 5,
  },
  closeText: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
  },
});
