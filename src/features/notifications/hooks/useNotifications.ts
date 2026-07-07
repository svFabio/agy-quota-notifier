import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { 
  initDatabase, 
  getPendingNotifications, 
  addNotification, 
  removeNotification,
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
  const [browser, setBrowser] = useState('');
  const [pendingList, setPendingList] = useState<NotificationRecord[]>([]);
  const [isReady, setIsReady] = useState(false);
  
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as 'error' | 'success' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const showAlert = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };
  const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const handleDelete = async (id: string) => {
    if (Platform.OS !== 'web') {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    await removeNotification(id);
    setPendingList(prev => prev.filter(n => n.id !== id));
  };

  const handleEditInit = (item: NotificationRecord) => {
    setAccountName(item.name);
    const diff = new Date(item.dateScheduled).getTime() - Date.now();
    if (diff > 0 && !isNaN(diff)) {
      const remainingHours = (diff / 3600000).toFixed(2);
      setHours(remainingHours.replace('.', ',')); // Mostrar en formato amigable
    } else {
      setHours('');
    }
    setBrowser(item.browser || '');
    setEditingId(item.id);
    setIsFormVisible(true);
  };

  const openForm = () => {
    setEditingId(null);
    setAccountName('');
    setHours('');
    setBrowser('');
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setEditingId(null);
    setAccountName('');
    setHours('');
    setBrowser('');
  };

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
      showAlert('Campos vacíos', 'Por favor ingresa el correo y las horas restantes.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountName.trim())) {
      showAlert('Correo inválido', 'El nombre de la cuenta debe ser un correo electrónico válido (ej. cuenta@gmail.com).');
      return;
    }

    const parsedHours = parseFloat(hours.replace(',', '.'));
    
    if (isNaN(parsedHours) || parsedHours <= 0) {
      showAlert('Valor inválido', 'Por favor ingresa un número de horas válido mayor a 0.');
      return;
    }

    const seconds = Math.floor(parsedHours * 3600);

    try {
      if (editingId) {
        await handleDelete(editingId); // Cancelar la alarma vieja antes de crear la nueva
        setEditingId(null);
      }

      // 1. Programar la notificación a nivel sistema operativo
      const identifier = await scheduleLocalNotification(accountName, seconds);

      // 2. Calcular la hora exacta en la que sonará y guardar en ISO
      const targetDate = new Date(Date.now() + seconds * 1000).toISOString();

      const newNotification: NotificationRecord = {
        id: identifier,
        name: accountName.trim(),
        hours: parsedHours,
        dateScheduled: targetDate, // Ahora guardamos el tiempo de destino real
        browser: browser.trim(),
      };

      // 3. Guardar en SQLite
      await addNotification(newNotification);

      // 4. Actualizar la UI
      setPendingList((prev) => [...prev, newNotification]);
      closeForm(); // Cerrar el modal flotante
      showAlert('¡Éxito!', `Aviso programado para la cuenta "${accountName}" en ${parsedHours} horas.`, 'success');
      
    } catch (error) {
      showAlert('Error', 'No se pudo programar la notificación.');
    }
  };

  return {
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
    isEditing: !!editingId,
    alertConfig,
    hideAlert,
    isReady,
    isFormVisible,
    openForm,
    closeForm
  };
}
