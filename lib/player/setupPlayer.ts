import TrackPlayer, {
  Capability,
  IOSCategory,
  IOSCategoryMode,
  IOSCategoryOptions,
} from 'react-native-track-player';

export async function setupPlayer() {
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
    compactCapabilities: [Capability.Play, Capability.Pause],
  });
}
