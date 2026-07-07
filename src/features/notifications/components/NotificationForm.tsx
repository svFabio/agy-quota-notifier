import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../core/constants/theme';
import { Text } from '../../../components/ui/Text';

interface NotificationFormProps {
  accountName: string;
  setAccountName: (val: string) => void;
  hours: string;
  setHours: (val: string) => void;
  onSubmit: () => void;
}

export function NotificationForm({
  accountName,
  setAccountName,
  hours,
  setHours,
  onSubmit
}: NotificationFormProps) {
  return (
    <View style={styles.form}>
      <Text weight="semiBold" style={styles.label}>Nombre de la Cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Cuenta 3"
        value={accountName}
        onChangeText={setAccountName}
      />

      <Text weight="semiBold" style={styles.label}>Horas restantes</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 1.5"
        value={hours}
        onChangeText={setHours}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text weight="bold" style={styles.buttonText}>Programar Aviso</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: COLORS.inputBackground,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 16,
  },
});
