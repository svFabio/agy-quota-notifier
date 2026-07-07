import React from 'react';
import { StyleSheet, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationForm } from '../components/NotificationForm';
import { PendingList } from '../components/PendingList';
import { useTheme } from '../../../core/constants/theme';
import { Text } from '../../../components/ui/Text';
import { AlertModal } from '../../../components/ui/AlertModal';
import { FAB } from '../../../components/ui/FAB';
import { Ionicons } from '@expo/vector-icons';

export function HomeScreen() {
  const {
    accountName,
    setAccountName,
    hours,
    setHours,
    browser,
    setBrowser,
    pendingList,
    handleSchedule,
    handleDelete,
    handleEditInit,
    isEditing,
    alertConfig,
    hideAlert,
    isReady,
    isFormVisible,
    openForm,
    closeForm
  } = useNotifications();
  const { colors, toggleTheme, mode } = useTheme();

  if (!isReady) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text }}>Cargando datos guardados...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Text weight="bold" style={[styles.header, { color: colors.text }]}>Notificador de Tokens</Text>
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Ionicons 
            name={mode === 'dark' ? 'sunny' : mode === 'light' ? 'moon' : 'settings'} 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>

      <NotificationForm 
        visible={isFormVisible}
        onClose={closeForm}
        accountName={accountName}
        setAccountName={setAccountName}
        hours={hours}
        setHours={setHours}
        browser={browser}
        setBrowser={setBrowser}
        isEditing={isEditing}
        onSubmit={handleSchedule}
        alertConfig={alertConfig}
        hideAlert={hideAlert}
      />

      <PendingList 
        notifications={pendingList} 
        onEdit={handleEditInit}
        onDelete={handleDelete}
      />

      {/* Solo mostrar alerta global si el formulario está cerrado */}
      {!isFormVisible && (
        <AlertModal 
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={hideAlert}
        />
      )}

      <FAB onPress={openForm} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
  },
  themeToggle: {
    position: 'absolute',
    right: 0,
    padding: 5,
  },
});
