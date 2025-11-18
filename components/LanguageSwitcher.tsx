
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors } from '@/styles/commonStyles';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'fr' | 'en';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const theme = useTheme();
  const { user, client } = useAuth();

  const handleLanguageChange = async (newLanguage: Language) => {
    console.log('Changing language to:', newLanguage);
    
    // Update global language state
    await setLanguage(newLanguage);
    
    // Store in local storage
    await AsyncStorage.setItem('lang', newLanguage);
    
    // If user is logged in, update their preferred language in the database
    if (user && client) {
      try {
        const { error } = await supabase
          .from('clients')
          .update({ preferred_language: newLanguage })
          .eq('id', client.id);
        
        if (error) {
          console.error('Error updating preferred language:', error);
        } else {
          console.log('Preferred language updated successfully');
        }
      } catch (error) {
        console.error('Exception updating preferred language:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.languageButton,
          language === 'fr' && styles.activeButton,
          { 
            backgroundColor: language === 'fr' ? colors.primary : theme.colors.card,
            borderColor: language === 'fr' ? colors.primary : colors.border,
          }
        ]}
        onPress={() => handleLanguageChange('fr')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.languageText,
            { color: language === 'fr' ? '#ffffff' : theme.colors.text }
          ]}
        >
          FR
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.languageButton,
          language === 'en' && styles.activeButton,
          { 
            backgroundColor: language === 'en' ? colors.primary : theme.colors.card,
            borderColor: language === 'en' ? colors.primary : colors.border,
          }
        ]}
        onPress={() => handleLanguageChange('en')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.languageText,
            { color: language === 'en' ? '#ffffff' : theme.colors.text }
          ]}
        >
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
