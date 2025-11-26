
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
  
  // Prevent multiple initializations with a ref guard
  const hasInitialized = useRef(false);
  const isInitializing = useRef(false);

  // Memoize initialization function to prevent recreation
  const initializeApp = useCallback(async () => {
    // Guard: Prevent concurrent initializations
    if (hasInitialized.current || isInitializing.current) {
      console.log('[ROOT_LAYOUT] Skipping duplicate initialization');
      return;
    }
    
    try {
      isInitializing.current = true;
      hasInitialized.current = true;

      // Setup error logging (platform-agnostic)
      setupErrorLogging();
      
      // Log app startup
      console.log('='.repeat(50));
      console.log('[ROOT_LAYOUT] Universal Shipping Services - Starting');
      console.log(`[ROOT_LAYOUT] Environment: ${appConfig.appEnv}`);
      console.log(`[ROOT_LAYOUT] Platform: ${Platform.OS}`);
      console.log(`[ROOT_LAYOUT] Mode: ${appConfig.isProduction ? 'Production' : 'Development'}`);
      console.log('='.repeat(50));

      // Validate configuration
      const validation = appConfig.validateConfig();
      if (!validation.valid) {
        console.error('[ROOT_LAYOUT] Configuration validation failed:');
        validation.errors.forEach(error => {
          console.error(`  - ${error}`);
        });
      }
      
      if (validation.warnings.length > 0) {
        console.warn('[ROOT_LAYOUT] Configuration warnings:');
        validation.warnings.forEach(warning => {
          console.warn(`  - ${warning}`);
        });
      }

      // Verify all services (async, non-blocking)
      // Run in background without blocking render
      verifyAllServices().catch(error => {
        console.error('[ROOT_LAYOUT] Service verification failed:', error);
      });
    } catch (error) {
      console.error('[ROOT_LAYOUT] Error in initialization:', error);
    } finally {
      isInitializing.current = false;
    }
  }, []); // Empty deps - only create once

  useEffect(() => {
    // Only run initialization once
    if (!hasInitialized.current && !isInitializing.current) {
      initializeApp();
    }
  }, [initializeApp]);

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
