
import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { StripeProvider } from '@/contexts/StripeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
