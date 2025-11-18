
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";

interface ServiceCard {
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface RegionBadge {
  name: string;
  icon: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();

  const serviceCategories: ServiceCard[] = [
    {
      title: t.home.maritimeShipping,
      description: t.home.maritimeShippingDesc,
      icon: "directions_boat",
      color: colors.primary,
    },
    {
      title: t.home.logisticsPortHandling,
      description: t.home.logisticsPortHandlingDesc,
      icon: "local_shipping",
      color: colors.secondary,
    },
    {
      title: t.home.tradeConsulting,
      description: t.home.tradeConsultingDesc,
      icon: "business_center",
      color: colors.accent,
    },
    {
      title: t.home.digitalSolutions,
      description: t.home.digitalSolutionsDesc,
      icon: "computer",
      color: colors.primary,
    },
  ];

  const regions: RegionBadge[] = [
    { name: t.regions.africa, icon: "public" },
    { name: t.regions.europe, icon: "public" },
    { name: t.regions.asia, icon: "public" },
    { name: t.regions.americas, icon: "public" },
    { name: t.regions.middleEast, icon: "public" },
    { name: t.regions.oceania, icon: "public" },
  ];

  const whyUsPoints = [
    { text: t.home.whyUs1, icon: "verified" },
    { text: t.home.whyUs2, icon: "language" },
    { text: t.home.whyUs3, icon: "settings" },
    { text: t.home.whyUs4, icon: "support_agent" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="local_shipping"
              size={70}
              color="#ffffff"
            />
            <Text style={styles.heroTitle}>{t.home.heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{t.home.heroSubtitle}</Text>
            <Text style={styles.heroDescription}>{t.home.heroDescription}</Text>
            
            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={[styles.heroButton, styles.heroButtonPrimary]}
                onPress={() => router.push("/(tabs)/global-services")}
                activeOpacity={0.8}
              >
                <Text style={styles.heroButtonTextPrimary}>{t.home.discoverServices}</Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow_forward"
                  size={20}
                  color="#ffffff"
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.heroButton, styles.heroButtonSecondary]}
                onPress={() => router.push("/(tabs)/global-services")}
                activeOpacity={0.8}
              >
                <Text style={styles.heroButtonTextSecondary}>{t.home.requestQuote}</Text>
                <IconSymbol
                  ios_icon_name="doc.text"
                  android_material_icon_name="description"
                  size={20}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.home.servicesTitle}
          </Text>
          <Text style={styles.sectionSubtitle}>{t.home.servicesSubtitle}</Text>
          
          <View style={styles.servicesGrid}>
            {serviceCategories.map((service, index) => (
              <React.Fragment key={index}>
                <View style={[styles.serviceCard, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.serviceIconContainer, { backgroundColor: service.color }]}>
                    <IconSymbol
                      ios_icon_name={service.icon}
                      android_material_icon_name={service.icon as any}
                      size={36}
                      color="#ffffff"
                    />
                  </View>
                  <Text style={[styles.serviceTitle, { color: theme.colors.text }]}>
                    {service.title}
                  </Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  
                  <TouchableOpacity
                    style={styles.serviceButton}
                    onPress={() => router.push("/(tabs)/global-services")}
                  >
                    <Text style={[styles.serviceButtonText, { color: service.color }]}>
                      {t.home.viewServices}
                    </Text>
                    <IconSymbol
                      ios_icon_name="arrow.right"
                      android_material_icon_name="arrow_forward"
                      size={16}
                      color={service.color}
                    />
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Coverage Section */}
        <View style={[styles.section, styles.coverageSection]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.home.coverageTitle}
          </Text>
          <Text style={styles.sectionSubtitle}>{t.home.coverageText}</Text>
          
          <View style={styles.regionsContainer}>
            {regions.map((region, index) => (
              <React.Fragment key={index}>
                <View style={[styles.regionBadge, { backgroundColor: theme.colors.card }]}>
                  <IconSymbol
                    ios_icon_name="globe"
                    android_material_icon_name={region.icon as any}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.regionText, { color: theme.colors.text }]}>
                    {region.name}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.coverageButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/port-coverage")}
          >
            <Text style={styles.coverageButtonText}>{t.home.viewAllPorts}</Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow_forward"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        {/* Why Us Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.home.whyUsTitle}
          </Text>
          
          <View style={styles.whyUsContainer}>
            {whyUsPoints.map((point, index) => (
              <React.Fragment key={index}>
                <View style={[styles.whyUsCard, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.whyUsIconContainer, { backgroundColor: colors.highlight }]}>
                    <IconSymbol
                      ios_icon_name={point.icon}
                      android_material_icon_name={point.icon as any}
                      size={28}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.whyUsText, { color: theme.colors.text }]}>
                    {point.text}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={[styles.section, styles.ctaSection]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone"
              size={48}
              color="#ffffff"
            />
            <Text style={styles.ctaText}>{t.home.ctaText}</Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push("/(tabs)/global-services")}
            >
              <Text style={styles.ctaButtonText}>{t.home.ctaButton}</Text>
              <IconSymbol
                ios_icon_name="arrow.right"
                android_material_icon_name="arrow_forward"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Footer */}
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
  heroSection: {
    paddingTop: Platform.OS === 'android' ? 60 : 80,
    paddingBottom: 48,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.95,
  },
  heroDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  heroButtonPrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  heroButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  heroButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    padding: 24,
    borderRadius: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  serviceButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  coverageSection: {
    backgroundColor: colors.highlight,
  },
  regionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 24,
  },
  regionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  coverageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'center',
  },
  coverageButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  whyUsContainer: {
    gap: 16,
  },
  whyUsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 16,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  whyUsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyUsText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  ctaSection: {
    paddingHorizontal: 20,
  },
  ctaCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 28,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
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
