
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();

  // Define tabs based on authentication status
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
      label: 'Devenir agent',
    },
    // Conditional tab based on authentication
    user ? {
      name: 'client-dashboard',
      route: '/(tabs)/client-dashboard',
      icon: 'dashboard',
      label: 'Mon espace',
    } : {
      name: 'client-space',
      route: '/(tabs)/client-space',
      icon: 'person',
      label: 'Connexion',
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
        <Stack.Screen key="client-dashboard" name="client-dashboard" />
        <Stack.Screen key="digital-portal" name="digital-portal" />
        <Stack.Screen key="shipment-detail" name="shipment-detail" />
        <Stack.Screen key="client-profile" name="client-profile" />
        <Stack.Screen key="profile" name="profile" />
        <Stack.Screen key="test-signup" name="test-signup" />
        <Stack.Screen key="admin-dashboard" name="admin-dashboard" />
        <Stack.Screen key="freight-quote" name="freight-quote" />
        <Stack.Screen key="contact" name="contact" />
        <Stack.Screen key="subscription-confirm" name="subscription-confirm" />
      </Stack>
      <FloatingTabBar tabs={tabs} containerWidth={420} />
    </>
  );
}
