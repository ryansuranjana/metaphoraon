import TrackPlayer, { State, Event } from 'react-native-track-player';
import { usePlayerStore } from '../hooks/usePlayerStore';

module.exports = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => TrackPlayer.seekTo(position));

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (evt) => {
    const state = usePlayerStore.getState();
    const repeatMode = state.repeatMode;
    const playlist = state.playlist || [];

    if (repeatMode === 'one') {
      await TrackPlayer.seekTo(0);
      await TrackPlayer.play();
      return;
    }

    if (repeatMode === 'all') {
      if (playlist.length > 0) {
        await TrackPlayer.skip(0);
        await TrackPlayer.play();
      }
      return;
    }
  });
};
