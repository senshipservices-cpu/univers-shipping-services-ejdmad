
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Accueil',
    },
    {
      name: 'global-services',
      route: '/(tabs)/global-services',
      icon: 'business',
      label: 'Services',
    },
    {
      name: 'port-coverage',
      route: '/(tabs)/port-coverage',
      icon: 'anchor',
      label: 'Ports',
    },
    {
      name: 'pricing',
      route: '/(tabs)/pricing',
      icon: 'payments',
      label: 'Pricing',
    },
    {
      name: 'become-agent',
      route: '/(tabs)/become-agent',
      icon: 'handshake',
      label: 'Agent',
    },
    {
      name: 'client-space',
      route: '/(tabs)/client-space',
      icon: 'person',
      label: 'Client',
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
        <Stack.Screen key="global-services" name="global-services" />
        <Stack.Screen key="port-coverage" name="port-coverage" />
        <Stack.Screen key="pricing" name="pricing" />
        <Stack.Screen key="become-agent" name="become-agent" />
        <Stack.Screen key="client-space" name="client-space" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} containerWidth={420} />
    </>
  );
}
