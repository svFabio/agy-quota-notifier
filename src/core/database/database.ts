import * as SQLite from 'expo-sqlite';
import { ENV } from '../config/env';

export type NotificationRecord = {
  id: string; // ID devuelto por expo-notifications
  name: string;
  hours: number;
  dateScheduled: string;
  browser?: string;
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
      dateScheduled TEXT NOT NULL,
      browser TEXT
    );
  `);
  
  // Intentar agregar la columna por si la tabla ya existía antes de esta actualización
  try {
    await db.execAsync(`ALTER TABLE pending_notifications ADD COLUMN browser TEXT;`);
  } catch (e) {
    // La columna probablemente ya existe
  }
}

// Obtener todas las notificaciones pendientes
export async function getPendingNotifications(): Promise<NotificationRecord[]> {
  if (!db) return [];
  const allRows = await db.getAllAsync<NotificationRecord>('SELECT * FROM pending_notifications');
  return allRows;
}

export async function addNotification(notification: NotificationRecord) {
  if (!db) return;
  await db.runAsync(
    'INSERT INTO pending_notifications (id, name, hours, dateScheduled, browser) VALUES (?, ?, ?, ?, ?)',
    [notification.id, notification.name, notification.hours, notification.dateScheduled, notification.browser || '']
  );
}

// Borrar una notificación (por si el usuario quiere cancelarla más adelante)
export async function removeNotification(id: string) {
  if (!db) return;
  await db.runAsync('DELETE FROM pending_notifications WHERE id = ?', [id]);
}
