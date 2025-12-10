import { useProgress } from 'react-native-track-player';

/**
 * Use TrackPlayer's built-in progress hook (matches reference repo approach).
 */
export function useTrackProgress() {
  const { position, duration } = useProgress(250);
  return { position, duration: duration || 1 };
}
