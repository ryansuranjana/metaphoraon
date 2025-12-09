import { useEffect, useState } from 'react';
import TrackPlayer, { State, Event } from 'react-native-track-player';

export function usePlaybackState() {
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    TrackPlayer.getPlaybackState()
      .then((s) => setState(s.state))
      .catch(() => {});

    const sub = TrackPlayer.addEventListener(Event.PlaybackState, (evt) => {
      setState(evt.state);
    });

    return () => {
      sub.remove();
    };
  }, []);

  return state;
}
