import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { getSongs } from '@/lib/hooks/useSong';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const HomeScreen = () => {
  useEffect(() => {
    getSongs().then((songs) => {
      console.log('Fetched songs:', songs);
    });
  }, []);

  return (
    <View className="p-4">
      <View className="mb-2">
        <Label className="mb-2">Link Tiktok URL</Label>
        <Input />
      </View>
      <Button>
        <Text>Download</Text>
      </Button>
    </View>
  );
};

export default HomeScreen;
