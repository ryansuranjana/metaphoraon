import TrackPlayer from 'react-native-track-player';
import { usePlayerStore } from '../hooks/usePlayerStore';

export async function playNext() {
  const repeatMode = usePlayerStore.getState().repeatMode;
  const playlist = usePlayerStore.getState().playlist || [];

  try {
    await TrackPlayer.skipToNext();
    await TrackPlayer.play();
  } catch (e) {
    if (repeatMode === 'all' && playlist.length > 0) {
      await TrackPlayer.skip(0);
      await TrackPlayer.play();
    }
  }
}

export async function playPrevious() {
  const repeatMode = usePlayerStore.getState().repeatMode;
  const playlist = usePlayerStore.getState().playlist || [];

  try {
    await TrackPlayer.skipToPrevious();
    await TrackPlayer.play();
  } catch (e) {
    if (repeatMode === 'all' && playlist.length > 0) {
      await TrackPlayer.skip(playlist.length - 1);
      await TrackPlayer.play();
    }
  }
}
