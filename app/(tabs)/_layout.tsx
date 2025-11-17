
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="profile" name="profile" />
        <Stack.Screen key="global-services" name="global-services" />
        <Stack.Screen key="port-coverage" name="port-coverage" />
        <Stack.Screen key="become-agent" name="become-agent" />
        <Stack.Screen key="client-space" name="client-space" />
        <Stack.Screen key="pricing" name="pricing" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
