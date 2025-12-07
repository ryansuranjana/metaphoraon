import { View, Text, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { addSong, getSongs, removeSong } from '@/lib/hooks/useSong';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RAPID_API_HOST, RAPID_API_KEY, RAPID_API_URL } from '@/lib/constants';
import { useSaveMP3 } from '@/lib/hooks/useSaveMP3';

const HomeScreen = () => {
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isLoadingDownload, setIsLoadingDownload] = useState(false);

  const handleDownload = async () => {
    setIsLoadingDownload(true);
    try {
      const req = await fetch(`${RAPID_API_URL}${tiktokUrl}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPID_API_HOST,
          'x-rapidapi-key': RAPID_API_KEY,
        },
      });
      const res = await req.json();
      const playUrl = res?.metadata?.additionalData?.music?.playUrl as string;
      if (playUrl) {
        const music = await useSaveMP3(playUrl);
        console.log('Music saved at:', music);

        const resultSong = await addSong({
          title: 'Sample Title',
          url: playUrl,
          local_path: music.uri || null,
          duration: 26,
          thumbnail: null,
          created_at: Date.now(),
        });

        console.log('Song added to DB:', resultSong);
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsLoadingDownload(false);
    }
  };

  useEffect(() => {
    getSongs().then((songs) => {
      console.log('Fetched songs:', songs);
    });
  }, []);

  return (
    <View className="p-4">
      <View className="mb-2">
        <Label className="mb-2">Link Tiktok URL</Label>
        <Input value={tiktokUrl} onChangeText={setTiktokUrl} />
      </View>
      <Button onPress={handleDownload}>
        {isLoadingDownload ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Text>Download</Text>
        )}
      </Button>
    </View>
  );
};

export default HomeScreen;
