import { Directory, File, Paths } from 'expo-file-system';

export const useSaveMP3 = async (url: string) => {
  const destination = new Directory(Paths.cache, 'songs');
  try {
    if (!destination.exists) {
      destination.create();
    }

    const output = await File.downloadFileAsync(url, destination);

    return output;
  } catch (err) {
    console.error('Error saving MP3:', err);
    throw err;
  }
};
