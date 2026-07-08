import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { ENV } from '../../../core/config/env';
import { COLORS } from '../../../core/constants/theme';

// Configuración global de cómo se muestran las notificaciones cuando la app está abierta
export function setupNotifications() {
  if (Platform.OS === 'web') return; // Bypass en web
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// Permisos y configuración de canales (Android)
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    console.log('Las notificaciones Push no están soportadas en la web. Se usarán avisos simulados.');
    return false;
  }

  let finalStatus;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ENV.CHANNEL_ID, {
      name: ENV.CHANNEL_NAME,
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: COLORS.primary,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Error', 'Se requieren permisos para enviar notificaciones.');
      return false;
    }
    return true;
  } else {
    console.log('Debes usar un dispositivo físico para las notificaciones Push reales');
    return false;
  }
}

// Función pura para programar una notificación
export async function scheduleLocalNotification(accountName: string, seconds: number) {
  if (Platform.OS === 'web') {
    // En web, devolvemos un ID simulado para que la app no explote 
    // y el usuario igual pueda ver su aviso guardado en SQLite.
    console.log(`[SIMULADOR WEB] Aviso programado para "${accountName}" en ${seconds} segundos.`);
    return `simulated-id-${Date.now()}`;
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: ENV.NOTIFICATION_TITLE,
        body: `Los tokens de tu cuenta "${accountName}" ya deben estar disponibles.`,
      },
      trigger: { 
        type: SchedulableTriggerInputTypes.TIME_INTERVAL, 
        seconds: seconds, 
        repeats: false 
      },
    });
    return identifier;
  } catch (error) {
    console.error(error);
    throw new Error('No se pudo programar la notificación.');
  }
}
