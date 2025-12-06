import { db } from '../database';

export const getSongs = async () => {
  const database = await db;
  const songs = await database.getAllAsync('SELECT * FROM songs ORDER BY created_at DESC;');
  return songs;
};

export const addSong = async (song: any) => {
  const database = await db;
  const res = await database.runAsync(
    `
        INSERT INTO songs (id, title, url, local_path, duration, thumbnail, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [song.id, song.title, song.url, song.local_path, song.duration, song.thumbnail, song.created_at]
  );
  return res;
};

export const removeSong = async (id: string) => {
  const database = await db;
  const res = await database.runAsync(
    `
          DELETE FROM songs WHERE id = ?;
      `,
    [id]
  );
  return res;
};
