import TrackPlayer, {
  Capability,
  IOSCategory,
  IOSCategoryMode,
  IOSCategoryOptions,
} from 'react-native-track-player';

/**
 * One-time TrackPlayer bootstrap similar to the reference music-player repo.
 * Safe to call multiple times; subsequent calls no-op when player is already ready.
 */
export async function setupPlayer() {
  try {
    await TrackPlayer.setupPlayer({
      iosCategory: IOSCategory.Playback,
      iosCategoryMode: IOSCategoryMode.Default,
      iosCategoryOptions: [
        IOSCategoryOptions.AllowAirPlay,
        IOSCategoryOptions.AllowBluetooth,
        IOSCategoryOptions.AllowBluetoothA2DP,
      ],
    });

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      progressUpdateEventInterval: 1,
    });
  } catch (error: any) {
    // If player already initialized, that's fine - just return
    if (error?.message?.includes('already been initialized')) {
      return;
    }
    // Re-throw other errors
    throw error;
  }
}
