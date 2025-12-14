import { Directory, File, Paths } from 'expo-file-system';
import { customAlphabet } from 'nanoid/non-secure';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

export const useSaveMP3 = async (url: string) => {
  const destination = new Directory(Paths.cache, 'songs');

  try {
    if (!destination.exists) {
      destination.create();
    }

    const randomFileName = `${nanoid()}.mp3`;
    const filePath = new File(destination, randomFileName);

    const output = await File.downloadFileAsync(url, filePath);

    return output;
  } catch (err) {
    console.error('Error saving MP3:', err);
    throw err;
  }
};
