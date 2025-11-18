
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { PageHeader } from "@/components/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { colors } from "@/styles/commonStyles";

export default function DigitalPortalScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, client } = useAuth();
  const { hasDigitalPortalAccess, loading: subscriptionLoading, subscription } = useSubscriptionAccess();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    console.log('Digital Portal - Access Check:', {
      user: !!user,
      client: !!client,
      hasDigitalPortalAccess,
      subscriptionLoading,
      subscription: subscription?.plan_type,
    });

    // Wait for subscription data to load
    if (!subscriptionLoading) {
      setIsCheckingAccess(false);

      // Redirect to pricing if no access
      if (user && client && !hasDigitalPortalAccess) {
        console.log('Digital Portal - Redirecting to pricing (no valid subscription)');
        router.replace('/(tabs)/pricing?highlight=digital_portal');
      }
    }
  }, [user, client, hasDigitalPortalAccess, subscriptionLoading, subscription, router]);

  // Redirect to login if not authenticated
  if (!user) {
    console.log('Digital Portal - Redirecting to client-space (not authenticated)');
    return <Redirect href="/(tabs)/client-space" />;
  }

  // Show loading while checking access
  if (isCheckingAccess || subscriptionLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <PageHeader title={t.digitalPortal.title} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t.common.loading}
          </Text>
        </View>
      </View>
    );
  }

  // If no access after loading, the redirect will happen via useEffect
  if (!hasDigitalPortalAccess) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <PageHeader title={t.digitalPortal.title} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t.digitalPortal.redirecting}
          </Text>
        </View>
      </View>
    );
  }

  // User has access - show the portal
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title={t.digitalPortal.title} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <IconSymbol
            ios_icon_name="globe.badge.chevron.backward"
            android_material_icon_name="language"
            size={80}
            color={colors.primary}
          />
          <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
            {t.digitalPortal.welcomeTitle}
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            {t.digitalPortal.welcomeSubtitle}
          </Text>

          {/* Subscription Badge */}
          {subscription && (
            <View style={[styles.subscriptionBadge, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.subscriptionBadgeText, { color: colors.primary }]}>
                {subscription.plan_type === 'premium_tracking' && 'Premium Tracking'}
                {subscription.plan_type === 'enterprise_logistics' && 'Enterprise Logistics'}
                {subscription.plan_type === 'digital_portal' && 'Digital Portal'}
              </Text>
            </View>
          )}
        </View>

        {/* Portal Features Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.digitalPortal.featuresTitle}
          </Text>

          <View style={styles.featuresGrid}>
            {/* Advanced Tracking */}
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/client-dashboard')}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="location.fill"
                  android_material_icon_name="my_location"
                  size={32}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {t.digitalPortal.advancedTracking}
              </Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {t.digitalPortal.advancedTrackingDesc}
              </Text>
            </TouchableOpacity>

            {/* Documents & Reports */}
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => console.log('Documents feature - Coming soon')}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: colors.secondary + '20' }]}>
                <IconSymbol
                  ios_icon_name="doc.text.fill"
                  android_material_icon_name="description"
                  size={32}
                  color={colors.secondary}
                />
              </View>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {t.digitalPortal.documents}
              </Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {t.digitalPortal.documentsDesc}
              </Text>
            </TouchableOpacity>

            {/* Analytics & Reporting */}
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => console.log('Analytics feature - Coming soon')}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol
                  ios_icon_name="chart.bar.fill"
                  android_material_icon_name="bar_chart"
                  size={32}
                  color={colors.accent}
                />
              </View>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {t.digitalPortal.analytics}
              </Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {t.digitalPortal.analyticsDesc}
              </Text>
            </TouchableOpacity>

            {/* API Access */}
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => console.log('API feature - Coming soon')}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: colors.success + '20' }]}>
                <IconSymbol
                  ios_icon_name="chevron.left.forwardslash.chevron.right"
                  android_material_icon_name="code"
                  size={32}
                  color={colors.success}
                />
              </View>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {t.digitalPortal.apiAccess}
              </Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {t.digitalPortal.apiAccessDesc}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.digitalPortal.quickActions}
          </Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/freight-quote')}
            >
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add_circle"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>
                {t.digitalPortal.newQuote}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => router.push('/(tabs)/contact')}
            >
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>
                {t.digitalPortal.contactSupport}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.digitalPortal.resources}
          </Text>

          <View style={styles.resourcesContainer}>
            <TouchableOpacity
              style={[styles.resourceCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => console.log('User guide - Coming soon')}
            >
              <IconSymbol
                ios_icon_name="book.fill"
                android_material_icon_name="menu_book"
                size={24}
                color={colors.primary}
              />
              <View style={styles.resourceContent}>
                <Text style={[styles.resourceTitle, { color: theme.colors.text }]}>
                  {t.digitalPortal.userGuide}
                </Text>
                <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
                  {t.digitalPortal.userGuideDesc}
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resourceCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => console.log('API documentation - Coming soon')}
            >
              <IconSymbol
                ios_icon_name="doc.text"
                android_material_icon_name="article"
                size={24}
                color={colors.secondary}
              />
              <View style={styles.resourceContent}>
                <Text style={[styles.resourceTitle, { color: theme.colors.text }]}>
                  {t.digitalPortal.apiDocs}
                </Text>
                <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
                  {t.digitalPortal.apiDocsDesc}
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resourceCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/contact')}
            >
              <IconSymbol
                ios_icon_name="questionmark.circle.fill"
                android_material_icon_name="help"
                size={24}
                color={colors.accent}
              />
              <View style={styles.resourceContent}>
                <Text style={[styles.resourceTitle, { color: theme.colors.text }]}>
                  {t.digitalPortal.support}
                </Text>
                <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
                  {t.digitalPortal.supportDesc}
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.infoBannerText, { color: theme.colors.text }]}>
            {t.digitalPortal.infoBanner}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 12,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  subscriptionBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resourcesContainer: {
    gap: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  resourceContent: {
    flex: 1,
    gap: 4,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
