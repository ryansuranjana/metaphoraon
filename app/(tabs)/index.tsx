import { View, FlatList, Pressable, Alert } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TrackPlayer, { State } from 'react-native-track-player';
import { useFocusEffect } from 'expo-router';
import { getSongs, TSong } from '@/lib/hooks/useSong';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Pause, Play, Repeat } from 'lucide-react-native';
import { usePlaybackState } from '@/lib/hooks/usePlaybackState';
import { useTrackProgress } from '@/lib/hooks/useTrackProgress';
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
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const setRepeatMode = usePlayerStore((state) => state.setRepeatMode);
  const playbackState = usePlaybackState();
  const { track: activeTpTrack, index: activeTpIndex } = useActiveTrack();

  useFocusEffect(
    useCallback(() => {
      getSongs().then((songs) => {
        setSongs(JSON.parse(JSON.stringify(songs)));
      });
    }, [])
  );

  useEffect(() => {
    (async () => {
      try {
        await TrackPlayer.getPlaybackState();
        setPlayerReady(true);
      } catch {
        setTimeout(async () => {
          try {
            await TrackPlayer.getPlaybackState();
            setPlayerReady(true);
          } catch {
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

        const tracks = playableSongs
          .map((song) => {
            const url = song.local_path ?? song.url;
            if (!url) return null;

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
        Alert.alert('Unable to sync queue', JSON.stringify(err));
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

    const matchingSong = playableSongs[activeTpIndex];
    if (matchingSong) {
      setActiveTrackIndex(activeTpIndex);
      setActiveTrack(matchingSong);
    } else {
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

      if (currentIndex === index && currentState.state === State.Playing) {
        await TrackPlayer.pause();
        return;
      }

      await TrackPlayer.skip(index);
      await TrackPlayer.play();
    } catch (err) {
      Alert.alert('Unable to play track', JSON.stringify(err));
    }
  };

  const togglePlayback = async () => {
    if (playbackState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const toggleRepeatMode = async () => {
    if (repeatMode === 'off') {
      await setRepeatMode('one');
    } else if (repeatMode === 'one') {
      await setRepeatMode('all');
    } else {
      await setRepeatMode('off');
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
              accessibilityLabel={
                repeatMode === 'off'
                  ? 'Repeat off'
                  : repeatMode === 'one'
                    ? 'Repeat one'
                    : 'Repeat all'
              }
              onPress={toggleRepeatMode}
              className={`relative rounded-full p-2 ${
                repeatMode !== 'off' ? 'bg-white/20' : 'bg-white/10'
              }`}>
              <Icon
                as={Repeat}
                className={`size-6 ${repeatMode !== 'off' ? 'text-white' : 'text-white/70'}`}
              />
              {repeatMode === 'one' && (
                <View className="absolute -right-0.5 -top-0.5 flex size-3 items-center justify-center rounded-full bg-white">
                  <Text className="text-[8px] font-bold text-black">1</Text>
                </View>
              )}
            </Pressable>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
};

export default HomeScreen;
