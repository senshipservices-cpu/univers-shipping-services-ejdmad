
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, translations, Translations } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: Translations;
  isLanguageSelected: boolean;
  setIsLanguageSelected: (selected: boolean) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@3s_global_language';
const LANGUAGE_SELECTED_KEY = '@3s_global_language_selected';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLanguageSelected, setIsLanguageSelectedState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      const languageSelected = await AsyncStorage.getItem(LANGUAGE_SELECTED_KEY);
      
      console.log('Loaded language preference:', savedLanguage);
      console.log('Language selected:', languageSelected);
      
      if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en' || savedLanguage === 'es' || savedLanguage === 'ar')) {
        setLanguageState(savedLanguage as Language);
      }
      
      if (languageSelected === 'true') {
        setIsLanguageSelectedState(true);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      console.log('Setting language to:', lang);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const setIsLanguageSelected = async (selected: boolean) => {
    try {
      console.log('Setting language selected to:', selected);
      await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, selected.toString());
      setIsLanguageSelectedState(selected);
    } catch (error) {
      console.error('Error saving language selected state:', error);
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    isLanguageSelected,
    setIsLanguageSelected,
  };

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
