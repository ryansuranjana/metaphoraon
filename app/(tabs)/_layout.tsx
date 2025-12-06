import { View, Text } from 'react-native';
import React from 'react';
import { Stack, Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { Home } from 'lucide-react-native';

const TabLayout = () => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Icon as={Home} color={color} size={size} />,
          }}
        />
      </Tabs>
    </>
  );
};

export default TabLayout;
