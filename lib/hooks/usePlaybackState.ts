import { State, usePlaybackState as useTPPlaybackState } from 'react-native-track-player';

/**
 * Thin wrapper around TrackPlayer's built-in hook (as in the reference repo).
 */
export function usePlaybackState(): State | null {
  const state = useTPPlaybackState() as State | { state?: State } | null;
  if (state && typeof state === 'object' && 'state' in state) {
    return (state as { state?: State }).state ?? null;
  }
  return (state as State) ?? null;
}
