import * as SQLite from 'expo-sqlite';
import { ENV } from '../config/env';

let db: SQLite.SQLiteDatabase | null = null;

export function getDB(): SQLite.SQLiteDatabase | null {
  return db;
}

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
      browser TEXT,
      model TEXT
    );
  `);
  
  // Intentar agregar la columna por si la tabla ya existía antes de esta actualización
  try {
    await db.execAsync(`ALTER TABLE pending_notifications ADD COLUMN browser TEXT;`);
  } catch (e) {
    // La columna probablemente ya existe
  }
  
  try {
    await db.execAsync(`ALTER TABLE pending_notifications ADD COLUMN model TEXT;`);
  } catch (e) {
    // La columna probablemente ya existe
  }
}
