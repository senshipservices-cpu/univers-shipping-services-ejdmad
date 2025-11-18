
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language, translations } from '@/i18n/translations';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

interface LanguageOption {
  code: Language;
  flag: string;
  nativeName: string;
}

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { language, setLanguage, setIsLanguageSelected } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  const languageOptions: LanguageOption[] = [
    { code: 'fr', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'en', flag: '🇬🇧', nativeName: 'English' },
    { code: 'es', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'ar', flag: '🇸🇦', nativeName: 'العربية' },
  ];

  const handleLanguageSelect = async (lang: Language) => {
    console.log('Language selected:', lang);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedLanguage(lang);
    await setLanguage(lang);
    await setIsLanguageSelected(true);
    // Navigate to the main home screen immediately after selecting a language
    router.replace('/(tabs)/(home)/');
  };

  const currentTranslations = translations[selectedLanguage];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <IconSymbol
          ios_icon_name="globe"
          android_material_icon_name="language"
          size={80}
          color="#ffffff"
        />
        <Text style={styles.title}>{currentTranslations.languageSelection.title}</Text>
        <Text style={styles.subtitle}>{currentTranslations.languageSelection.subtitle}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {currentTranslations.languageSelection.selectLanguage}
        </Text>

        <View style={styles.languageGrid}>
          {languageOptions.map((option, index) => (
            <React.Fragment key={option.code}>
              <TouchableOpacity
                style={[
                  styles.languageCard,
                  { backgroundColor: theme.colors.card },
                  selectedLanguage === option.code && styles.languageCardSelected,
                ]}
                onPress={() => handleLanguageSelect(option.code)}
                activeOpacity={0.7}
              >
                {selectedLanguage === option.code && (
                  <View style={styles.checkmarkContainer}>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check_circle"
                      size={28}
                      color={colors.primary}
                    />
                  </View>
                )}
                <Text style={styles.flag}>{option.flag}</Text>
                <Text style={[styles.languageName, { color: theme.colors.text }]}>
                  {option.nativeName}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.instructionContainer}>
          <IconSymbol
            ios_icon_name="hand.tap.fill"
            android_material_icon_name="touch_app"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.instructionText, { color: theme.colors.text }]}>
            {currentTranslations.languageSelection.tapToSelect || 'Tap a language to continue'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 80 : 100,
    paddingBottom: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 24,
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#ffffff',
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 40,
  },
  languageCard: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 4,
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
  },
  languageCardSelected: {
    borderColor: colors.primary,
    boxShadow: '0px 6px 16px rgba(3, 169, 244, 0.3)',
    elevation: 8,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  flag: {
    fontSize: 56,
    marginBottom: 12,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.highlight,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
