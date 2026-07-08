import React from 'react';
import { StyleSheet, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationForm } from '../components/NotificationForm';
import { PendingList } from '../components/PendingList';
import { useTheme, SIZES } from '../../../core/constants/theme';
import { Text, AlertModal, FAB } from '../../../components/ui';
import { Ionicons } from '@expo/vector-icons';

export function HomeScreen() {
  const {
    accountName,
    setAccountName,
    hours,
    setHours,
    browser,
    setBrowser,
    model,
    setModel,
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
  const { colors, toggleTheme, isDark } = useTheme();

  if (!isReady) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: SIZES.base, color: colors.text }}>Cargando datos guardados...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Text weight="bold" style={[styles.header, { color: colors.text }]}>Notificador de Tokens</Text>
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Ionicons 
            name={isDark ? 'sunny' : 'moon'} 
            size={SIZES.h2} 
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
        model={model}
        setModel={setModel}
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
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.screenTop,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.extraLarge,
  },
  header: {
    fontSize: SIZES.h2,
    flex: 1,
  },
  themeToggle: {
    padding: SIZES.base,
    marginLeft: SIZES.base,
  },
});
