import { View, FlatList, Pressable } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TrackPlayer, { State } from 'react-native-track-player';
import { useFocusEffect } from 'expo-router';
import { getSongs, removeSong, TSong } from '@/lib/hooks/useSong';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Pause, Play, SkipForward } from 'lucide-react-native';
import { setupPlayer } from '@/lib/player/setupPlayer';
import { usePlaybackState } from '@/lib/hooks/usePlaybackState';
import { useTrackProgress } from '@/lib/hooks/useTrackProgress';
import { playNext } from '@/lib/player/playerControls';
import { usePlayerStore } from '@/lib/hooks/usePlayerStore';
import { useActiveTrack } from '@/lib/hooks/useActiveTrack';

const HomeScreen = () => {
  const [songs, setSongs] = useState<TSong[]>([]);
  const [playerReady, setPlayerReady] = useState(false);

  const { position, duration } = useTrackProgress();
  const playlist = usePlayerStore((state) => state.playlist);
  const setPlaylist = usePlayerStore((state) => state.setPlaylist);
  const activeTrack = usePlayerStore((state) => state.activeTrack);
  const setActiveTrack = usePlayerStore((state) => state.setActiveTrack);
  const setActiveTrackIndex = usePlayerStore((state) => state.setActiveTrackIndex);
  const playbackState = usePlaybackState();
  const { track: activeTpTrack, index: activeTpIndex } = useActiveTrack();

  useFocusEffect(
    useCallback(() => {
      getSongs().then((songs) => {
        console.log('songs', songs);
        setSongs(JSON.parse(JSON.stringify(songs)));
      });
    }, [])
  );

  useEffect(() => {
    // Check if player is ready by trying to get state
    (async () => {
      try {
        await TrackPlayer.getPlaybackState();
        setPlayerReady(true);
      } catch {
        // Player not ready yet, wait a bit and try again
        setTimeout(async () => {
          try {
            await TrackPlayer.getPlaybackState();
            setPlayerReady(true);
          } catch {
            // Still not ready, but continue anyway
            setPlayerReady(true);
          }
        }, 500);
      }
    })();
  }, []);

  const playableSongs = useMemo(
    () => songs.filter((song) => !!song.local_path || !!song.url),
    [songs]
  );

  useEffect(() => {
    if (!playerReady) return;
    (async () => {
      try {
        setPlaylist(playableSongs);

        if (playableSongs.length === 0) {
          await TrackPlayer.reset();
          setActiveTrack(null);
          setActiveTrackIndex(null);
          return;
        }

        // Build valid tracks with proper URLs
        const tracks = playableSongs
          .map((song) => {
            const url = song.local_path ?? song.url;
            if (!url) return null;

            // Ensure file:// protocol for local paths
            const trackUrl =
              song.local_path && !song.local_path.startsWith('file://')
                ? `file://${song.local_path}`
                : url;

            return {
              id: song.id,
              url: trackUrl,
              title: song.title,
              artist: 'Unknown Artist',
              duration: song.duration || 0,
              artwork: song.thumbnail ?? undefined,
            };
          })
          .filter((track): track is NonNullable<typeof track> => track !== null);

        if (tracks.length === 0) return;

        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);
      } catch (err) {
        console.warn('Unable to sync queue', err);
      }
    })();
  }, [playerReady, playableSongs, setPlaylist, setActiveTrack, setActiveTrackIndex]);

  useEffect(() => {
    if (!playerReady) return;

    if (activeTpIndex == null || activeTpIndex < 0 || !activeTpTrack) {
      setActiveTrack(null);
      setActiveTrackIndex(null);
      return;
    }

    // Find matching song from playableSongs
    const matchingSong = playableSongs[activeTpIndex];
    if (matchingSong) {
      setActiveTrackIndex(activeTpIndex);
      setActiveTrack(matchingSong);
    } else {
      // Fallback to track data from TrackPlayer
      setActiveTrackIndex(activeTpIndex);
      setActiveTrack({
        id: activeTpTrack.id as string,
        title: (activeTpTrack.title as string) ?? '',
        url: (activeTpTrack.url as string) ?? null,
        local_path: null,
        duration: activeTpTrack.duration ?? 0,
        thumbnail: (activeTpTrack as any).artwork ?? null,
        created_at: 0,
      });
    }
  }, [
    activeTpIndex,
    activeTpTrack,
    playerReady,
    playableSongs,
    setActiveTrack,
    setActiveTrackIndex,
  ]);

  const handlePlayPress = async (item: TSong, index: number) => {
    if (!playerReady || playableSongs.length === 0) return;
    try {
      const currentState = await TrackPlayer.getPlaybackState();
      const currentIndex = await TrackPlayer.getActiveTrackIndex();

      // If clicking the same track that's playing, just toggle play/pause
      if (currentIndex === index && currentState.state === State.Playing) {
        await TrackPlayer.pause();
        return;
      }

      // Otherwise, skip to the track and play
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
    } catch (err) {
      console.warn('Unable to play track', err);
    }
  };

  const togglePlayback = async () => {
    if (playbackState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const progressPercent = duration ? Math.min((position / duration) * 100, 100) : 0;
  const isPlaying = playbackState === State.Playing;

  return (
    <View className="flex-1 bg-black p-4 pb-24">
      <FlatList
        data={playableSongs}
        initialNumToRender={50}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-grow flex-row gap-3">
              <View className="size-14 rounded-sm bg-white/20" />
              <View className="flex-col justify-between">
                <Text className="text-sm font-bold">{item.title}</Text>
                <Text className="text-xs text-white/70">{item.duration} s</Text>
              </View>
            </View>
            <Pressable
              accessibilityLabel="Play song"
              onPress={() => handlePlayPress(item, index)}
              className="rounded-full bg-white/10 p-2">
              <Icon as={Play} className="size-6 text-white" />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-sm text-white/70">Belum ada lagu tersimpan</Text>
        }
      />

      {activeTrack ? (
        <Pressable className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <View className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <View
              className="h-full bg-white"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </View>
          <View className="flex-row items-center gap-3">
            <View className="size-12 rounded bg-white/20" />
            <View className="flex-1">
              <Text className="text-sm font-semibold" numberOfLines={1}>
                {activeTrack.title}
              </Text>
              <Text className="text-xs text-white/70" numberOfLines={1}>
                Sedang diputar
              </Text>
            </View>
            <Pressable
              accessibilityLabel={isPlaying ? 'Pause track' : 'Play track'}
              onPress={togglePlayback}
              className="rounded-full bg-white/10 p-2">
              <Icon as={isPlaying ? Pause : Play} className="size-6 text-white" />
            </Pressable>
            <Pressable
              accessibilityLabel="Next track"
              onPress={playNext}
              className="rounded-full bg-white/10 p-2">
              <Icon as={SkipForward} className="size-6 text-white" />
            </Pressable>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
};

export default HomeScreen;
