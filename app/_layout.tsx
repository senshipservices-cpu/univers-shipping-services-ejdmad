
import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme, Platform } from 'react-native';
import { useEffect, useRef, useCallback } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { StripeProvider } from '@/contexts/StripeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import appConfig from '@/config/appConfig';
import { verifyAllServices } from '@/config/configVerification';
import { setupErrorLogging } from '@/utils/errorLogger';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Prevent multiple initializations
  const hasInitialized = useRef(false);

  // Memoize initialization function to prevent recreation
  const initializeApp = useCallback(async () => {
    // Guard: Only initialize once
    if (hasInitialized.current) {
      return;
    }
    
    hasInitialized.current = true;

    try {
      // Setup error logging (platform-agnostic)
      setupErrorLogging();
      
      // Log app startup
      appConfig.logger.essential('='.repeat(50));
      appConfig.logger.essential('Universal Shipping Services - Starting');
      appConfig.logger.essential(`Environment: ${appConfig.appEnv}`);
      appConfig.logger.essential(`Platform: ${Platform.OS}`);
      appConfig.logger.essential(`Mode: ${appConfig.isProduction ? 'Production' : 'Development'}`);
      appConfig.logger.essential('='.repeat(50));

      // Validate configuration
      const validation = appConfig.validateConfig();
      if (!validation.valid) {
        appConfig.logger.error('Configuration validation failed:');
        validation.errors.forEach(error => {
          appConfig.logger.error(`  - ${error}`);
        });
      }
      
      if (validation.warnings.length > 0) {
        appConfig.logger.warn('Configuration warnings:');
        validation.warnings.forEach(warning => {
          appConfig.logger.warn(`  - ${warning}`);
        });
      }

      // Verify all services (async, non-blocking)
      // Run in background without blocking render
      verifyAllServices().catch(error => {
        appConfig.logger.error('Service verification failed:', error);
      });
    } catch (error) {
      console.error('Error in RootLayout initialization:', error);
    }
  }, []); // Empty deps - only create once

  useEffect(() => {
    initializeApp();
  }, [initializeApp]); // Only depends on memoized function

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <LanguageProvider>
          <AuthProvider>
            <AdminProvider>
              <StripeProvider>
                <WidgetProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="language-selection" />
                    <Stack.Screen 
                      name="modal" 
                      options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom',
                      }}
                    />
                    <Stack.Screen 
                      name="transparent-modal" 
                      options={{
                        presentation: 'transparentModal',
                        animation: 'fade',
                      }}
                    />
                    <Stack.Screen 
                      name="formsheet" 
                      options={{
                        presentation: 'formSheet',
                        animation: 'slide_from_bottom',
                      }}
                    />
                  </Stack>
                </WidgetProvider>
              </StripeProvider>
            </AdminProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
