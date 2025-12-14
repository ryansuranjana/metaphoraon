import { View, Text } from 'react-native';
import React from 'react';
import { Stack, Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { DownloadCloud, Music } from 'lucide-react-native';

const TabLayout = () => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Metaphoraon',
            tabBarIcon: ({ color, size }) => <Icon as={Music} color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="download"
          options={{
            title: 'Download',
            tabBarIcon: ({ color, size }) => <Icon as={DownloadCloud} color={color} size={size} />,
          }}
        />
      </Tabs>
    </>
  );
};

export default TabLayout;
