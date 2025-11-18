
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <NativeTabs>
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf="house.fill" />
        <Label>Accueil</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="global-services" name="global-services">
        <Icon sf="briefcase.fill" />
        <Label>Services</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="port-coverage" name="port-coverage">
        <Icon sf="anchor.fill" />
        <Label>Ports</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="pricing" name="pricing">
        <Icon sf="dollarsign.circle.fill" />
        <Label>Pricing</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="become-agent" name="become-agent">
        <Icon sf="person.badge.plus.fill" />
        <Label>Devenir agent</Label>
      </NativeTabs.Trigger>
      {user ? (
        <NativeTabs.Trigger key="client-dashboard" name="client-dashboard">
          <Icon sf="square.grid.2x2.fill" />
          <Label>Mon espace</Label>
        </NativeTabs.Trigger>
      ) : (
        <NativeTabs.Trigger key="client-space" name="client-space">
          <Icon sf="person.circle.fill" />
          <Label>Connexion</Label>
        </NativeTabs.Trigger>
      )}
    </NativeTabs>
  );
}
