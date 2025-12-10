import { useEffect, useState } from 'react';
import TrackPlayer, { Event, Track } from 'react-native-track-player';

/**
 * Minimal active track hook mirroring the reference music-player repo.
 */
export function useActiveTrack() {
  const [track, setTrack] = useState<Track | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const currentIndex = await TrackPlayer.getActiveTrackIndex();
        const queue = await TrackPlayer.getQueue();
        if (!mounted) return;
        setIndex(currentIndex ?? null);
        setTrack(queue[currentIndex ?? -1] ?? null);
      } catch {
        // player not ready yet
      }
    })();

    const sub = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (evt) => {
      if (!mounted) return;
      setIndex(evt.index ?? null);
      const queue = await TrackPlayer.getQueue();
      setTrack(evt.index != null ? (queue[evt.index] ?? null) : null);
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return { track, index };
}
