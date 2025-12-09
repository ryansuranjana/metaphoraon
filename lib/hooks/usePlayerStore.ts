import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import TrackPlayer, { RepeatMode } from 'react-native-track-player';
import { TSong } from './useSong';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TrackItem = TSong;

interface PlayerState {
  repeatMode: 'off' | 'one' | 'all';
  setRepeatMode: (mode: 'off' | 'one' | 'all') => Promise<void>;

  playlist: TrackItem[];
  setPlaylist: (list: TrackItem[]) => void;

  activeTrackIndex: number | null;
  activeTrack: TrackItem | null;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      repeatMode: 'off',
      setRepeatMode: async (mode) => {
        set({ repeatMode: mode });
        if (mode === 'one') await TrackPlayer.setRepeatMode(RepeatMode.Track);
        else if (mode === 'all') await TrackPlayer.setRepeatMode(RepeatMode.Queue);
        else await TrackPlayer.setRepeatMode(RepeatMode.Off);
      },

      playlist: [],
      setPlaylist: (list) => {
        set({ playlist: list });
      },
      activeTrackIndex: null,
      activeTrack: null,
    }),
    {
      name: 'player-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
