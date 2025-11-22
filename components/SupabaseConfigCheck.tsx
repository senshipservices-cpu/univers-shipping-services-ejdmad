
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { isSupabaseConfigured } from '@/app/integrations/supabase/client';
import EnvironmentSetupGuide from './EnvironmentSetupGuide';

interface SupabaseConfigCheckProps {
  children: React.ReactNode;
}

/**
 * SupabaseConfigCheck Component
 * Wraps the app and shows setup guide if Supabase is not configured
 */
export default function SupabaseConfigCheck({ children }: SupabaseConfigCheckProps) {
  if (!isSupabaseConfigured) {
    return (
      <View style={styles.container}>
        <EnvironmentSetupGuide />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
