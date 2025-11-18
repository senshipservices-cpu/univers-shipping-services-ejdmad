
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomeLayout() {
  const router = useRouter();
  const { isLanguageSelected } = useLanguage();

  useEffect(() => {
    console.log('HomeLayout: isLanguageSelected =', isLanguageSelected);
    if (!isLanguageSelected) {
      console.log('Redirecting to language selection...');
      router.replace('/language-selection');
    }
  }, [isLanguageSelected]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
