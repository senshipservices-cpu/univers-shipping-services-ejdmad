
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors, commonStyles } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";

interface ModuleCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language, setLanguage } = useLanguage();

  const modules: ModuleCard[] = [
    {
      title: t.home.globalServices,
      description: t.home.globalServicesDesc,
      icon: "public",
      route: "/(tabs)/global-services",
      color: colors.primary,
    },
    {
      title: t.home.portCoverage,
      description: t.home.portCoverageDesc,
      icon: "anchor",
      route: "/(tabs)/port-coverage",
      color: colors.secondary,
    },
    {
      title: t.home.becomeAgent,
      description: t.home.becomeAgentDesc,
      icon: "handshake",
      route: "/(tabs)/become-agent",
      color: colors.accent,
    },
    {
      title: t.home.clientSpace,
      description: t.home.clientSpaceDesc,
      icon: "account_circle",
      route: "/(tabs)/client-space",
      color: colors.primary,
    },
    {
      title: t.home.pricing,
      description: t.home.pricingDesc,
      icon: "payments",
      route: "/(tabs)/pricing",
      color: colors.secondary,
    },
  ];

  const languages = [
    { code: 'en' as const, label: 'EN', flag: '🇬🇧' },
    { code: 'fr' as const, label: 'FR', flag: '🇫🇷' },
    { code: 'es' as const, label: 'ES', flag: '🇪🇸' },
    { code: 'ar' as const, label: 'AR', flag: '🇸🇦' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="local_shipping"
              size={60}
              color="#ffffff"
            />
            <Text style={styles.headerTitle}>{t.home.title}</Text>
            <Text style={styles.headerSubtitle}>{t.home.subtitle}</Text>
          </View>
        </LinearGradient>

        <View style={styles.languageSelector}>
          {languages.map((lang, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === lang.code && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.languageText,
                    language === lang.code && styles.languageTextActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.modulesContainer}>
          {modules.map((module, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[styles.moduleCard, { backgroundColor: theme.colors.card }]}
                onPress={() => router.push(module.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: module.color }]}>
                  <IconSymbol
                    ios_icon_name={module.icon}
                    android_material_icon_name={module.icon as any}
                    size={32}
                    color="#ffffff"
                  />
                </View>
                <View style={styles.moduleContent}>
                  <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>
                    {module.title}
                  </Text>
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron_right"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 3S Global - Univers Shipping Services
          </Text>
          <Text style={[styles.footerText, { marginTop: 4 }]}>
            Worldwide Maritime & Logistics Solutions
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 60 : 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.95,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  languageButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  languageFlag: {
    fontSize: 18,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  languageTextActive: {
    color: '#ffffff',
  },
  modulesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
