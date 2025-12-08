import { View, FlatList, Pressable } from 'react-native';
import React, { useCallback, useState } from 'react';
import { getSongs, TSong } from '@/lib/hooks/useSong';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Play } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';

const HomeScreen = () => {
  const [songs, setSongs] = useState<TSong[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSongs().then((songs) => {
        setSongs(JSON.parse(JSON.stringify(songs)));
      });
    }, [])
  );

  return (
    <View className="p-4">
      <FlatList
        data={songs}
        initialNumToRender={50}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-grow flex-row gap-3">
              <View className="size-14 rounded-sm bg-white"></View>
              <View className="flex-col justify-between">
                <Text className="text-sm font-bold">{item.title}</Text>
                <Text className="text-xs">{item.duration} s</Text>
              </View>
            </View>
            <View className="w-fit">
              <Pressable>
                <Icon as={Play} className="size-6 text-white" />
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default HomeScreen;
