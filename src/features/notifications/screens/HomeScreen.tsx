import React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationForm } from '../components/NotificationForm';
import { PendingList } from '../components/PendingList';
import { COLORS } from '../../../core/constants/theme';
import { Text } from '../../../components/ui/Text';

export function HomeScreen() {
  const {
    accountName,
    setAccountName,
    hours,
    setHours,
    pendingList,
    handleSchedule,
    isReady
  } = useNotifications();

  if (!isReady) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text }}>Cargando datos guardados...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text weight="bold" style={styles.header}>Notificador de Tokens</Text>

      <NotificationForm 
        accountName={accountName}
        setAccountName={setAccountName}
        hours={hours}
        setHours={setHours}
        onSubmit={handleSchedule}
      />

      <PendingList notifications={pendingList} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
});
