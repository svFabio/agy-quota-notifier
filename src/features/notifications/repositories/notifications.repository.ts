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
  // C-06: Throw instead of silently returning [] — callers must wait for
  // initDatabase() to complete before querying.
  if (!db) throw new Error('[Repository] DB not initialized — call initDatabase() first.');
  const allRows = await db.getAllAsync<NotificationRecord>('SELECT * FROM pending_notifications');
  return allRows;
}

export async function addNotification(notification: NotificationRecord) {
  const db = getDB();
  // C-06: Throw instead of silently no-oping — a silent no-op here means the
  // notification is scheduled in the OS but never persisted, lost on restart.
  if (!db) throw new Error('[Repository] DB not initialized — call initDatabase() first.');
  await db.runAsync(
    'INSERT INTO pending_notifications (id, name, hours, dateScheduled, browser, model) VALUES (?, ?, ?, ?, ?, ?)',
    [notification.id, notification.name, notification.hours, notification.dateScheduled, notification.browser || '', notification.model || '']
  );
}

// Borrar una notificación (por si el usuario quiere cancelarla más adelante)
export async function removeNotification(id: string) {
  const db = getDB();
  // C-06: Throw so the caller knows removal failed — silent no-op would
  // leave a stale item in the UI with no DB record to match.
  if (!db) throw new Error('[Repository] DB not initialized — call initDatabase() first.');
  await db.runAsync('DELETE FROM pending_notifications WHERE id = ?', [id]);
}
