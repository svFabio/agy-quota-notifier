import * as SQLite from 'expo-sqlite';
import { ENV } from '../config/env';

export type NotificationRecord = {
  id: string; // ID devuelto por expo-notifications
  name: string;
  hours: number;
  dateScheduled: string;
};

let db: SQLite.SQLiteDatabase | null = null;

// Inicializamos y creamos la tabla si no existe
export async function initDatabase() {
  db = await SQLite.openDatabaseAsync(ENV.DB_NAME);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS pending_notifications (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      hours REAL NOT NULL,
      dateScheduled TEXT NOT NULL
    );
  `);
}

// Obtener todas las notificaciones pendientes
export async function getPendingNotifications(): Promise<NotificationRecord[]> {
  if (!db) return [];
  const allRows = await db.getAllAsync<NotificationRecord>('SELECT * FROM pending_notifications');
  return allRows;
}

// Insertar una nueva notificación
export async function addNotification(notification: NotificationRecord) {
  if (!db) return;
  await db.runAsync(
    'INSERT INTO pending_notifications (id, name, hours, dateScheduled) VALUES (?, ?, ?, ?)',
    [notification.id, notification.name, notification.hours, notification.dateScheduled]
  );
}

// Borrar una notificación (por si el usuario quiere cancelarla más adelante)
export async function removeNotification(id: string) {
  if (!db) return;
  await db.runAsync('DELETE FROM pending_notifications WHERE id = ?', [id]);
}
