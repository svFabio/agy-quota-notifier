import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { 
  initDatabase, 
  getPendingNotifications, 
  addNotification, 
  NotificationRecord 
} from '../../../core/database/database';
import { 
  setupNotifications, 
  registerForPushNotificationsAsync, 
  scheduleLocalNotification 
} from '../../../services/notifications.service';

export function useNotifications() {
  const [accountName, setAccountName] = useState('');
  const [hours, setHours] = useState('');
  const [pendingList, setPendingList] = useState<NotificationRecord[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Inicializar todo cuando la app carga
  useEffect(() => {
    async function bootstrap() {
      setupNotifications();
      await registerForPushNotificationsAsync();
      
      // Inicializar SQLite y cargar datos guardados
      await initDatabase();
      const savedNotifications = await getPendingNotifications();
      setPendingList(savedNotifications);
      setIsReady(true);
    }
    
    bootstrap();
  }, []);

  const handleSchedule = async () => {
    if (!accountName.trim() || !hours.trim()) {
      Alert.alert('Campos vacíos', 'Por favor ingresa el correo y las horas restantes.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountName.trim())) {
      Alert.alert('Correo inválido', 'El nombre de la cuenta debe ser un correo electrónico válido (ej. cuenta@gmail.com).');
      return;
    }

    const parsedHours = parseFloat(hours.replace(',', '.'));
    
    if (isNaN(parsedHours) || parsedHours <= 0) {
      Alert.alert('Valor inválido', 'Por favor ingresa un número de horas válido mayor a 0.');
      return;
    }

    const seconds = Math.floor(parsedHours * 3600);

    try {
      // 1. Programar la notificación a nivel sistema operativo
      const identifier = await scheduleLocalNotification(accountName, seconds);

      // 2. Calcular la hora exacta en la que sonará y guardar en ISO
      const targetDate = new Date(Date.now() + seconds * 1000).toISOString();

      const newNotification: NotificationRecord = {
        id: identifier,
        name: accountName.trim(),
        hours: parsedHours,
        dateScheduled: targetDate, // Ahora guardamos el tiempo de destino real
      };

      // 3. Guardar en SQLite
      await addNotification(newNotification);

      // 4. Actualizar la UI
      setPendingList((prev) => [...prev, newNotification]);
      setAccountName('');
      setHours('');
      Alert.alert('Éxito', `Aviso programado para la cuenta "${accountName}" en ${parsedHours} horas.`);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo programar la notificación.');
    }
  };

  return {
    accountName,
    setAccountName,
    hours,
    setHours,
    pendingList,
    handleSchedule,
    isReady
  };
}
