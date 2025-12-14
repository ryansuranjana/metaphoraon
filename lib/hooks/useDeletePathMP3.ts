import { File } from 'expo-file-system';

export const useDeletePathMP3 = async (url: string) => {
  const file = new File(url);
  file.delete();
};
