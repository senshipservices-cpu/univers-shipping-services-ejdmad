
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/i18n/translations';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { language, setLanguage } = useLanguage();

  const languageOptions = [
    { code: 'fr' as Language, flag: '🇫🇷', name: 'Français' },
    { code: 'en' as Language, flag: '🇬🇧', name: 'English' },
    { code: 'es' as Language, flag: '🇪🇸', name: 'Español' },
    { code: 'ar' as Language, flag: '🇸🇦', name: 'العربية' },
  ];

  const handleLanguageChange = async (lang: Language) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await setLanguage(lang);
      console.log('Language changed to:', lang);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="globe"
              android_material_icon_name="language"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Language / Langue / Idioma / اللغة
            </Text>
          </View>

          <View style={styles.languageList}>
            {languageOptions.map((option, index) => (
              <React.Fragment key={option.code}>
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    { backgroundColor: theme.colors.card },
                    language === option.code && styles.languageItemSelected,
                  ]}
                  onPress={() => handleLanguageChange(option.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageItemLeft}>
                    <Text style={styles.languageFlag}>{option.flag}</Text>
                    <Text style={[styles.languageName, { color: theme.colors.text }]}>
                      {option.name}
                    </Text>
                  </View>
                  {language === option.code && (
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check_circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="info.circle"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              About
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.appName, { color: theme.colors.text }]}>
              3S Global
            </Text>
            <Text style={styles.appSubtitle}>
              Univers Shipping Services
            </Text>
            <Text style={styles.appVersion}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/(tabs)/(home)/')}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="house.fill"
              android_material_icon_name="home"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              Go to Home
            </Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 60 : 80,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  languageList: {
    gap: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageItemSelected: {
    borderColor: colors.primary,
    boxShadow: '0px 4px 12px rgba(3, 169, 244, 0.2)',
    elevation: 4,
  },
  languageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  languageFlag: {
    fontSize: 32,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
