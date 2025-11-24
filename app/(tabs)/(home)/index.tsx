
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
import { 
  getSafeAreaPadding, 
  getFontSize, 
  spacing, 
  borderRadius, 
  getShadow,
  getCardWidth,
  layout
} from "@/styles/responsiveStyles";
import { ResponsiveContainer } from "@/components/ResponsiveContainer";

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

  const cardWidth = getCardWidth(2, spacing.md);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Header with Logo and Navigation */}
      <View style={[styles.topHeader, getSafeAreaPadding()]}>
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
        <ResponsiveContainer>
          <View style={styles.heroLogoSection}>
            <Logo width={layout.isSmallDevice ? 150 : 180} showText={true} textSize="large" />
          </View>
        </ResponsiveContainer>

        {/* Quick Access Cards */}
        <ResponsiveContainer>
          <View style={styles.quickAccessGrid}>
            {quickAccessCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickAccessCard,
                  { backgroundColor: theme.colors.card, width: cardWidth },
                  getShadow('sm'),
                ]}
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
            ))}
          </View>
        </ResponsiveContainer>

        {/* CTA Section */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaSection}
        >
          <ResponsiveContainer>
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
          </ResponsiveContainer>
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
        <ResponsiveContainer>
          <View style={styles.whyChooseUsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t.home.whyChooseUsTitle}
            </Text>
            
            <View style={styles.whyChooseUsGrid}>
              {whyChooseUsAdvantages.map((advantage, index) => (
                <View
                  key={index}
                  style={[
                    styles.whyChooseUsCard,
                    { backgroundColor: theme.colors.card, width: cardWidth },
                    getShadow('md'),
                  ]}
                >
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
              ))}
            </View>
          </View>
        </ResponsiveContainer>

        {/* Services Section */}
        <ResponsiveContainer>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t.home.servicesTitle}
            </Text>
            <Text style={styles.sectionSubtitle}>{t.home.servicesSubtitle}</Text>
            
            <View style={styles.servicesGrid}>
              {serviceCategories.map((service, index) => (
                <View
                  key={index}
                  style={[
                    styles.serviceCard,
                    { backgroundColor: theme.colors.card },
                    getShadow('sm'),
                  ]}
                >
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
              ))}
            </View>
          </View>
        </ResponsiveContainer>

        {/* Coverage Section */}
        <ResponsiveContainer>
          <View style={[styles.section, styles.coverageSection]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t.home.coverageTitle}
            </Text>
            <Text style={styles.sectionSubtitle}>{t.home.coverageText}</Text>
            
            <View style={styles.regionsContainer}>
              {regions.map((region, index) => (
                <View
                  key={index}
                  style={[
                    styles.regionBadge,
                    { backgroundColor: theme.colors.card },
                    getShadow('sm'),
                  ]}
                >
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
        </ResponsiveContainer>

        {/* Why Us Section */}
        <ResponsiveContainer>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t.home.whyUsTitle}
            </Text>
            
            <View style={styles.whyUsContainer}>
              {whyUsPoints.map((point, index) => (
                <View
                  key={index}
                  style={[
                    styles.whyUsCard,
                    { backgroundColor: theme.colors.card },
                    getShadow('sm'),
                  ]}
                >
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
              ))}
            </View>
          </View>
        </ResponsiveContainer>

        {/* Final CTA Section */}
        <ResponsiveContainer>
          <View style={styles.finalCtaSection}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.finalCtaCard, getShadow('lg')]}
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
                  style={[styles.finalCtaButton, getShadow('md')]}
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
        </ResponsiveContainer>

        {/* Footer */}
        <ResponsiveContainer>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 UNIVERSAL SHIPPING SERVICES
            </Text>
            <Text style={[styles.footerText, { marginTop: 4 }]}>
              Worldwide Maritime & Logistics Solutions
            </Text>
          </View>
        </ResponsiveContainer>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 44, 95, 0.15)',
      },
      default: {
        elevation: 4,
      },
    }),
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
    gap: spacing.sm,
  },
  menuButton: {
    padding: 4,
  },
  adminButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.round,
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
    paddingVertical: spacing.huge,
    alignItems: 'center',
    backgroundColor: colors.highlight,
  },
  section: {
    paddingVertical: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: getFontSize('xxxl'),
    fontWeight: '800',
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.primary,
  },
  sectionSubtitle: {
    fontSize: getFontSize('md'),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
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
    marginBottom: spacing.md,
  },
  quickAccessEmoji: {
    fontSize: 32,
  },
  quickAccessTitle: {
    fontSize: getFontSize('md'),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  quickAccessDescription: {
    fontSize: getFontSize('xs'),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  ctaSection: {
    paddingVertical: spacing.huge,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: getFontSize('xxxl'),
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  ctaSubtitle: {
    fontSize: getFontSize('lg'),
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.95,
    marginBottom: spacing.xxxl,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
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
    fontSize: getFontSize('md'),
    fontWeight: '700',
    color: '#ffffff',
  },
  ctaButtonTextSecondary: {
    fontSize: getFontSize('md'),
    fontWeight: '700',
    color: '#ffffff',
  },
  whyChooseUsSection: {
    backgroundColor: colors.highlight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  whyChooseUsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  whyChooseUsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
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
    marginBottom: spacing.lg,
  },
  whyChooseUsTitle: {
    fontSize: getFontSize('md'),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  whyChooseUsDescription: {
    fontSize: getFontSize('sm'),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  servicesGrid: {
    gap: spacing.lg,
  },
  serviceCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  serviceTitle: {
    fontSize: getFontSize('xl'),
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  serviceDescription: {
    fontSize: getFontSize('sm'),
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  serviceButtonText: {
    fontSize: getFontSize('md'),
    fontWeight: '700',
  },
  coverageSection: {
    backgroundColor: colors.highlight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  regionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  regionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regionText: {
    fontSize: getFontSize('sm'),
    fontWeight: '600',
  },
  coverageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    alignSelf: 'center',
  },
  coverageButtonText: {
    fontSize: getFontSize('lg'),
    fontWeight: '700',
    color: '#ffffff',
  },
  whyUsContainer: {
    gap: spacing.lg,
  },
  whyUsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.lg,
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
    fontSize: getFontSize('md'),
    fontWeight: '600',
    lineHeight: 22,
  },
  finalCtaSection: {
    paddingVertical: spacing.huge,
  },
  finalCtaCard: {
    padding: spacing.huge,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: getFontSize('xxxl'),
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    lineHeight: 36,
  },
  finalCtaSubtitle: {
    fontSize: getFontSize('md'),
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 24,
    opacity: 0.95,
    paddingHorizontal: 10,
  },
  finalCtaButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  finalCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  finalCtaButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  finalCtaButtonText: {
    fontSize: getFontSize('md'),
    fontWeight: '700',
    color: colors.primary,
  },
  finalCtaButtonTextSecondary: {
    color: '#ffffff',
  },
  footer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: getFontSize('xs'),
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
