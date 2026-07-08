import React from 'react';
import { Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme, SIZES, FONTS } from '../../../core/constants/theme';
import { Text, AlertModal } from '../../../components/ui';

interface NotificationFormProps {
  visible: boolean;
  onClose: () => void;
  accountName: string;
  setAccountName: (val: string) => void;
  hours: string;
  setHours: (val: string) => void;
  browser: string;
  setBrowser: (val: string) => void;
  model: 'Gemini' | 'Claude' | '';
  setModel: (val: 'Gemini' | 'Claude' | '') => void;
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
  model,
  setModel,
  isEditing,
  onSubmit,
  alertConfig,
  hideAlert
}: NotificationFormProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        {/* Capa invisible de fondo para cerrar teclado al tocar afuera */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView behavior="padding" style={styles.keyboardContainer}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
            <View style={[styles.form, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
              
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

              <Text weight="semiBold" style={[styles.label, { color: colors.textMuted }]}>Modelo IA (Opcional)</Text>
              <View style={styles.modelContainer}>
                <TouchableOpacity 
                  style={[
                    styles.modelBtn, 
                    { borderColor: colors.border, backgroundColor: model === 'Gemini' ? colors.gemini + '20' : colors.inputBackground },
                    model === 'Gemini' && { borderColor: colors.gemini }
                  ]} 
                  onPress={() => setModel(model === 'Gemini' ? '' : 'Gemini')}
                >
                  <Text weight={model === 'Gemini' ? 'bold' : 'regular'} style={{ color: model === 'Gemini' ? colors.gemini : colors.text }}>Gemini</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.modelBtn, 
                    { borderColor: colors.border, backgroundColor: model === 'Claude' ? colors.claude + '20' : colors.inputBackground },
                    model === 'Claude' && { borderColor: colors.claude }
                  ]} 
                  onPress={() => setModel(model === 'Claude' ? '' : 'Claude')}
                >
                  <Text weight={model === 'Claude' ? 'bold' : 'regular'} style={{ color: model === 'Claude' ? colors.claude : colors.text }}>Claude</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onSubmit}>
                <Text weight="bold" style={[styles.buttonText, { color: colors.surface }]}>
                  {isEditing ? 'Guardar Cambios' : 'Programar Aviso'}
                </Text>
              </TouchableOpacity>
              
            </View>
          </ScrollView>
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
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
  },
  form: {
    padding: SIZES.padding,
    borderTopLeftRadius: SIZES.modalRadius,
    borderTopRightRadius: SIZES.modalRadius,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  title: {
    fontSize: SIZES.h3,
  },
  closeBtn: {
    padding: SIZES.base / 2,
  },
  closeText: {
    fontSize: SIZES.h3,
  },
  label: {
    fontSize: SIZES.body2,
    marginBottom: SIZES.base,
  },
  input: {
    borderWidth: 1,
    padding: SIZES.small,
    fontSize: SIZES.body1,
    fontFamily: FONTS.regular,
    marginBottom: SIZES.medium,
    borderRadius: SIZES.radius,
  },
  modelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.large,
    gap: SIZES.small,
  },
  modelBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.cardRadius,
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  buttonText: {
    fontSize: SIZES.body1,
  },
});
