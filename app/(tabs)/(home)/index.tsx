
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { FeaturedServices } from "@/components/FeaturedServices";
import { ClientProfileSolutions } from "@/components/ClientProfileSolutions";
import { ConfidenceBanner } from "@/components/ConfidenceBanner";
import { MicroCopy } from "@/components/MicroCopy";
import { colors } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";

interface ServiceCard {
  title: string;
  description: string;
  icon: string;
  iosIcon: string;
  color: string;
  route: string;
}

interface RegionBadge {
  name: string;
  icon: string;
}

interface WhyChooseUsAdvantage {
  title: string;
  description: string;
  icon: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const quickAccessCards: ServiceCard[] = [
    {
      title: t.home.portCoverage,
      description: t.home.portCoverageDesc,
      icon: "anchor",
      iosIcon: "anchor",
      color: colors.secondary,
      route: "/(tabs)/port-coverage",
    },
    {
      title: t.home.globalServices,
      description: t.home.globalServicesDesc,
      icon: "inventory_2",
      iosIcon: "shippingbox.fill",
      color: colors.primary,
      route: "/(tabs)/global-services",
    },
    {
      title: t.home.pricing,
      description: t.home.pricingDesc,
      icon: "credit_card",
      iosIcon: "creditcard.fill",
      color: colors.accent,
      route: "/(tabs)/pricing",
    },
    {
      title: t.home.becomeAgent,
      description: t.home.becomeAgentDesc,
      icon: "public",
      iosIcon: "globe",
      color: colors.secondary,
      route: "/(tabs)/become-agent",
    },
  ];

  const serviceCategories: ServiceCard[] = [
    {
      title: t.home.maritimeShipping,
      description: t.home.maritimeShippingDesc,
      icon: "directions_boat",
      iosIcon: "ferry.fill",
      color: colors.primary,
      route: "/(tabs)/global-services",
    },
    {
      title: t.home.logisticsPortHandling,
      description: t.home.logisticsPortHandlingDesc,
      icon: "local_shipping",
      iosIcon: "shippingbox.fill",
      color: colors.secondary,
      route: "/(tabs)/global-services",
    },
    {
      title: t.home.tradeConsulting,
      description: t.home.tradeConsultingDesc,
      icon: "business_center",
      iosIcon: "briefcase.fill",
      color: colors.accent,
      route: "/(tabs)/global-services",
    },
    {
      title: t.home.digitalSolutions,
      description: t.home.digitalSolutionsDesc,
      icon: "computer",
      iosIcon: "desktopcomputer",
      color: colors.primary,
      route: "/(tabs)/global-services",
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

  const whyChooseUsAdvantages: WhyChooseUsAdvantage[] = [
    {
      title: t.home.whyChooseUsAdvantage1Title,
      description: t.home.whyChooseUsAdvantage1Desc,
      icon: "public",
    },
    {
      title: t.home.whyChooseUsAdvantage2Title,
      description: t.home.whyChooseUsAdvantage2Desc,
      icon: "support_agent",
    },
    {
      title: t.home.whyChooseUsAdvantage3Title,
      description: t.home.whyChooseUsAdvantage3Desc,
      icon: "integration_instructions",
    },
    {
      title: t.home.whyChooseUsAdvantage4Title,
      description: t.home.whyChooseUsAdvantage4Desc,
      icon: "verified_user",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Header with Logo and Navigation */}
      <View style={[styles.topHeader, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="line.3.horizontal"
              android_material_icon_name="menu"
              size={28}
              color={colors.secondary}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerCenter}>
          <Logo width={100} showText={false} />
        </View>
        
        <View style={styles.headerRight}>
          <LanguageSwitcher />
          
          {isAdmin && (
            <TouchableOpacity
              style={[styles.adminButton, { backgroundColor: colors.secondary }]}
              onPress={() => router.push('/(tabs)/admin-dashboard')}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="shield.lefthalf.filled"
                android_material_icon_name="admin_panel_settings"
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => router.push({
              pathname: '/(tabs)/contact',
              params: { subject: 'Demande d\'aide' }
            })}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="questionmark.circle.fill"
              android_material_icon_name="help"
              size={28}
              color={colors.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Logo */}
        <View style={styles.heroLogoSection}>
          <Logo width={180} showText={true} textSize="large" />
        </View>

        {/* Quick Access Cards */}
        <View style={styles.section}>
          <View style={styles.quickAccessGrid}>
            {quickAccessCards.map((card, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[styles.quickAccessCard, { backgroundColor: theme.colors.card }]}
                  onPress={() => router.push(card.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickAccessIconContainer, { backgroundColor: card.color }]}>
                    <Text style={styles.quickAccessEmoji}>
                      {card.title === t.home.portCoverage ? '⚓' :
                       card.title === t.home.globalServices ? '📦' :
                       card.title === t.home.pricing ? '💳' :
                       card.title === t.home.becomeAgent ? '🌍' : '🏠'}
                    </Text>
                  </View>
                  <Text style={[styles.quickAccessTitle, { color: theme.colors.text }]}>
                    {card.title}
                  </Text>
                  <Text style={styles.quickAccessDescription}>{card.description}</Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaSection}
        >
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>{t.home.heroTitle}</Text>
            <Text style={styles.ctaSubtitle}>{t.home.heroSubtitle}</Text>
            
            <View style={styles.ctaButtons}>
              <View>
                <TouchableOpacity
                  style={[styles.ctaButton, styles.ctaButtonPrimary]}
                  onPress={() => router.push("/(tabs)/freight-quote")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ctaButtonTextPrimary}>{t.home.mainCta}</Text>
                  <IconSymbol
                    ios_icon_name="arrow.right"
                    android_material_icon_name="arrow_forward"
                    size={20}
                    color="#ffffff"
                  />
                </TouchableOpacity>
                <MicroCopy
                  text={t.home.mainCtaMicrocopy}
                  icon={{ ios: 'checkmark.circle.fill', android: 'check_circle' }}
                  color="#ffffff"
                />
              </View>
              
              <TouchableOpacity
                style={[styles.ctaButton, styles.ctaButtonSecondary]}
                onPress={() => router.push({
                  pathname: "/(tabs)/contact",
                  params: { subject: "Demande d'assistance générale" }
                })}
                activeOpacity={0.8}
              >
                <Text style={styles.ctaButtonTextSecondary}>{t.home.talkToExpert}</Text>
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={20}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Featured Services Section */}
        <FeaturedServices />

        {/* Client Profile Solutions Section */}
        <ClientProfileSolutions />

        {/* Confidence Banner */}
        <ConfidenceBanner
          blocks={[
            {
              icon: { ios: 'headphones', android: 'support_agent' },
              title: t.confidenceBanner.block1Title,
              description: t.confidenceBanner.block1Desc,
              color: colors.primary,
            },
            {
              icon: { ios: 'checkmark.seal.fill', android: 'verified_user' },
              title: t.confidenceBanner.block2Title,
              description: t.confidenceBanner.block2Desc,
              color: colors.secondary,
            },
            {
              icon: { ios: 'shield.checkered', android: 'security' },
              title: t.confidenceBanner.block3Title,
              description: t.confidenceBanner.block3Desc,
              color: colors.accent,
            },
            {
              icon: { ios: 'star.fill', android: 'star' },
              title: t.confidenceBanner.block4Title,
              description: t.confidenceBanner.block4Desc,
              color: colors.success,
            },
          ]}
        />

        {/* Why Choose Us Section */}
        <View style={[styles.section, styles.whyChooseUsSection]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.home.whyChooseUsTitle}
          </Text>
          
          <View style={styles.whyChooseUsGrid}>
            {whyChooseUsAdvantages.map((advantage, index) => (
              <React.Fragment key={index}>
                <View style={[styles.whyChooseUsCard, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.whyChooseUsIconContainer, { backgroundColor: colors.secondary }]}>
                    <IconSymbol
                      ios_icon_name={advantage.icon}
                      android_material_icon_name={advantage.icon as any}
                      size={32}
                      color="#ffffff"
                    />
                  </View>
                  <Text style={[styles.whyChooseUsTitle, { color: theme.colors.text }]}>
                    {advantage.title}
                  </Text>
                  <Text style={styles.whyChooseUsDescription}>
                    {advantage.description}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

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
                      ios_icon_name={service.iosIcon}
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
                    onPress={() => router.push(service.route as any)}
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
                    color={colors.secondary}
                  />
                  <Text style={[styles.regionText, { color: theme.colors.text }]}>
                    {region.name}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.coverageButton, { backgroundColor: colors.secondary }]}
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
                      color={colors.secondary}
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

        {/* Final CTA Section */}
        <View style={[styles.section, styles.finalCtaSection]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.finalCtaCard}
          >
            <IconSymbol
              ios_icon_name="lightbulb.fill"
              android_material_icon_name="lightbulb"
              size={56}
              color="#ffffff"
            />
            <Text style={styles.finalCtaTitle}>{t.home.finalCtaTitle}</Text>
            <Text style={styles.finalCtaSubtitle}>{t.home.finalCtaSubtitle}</Text>
            
            <View style={styles.finalCtaButtons}>
              <TouchableOpacity
                style={styles.finalCtaButton}
                onPress={() => router.push({
                  pathname: "/(tabs)/contact",
                  params: { subject: "Demande personnalisée" }
                })}
                activeOpacity={0.8}
              >
                <Text style={styles.finalCtaButtonText}>{t.home.finalCtaContactExpert}</Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow_forward"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.finalCtaButton, styles.finalCtaButtonSecondary]}
                onPress={() => router.push("/(tabs)/pricing")}
                activeOpacity={0.8}
              >
                <Text style={[styles.finalCtaButtonText, styles.finalCtaButtonTextSecondary]}>
                  {t.home.finalCtaViewPricing}
                </Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow_forward"
                  size={20}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 UNIVERSAL SHIPPING SERVICES
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary,
    boxShadow: '0px 2px 8px rgba(0, 44, 95, 0.15)',
    elevation: 4,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    padding: 4,
  },
  adminButton: {
    padding: 8,
    borderRadius: 20,
  },
  helpButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroLogoSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: colors.highlight,
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
    color: colors.primary,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quickAccessIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickAccessEmoji: {
    fontSize: 32,
  },
  quickAccessTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  quickAccessDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  ctaSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  ctaSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.95,
    marginBottom: 28,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonPrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  ctaButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  ctaButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  ctaButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  whyChooseUsSection: {
    backgroundColor: colors.highlight,
  },
  whyChooseUsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  whyChooseUsCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  whyChooseUsIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  whyChooseUsTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  whyChooseUsDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
  finalCtaSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  finalCtaCard: {
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  finalCtaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
    lineHeight: 36,
  },
  finalCtaSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    opacity: 0.95,
    paddingHorizontal: 10,
  },
  finalCtaButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  finalCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  finalCtaButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  finalCtaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  finalCtaButtonTextSecondary: {
    color: '#ffffff',
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
