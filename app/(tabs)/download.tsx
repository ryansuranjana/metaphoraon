import { View, Text, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { RAPID_API_HOST, RAPID_API_KEY, RAPID_API_URL } from '@/lib/constants';
import { useSaveMP3 } from '@/lib/hooks/useSaveMP3';
import { addSong } from '@/lib/hooks/useSong';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DownloadScreen = () => {
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [nameSong, setNameSong] = useState('');
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
          title: nameSong ? nameSong : res?.metadata?.title,
          url: playUrl,
          local_path: music.uri || null,
          duration: res?.metadata?.additionalData?.music?.duration,
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
  return (
    <View className="p-4">
      <View className="mb-3">
        <Label className="mb-2">Song Name</Label>
        <Input value={nameSong} onChangeText={setNameSong} placeholder="Enter song name" />
      </View>
      <View className="mb-3">
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

export default DownloadScreen;
