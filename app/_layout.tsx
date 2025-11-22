
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { StripeProvider } from '@/contexts/StripeContext';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import EnvironmentSetupGuide from '@/components/EnvironmentSetupGuide';

export default function RootLayout() {
  const [configError, setConfigError] = useState<string | null>(null);
  const [missingVariables, setMissingVariables] = useState<string[]>([]);

  useEffect(() => {
    // Validate configuration on startup
    const validation = appConfig.validateConfig();
    
    if (!validation.valid) {
      console.error('Configuration validation failed:', validation.errors);
      setConfigError(validation.errors.join('\n'));
      
      // Extract missing variable names
      const missing: string[] = [];
      if (!appConfig.env.SUPABASE_URL) {
        missing.push('EXPO_PUBLIC_SUPABASE_URL');
      }
      if (!appConfig.env.SUPABASE_ANON_KEY) {
        missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
      }
      setMissingVariables(missing);
    } else if (validation.warnings.length > 0) {
      console.warn('Configuration warnings:', validation.warnings);
    }
  }, []);

  // If configuration is invalid, show setup guide
  if (configError && missingVariables.length > 0) {
    return <EnvironmentSetupGuide missingVariables={missingVariables} />;
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <AdminProvider>
          <StripeProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="modal" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="transparent-modal" 
                options={{ 
                  presentation: 'transparentModal',
                  headerShown: false,
                  animation: 'fade',
                }} 
              />
              <Stack.Screen 
                name="formsheet" 
                options={{ 
                  presentation: 'formSheet',
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="language-selection" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                }} 
              />
            </Stack>
          </StripeProvider>
        </AdminProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
});
