import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseAsync('metaphoraon.db');

export async function initDB() {
  const database = await db;

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT,
      url TEXT,
      local_path TEXT,
      duration INTEGER,
      thumbnail TEXT,
      created_at INTEGER
    );
  `);

  return database;
}
