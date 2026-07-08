import { getDB } from '../../../core/database/database';

export type NotificationRecord = {
  id: string; // ID devuelto por expo-notifications
  name: string;
  hours: number;
  dateScheduled: string;
  browser?: string;
  model?: string;
};

// Obtener todas las notificaciones pendientes
export async function getPendingNotifications(): Promise<NotificationRecord[]> {
  const db = getDB();
  if (!db) return [];
  const allRows = await db.getAllAsync<NotificationRecord>('SELECT * FROM pending_notifications');
  return allRows;
}

export async function addNotification(notification: NotificationRecord) {
  const db = getDB();
  if (!db) return;
  await db.runAsync(
    'INSERT INTO pending_notifications (id, name, hours, dateScheduled, browser, model) VALUES (?, ?, ?, ?, ?, ?)',
    [notification.id, notification.name, notification.hours, notification.dateScheduled, notification.browser || '', notification.model || '']
  );
}

// Borrar una notificación (por si el usuario quiere cancelarla más adelante)
export async function removeNotification(id: string) {
  const db = getDB();
  if (!db) return;
  await db.runAsync('DELETE FROM pending_notifications WHERE id = ?', [id]);
}
