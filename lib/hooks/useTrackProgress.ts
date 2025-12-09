import { useEffect, useState } from 'react';
import TrackPlayer, { Event } from 'react-native-track-player';

export function useTrackProgress() {
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const progress = await TrackPlayer.getProgress();
        if (mounted) {
          setPosition(progress.position);
          setDuration(progress.duration || 1);
        }
      } catch (e) {}
    })();

    const sub = TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (evt) => {
      setPosition(evt.position);
      setDuration(evt.duration || 1);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return { position, duration };
}
