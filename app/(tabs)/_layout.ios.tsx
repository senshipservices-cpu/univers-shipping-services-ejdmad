
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
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
        <Label>Agent</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="client-space" name="client-space">
        <Icon sf="person.circle.fill" />
        <Label>Client</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
