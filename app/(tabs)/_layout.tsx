
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
      label: 'Agent',
    },
    // Conditional tab based on authentication
    user ? {
      name: 'client-dashboard',
      route: '/(tabs)/client-dashboard',
      icon: 'dashboard',
      label: 'Mon compte',
    } : {
      name: 'login',
      route: '/(tabs)/login',
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
        <Stack.Screen key="port-details" name="port-details" />
        <Stack.Screen key="pricing" name="pricing" />
        <Stack.Screen key="become-agent" name="become-agent" />
        <Stack.Screen key="contact" name="contact" />
        <Stack.Screen key="login" name="login" />
        <Stack.Screen key="signup" name="signup" />
        <Stack.Screen key="forgot_password" name="forgot_password" />
        <Stack.Screen key="verify-email" name="verify-email" />
        <Stack.Screen key="client-space" name="client-space" />
        <Stack.Screen key="client-dashboard" name="client-dashboard" />
        <Stack.Screen key="dashboard" name="dashboard" />
        <Stack.Screen key="client-profile" name="client-profile" />
        <Stack.Screen key="digital-portal" name="digital-portal" />
        <Stack.Screen key="shipment-detail" name="shipment-detail" />
        <Stack.Screen key="freight-quote" name="freight-quote" />
        <Stack.Screen key="subscription-confirm" name="subscription-confirm" />
        <Stack.Screen key="admin-dashboard" name="admin-dashboard" />
        <Stack.Screen key="admin-quote-details" name="admin-quote-details" />
        <Stack.Screen key="admin-shipment-details" name="admin-shipment-details" />
        <Stack.Screen key="admin-agent-details" name="admin-agent-details" />
        <Stack.Screen key="admin-subscription-details" name="admin-subscription-details" />
        <Stack.Screen key="kpi-dashboard" name="kpi-dashboard" />
        <Stack.Screen key="email-audit" name="email-audit" />
        <Stack.Screen key="profile" name="profile" />
        <Stack.Screen key="test-signup" name="test-signup" />
        <Stack.Screen key="error-screen" name="error-screen" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
