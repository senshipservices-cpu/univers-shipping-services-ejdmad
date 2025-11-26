
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { PageHeader } from "@/components/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { ConfidenceBanner } from "@/components/ConfidenceBanner";
import { TrustBar } from "@/components/TrustBar";
import { MicroCopy } from "@/components/MicroCopy";
import { formatPrice, getBillingPeriodLabel } from "@/utils/paypal";
import { ConfigStatus } from "@/components/ConfigStatus";
import appConfig from "@/config/appConfig";
import * as Linking from 'expo-linking';
import { ResponsiveContainer } from "@/components/ResponsiveContainer";
import { getFontSize, spacing, borderRadius, getShadow } from "@/styles/responsiveStyles";

interface PricingPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price_eur: string;
  currency: string;
  billing_period: string;
  stripe_price_id: string | null;
  is_active: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function PricingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { user, session, client } = useAuth();
  const params = useLocalSearchParams();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    
    // Check for highlight parameter
    if (params.highlight) {
      setHighlightedPlan(params.highlight as string);
    }
  }, [params.highlight]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_eur', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        Alert.alert(
          language === 'en' ? 'Error' : 'Erreur',
          language === 'en' ? 'Unable to load pricing plans.' : 'Impossible de charger les plans tarifaires.'
        );
        return;
      }

      setPlans(data || []);
    } catch (error) {
      console.error('Exception fetching plans:', error);
      Alert.alert(
        language === 'en' ? 'Error' : 'Erreur',
        language === 'en' ? 'An error occurred while loading plans.' : 'Une erreur est survenue lors du chargement des plans.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: PricingPlan) => {
    // Determine plan type from plan code
    const planType = plan.code.toLowerCase().includes('basic') ? 'basic' :
                     plan.code.toLowerCase().includes('pro') && !plan.code.toLowerCase().includes('yearly') ? 'premium_tracking' :
                     plan.code.toLowerCase().includes('enterprise') ? 'enterprise_logistics' :
                     plan.code.toLowerCase().includes('digital_portal') ? 'digital_portal' :
                     plan.code.toLowerCase().includes('agent') ? 'agent_listing' : null;

    // Handle Agent Listing plan - redirect to become_agent (no authentication required)
    if (planType === 'agent_listing') {
      router.push('/(tabs)/become-agent');
      return;
    }

    // Check if user is authenticated for other plans
    if (!user || !session) {
      Alert.alert(
        language === 'en' ? 'Login Required' : 'Connexion requise',
        language === 'en' ? 'Please log in to subscribe to a plan.' : 'Veuillez vous connecter pour souscrire à un plan.',
        [
          { text: language === 'en' ? 'Cancel' : 'Annuler', style: 'cancel' },
          { 
            text: language === 'en' ? 'Login' : 'Se connecter', 
            onPress: () => {
              router.push({
                pathname: '/(tabs)/login',
                params: { 
                  returnTo: 'pricing',
                  plan: planType 
                }
              });
            }
          }
        ]
      );
      return;
    }

    try {
      setProcessingPlan(plan.code);

      // Check if client profile exists
      if (!client) {
        Alert.alert(
          language === 'en' ? 'Incomplete Profile' : 'Profil incomplet',
          language === 'en' ? 'Please complete your client profile before subscribing.' : 'Veuillez compléter votre profil client avant de souscrire.',
          [
            {
              text: language === 'en' ? 'Complete Profile' : 'Compléter mon profil',
              onPress: () => router.push('/(tabs)/client-profile'),
            },
          ]
        );
        setProcessingPlan(null);
        return;
      }

      // Handle Basic plan - create subscription directly and redirect to dashboard
      if (planType === 'basic') {
        // Create basic subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 365); // 1 year for basic

        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            client: client.id,
            user_id: user.id,
            plan_type: 'basic',
            plan_code: plan.code,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            is_active: true,
            status: 'active',
            payment_provider: 'free',
            notes: `Basic plan activated on ${new Date().toISOString()}`,
          });

        if (subscriptionError) {
          console.error('Error creating basic subscription:', subscriptionError);
          Alert.alert(
            language === 'en' ? 'Error' : 'Erreur',
            language === 'en' ? 'Unable to create your subscription. Please try again.' : 'Impossible de créer votre abonnement. Veuillez réessayer.'
          );
          setProcessingPlan(null);
          return;
        }

        // Redirect to client dashboard with success message
        Alert.alert(
          language === 'en' ? 'Welcome!' : 'Bienvenue !',
          language === 'en' ? 'Your Basic subscription has been activated successfully. You can now access all basic services.' : 'Votre abonnement Basic a été activé avec succès. Vous pouvez maintenant accéder à tous les services de base.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/client-dashboard'),
            },
          ]
        );
        setProcessingPlan(null);
        return;
      }

      // Handle Premium, Enterprise, and Digital Portal plans - redirect to subscription_confirm
      if (planType === 'premium_tracking' || planType === 'enterprise_logistics' || planType === 'digital_portal') {
        router.push({
          pathname: '/(tabs)/subscription-confirm',
          params: { plan: planType }
        });
        setProcessingPlan(null);
        return;
      }

      // Fallback: use payment provider (for future payment integration)
      const edgeFunctionName = appConfig.payment.provider === 'paypal' 
        ? 'create-paypal-order' 
        : 'create-checkout-session';

      const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
        body: {
          plan_code: plan.code,
        },
      });

      if (error) {
        console.error('Error creating payment session:', error);
        Alert.alert(
          language === 'en' ? 'Error' : 'Erreur',
          language === 'en' ? 'Unable to create payment session. Please try again.' : 'Impossible de créer la session de paiement. Veuillez réessayer.'
        );
        setProcessingPlan(null);
        return;
      }

      // Redirect to payment page (PayPal or Stripe)
      if (data.url) {
        const supported = await Linking.canOpenURL(data.url);
        if (supported) {
          await Linking.openURL(data.url);
        } else {
          Alert.alert(
            language === 'en' ? 'Error' : 'Erreur',
            language === 'en' ? 'Unable to open payment page.' : 'Impossible d\'ouvrir la page de paiement.'
          );
        }
      } else {
        Alert.alert(
          language === 'en' ? 'Error' : 'Erreur',
          language === 'en' ? 'Payment URL not available.' : 'URL de paiement non disponible.'
        );
      }
    } catch (error) {
      console.error('Exception handling plan selection:', error);
      Alert.alert(
        language === 'en' ? 'Error' : 'Erreur',
        language === 'en' ? 'An error occurred. Please try again.' : 'Une erreur est survenue. Veuillez réessayer.'
      );
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPlanColor = (code: string): string => {
    if (code.includes('BASIC')) return colors.textSecondary;
    if (code.includes('PRO')) return colors.primary;
    if (code.includes('ENTERPRISE')) return colors.secondary;
    if (code.includes('DIGITAL_PORTAL')) return '#9C27B0';
    return colors.accent;
  };

  const isPlanPopular = (code: string): boolean => {
    return code.includes('PRO') && !code.includes('YEARLY');
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const faqItems: FAQItem[] = [
    {
      question: t.pricing.faqQuestion1,
      answer: t.pricing.faqAnswer1,
    },
    {
      question: t.pricing.faqQuestion2,
      answer: t.pricing.faqAnswer2,
    },
    {
      question: t.pricing.faqQuestion3,
      answer: t.pricing.faqAnswer3,
    },
    {
      question: t.pricing.faqQuestion4,
      answer: t.pricing.faqAnswer4,
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <PageHeader title={t.pricing.title} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {language === 'en' ? 'Loading plans...' : 'Chargement des plans...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title={t.pricing.title} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Configuration Status (Dev Only) */}
        {appConfig.isDev && <ConfigStatus />}

        {highlightedPlan === 'digital_portal' && (
          <ResponsiveContainer>
            <View style={[styles.accessBanner, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={32}
                color={colors.accent}
              />
              <View style={styles.accessBannerContent}>
                <Text style={[styles.accessBannerTitle, { color: theme.colors.text }]}>
                  {language === 'en' ? 'Digital Portal Access Required' : 'Accès au Portail Digital requis'}
                </Text>
                <Text style={[styles.accessBannerText, { color: colors.textSecondary }]}>
                  {language === 'en' 
                    ? 'To access the Digital Maritime Portal, you must subscribe to a Premium Tracking, Enterprise Logistics or Digital Portal plan.'
                    : 'Pour accéder au Portail Digital Maritime, vous devez souscrire à un plan Premium Tracking, Enterprise Logistics ou Digital Portal.'}
                </Text>
              </View>
            </View>
          </ResponsiveContainer>
        )}

        <ResponsiveContainer>
          <View style={styles.heroSection}>
            <IconSymbol
              ios_icon_name="dollarsign.circle.fill"
              android_material_icon_name="payments"
              size={80}
              color={colors.primary}
            />
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              {t.pricing.subtitle}
            </Text>
          </View>
        </ResponsiveContainer>

        {/* Trust Bar */}
        <TrustBar
          items={[
            {
              icon: { ios: 'lock.shield.fill', android: 'lock' },
              text: t.trustBar.item1,
            },
            {
              icon: { ios: 'checkmark.circle.fill', android: 'check_circle' },
              text: t.trustBar.item2,
            },
            {
              icon: { ios: 'bolt.fill', android: 'flash_on' },
              text: t.trustBar.item3,
            },
            {
              icon: { ios: 'shield.checkered', android: 'security' },
              text: t.trustBar.item4,
            },
          ]}
        />

        <ResponsiveContainer>
          <View style={styles.plansContainer}>
            {plans.map((plan, index) => {
              const planColor = getPlanColor(plan.code);
              const isPopular = isPlanPopular(plan.code);
              const isProcessing = processingPlan === plan.code;

              return (
                <React.Fragment key={index}>
                  <View
                    style={[
                      styles.planCard,
                      { backgroundColor: theme.colors.card },
                      getShadow('md'),
                      isPopular && styles.popularPlan,
                      highlightedPlan && plan.code.includes(highlightedPlan.toUpperCase()) && styles.highlightedPlan,
                    ]}
                  >
                    {isPopular && (
                      <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                        <IconSymbol
                          ios_icon_name="star.fill"
                          android_material_icon_name="star"
                          size={14}
                          color="#ffffff"
                        />
                        <Text style={styles.popularBadgeText}>
                          {language === 'en' ? 'Popular' : 'Populaire'}
                        </Text>
                      </View>
                    )}
                    
                    <Text style={[styles.planName, { color: planColor }]}>
                      {plan.name}
                    </Text>
                    
                    <View style={styles.priceContainer}>
                      <Text style={[styles.planPrice, { color: theme.colors.text }]}>
                        {formatPrice(parseFloat(plan.price_eur), plan.currency)}
                      </Text>
                      <Text style={[styles.billingPeriod, { color: colors.textSecondary }]}>
                        {getBillingPeriodLabel(plan.billing_period, language)}
                      </Text>
                    </View>
                    
                    {plan.description && (
                      <Text style={[styles.planDescription, { color: colors.textSecondary }]}>
                        {plan.description}
                      </Text>
                    )}

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View>
                      <TouchableOpacity
                        style={[
                          styles.selectButton,
                          { backgroundColor: planColor },
                          isProcessing && styles.selectButtonDisabled,
                        ]}
                        onPress={() => handleSelectPlan(plan)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <React.Fragment>
                            <Text style={styles.selectButtonText}>
                              {plan.billing_period === 'one_time' 
                                ? (language === 'en' ? 'Buy Now' : 'Acheter maintenant')
                                : (language === 'en' ? 'Choose This Plan' : 'Choisir ce plan')}
                            </Text>
                            <IconSymbol
                              ios_icon_name="arrow.right"
                              android_material_icon_name="arrow_forward"
                              size={18}
                              color="#ffffff"
                            />
                          </React.Fragment>
                        )}
                      </TouchableOpacity>
                      {isPopular && (
                        <MicroCopy
                          text={language === 'en' 
                            ? `Secure payment by ${appConfig.payment.provider === 'paypal' ? 'PayPal' : 'Stripe'}`
                            : `Paiement sécurisé par ${appConfig.payment.provider === 'paypal' ? 'PayPal' : 'Stripe'}`}
                          icon={{ ios: 'lock.shield.fill', android: 'security' }}
                        />
                      )}
                    </View>
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        </ResponsiveContainer>

        <ResponsiveContainer>
          <View style={styles.faqSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t.pricing.faqTitle}
            </Text>
            
            <View style={styles.faqContainer}>
              {faqItems.map((item, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.faqItem,
                      { backgroundColor: theme.colors.card },
                      getShadow('sm'),
                    ]}
                    onPress={() => toggleFAQ(index)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.faqHeader}>
                      <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>
                        {item.question}
                      </Text>
                      <IconSymbol
                        ios_icon_name={expandedFAQ === index ? "chevron.up" : "chevron.down"}
                        android_material_icon_name={expandedFAQ === index ? "expand_less" : "expand_more"}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    
                    {expandedFAQ === index && (
                      <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                        {item.answer}
                      </Text>
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>
        </ResponsiveContainer>

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

        {/* How It Works Section */}
        <HowItWorksSection
          title={t.pricing.howItWorksTitle}
          steps={[
            {
              number: 1,
              title: t.howItWorks.step1Title,
              description: t.howItWorks.step1Desc,
              icon: { ios: 'doc.text.fill', android: 'description' },
              color: colors.primary,
            },
            {
              number: 2,
              title: t.howItWorks.step2Title,
              description: t.howItWorks.step2Desc,
              icon: { ios: 'person.fill.checkmark', android: 'verified_user' },
              color: colors.secondary,
            },
            {
              number: 3,
              title: t.howItWorks.step3Title,
              description: t.howItWorks.step3Desc,
              icon: { ios: 'checkmark.circle.fill', android: 'check_circle' },
              color: colors.accent,
            },
            {
              number: 4,
              title: t.howItWorks.step4Title,
              description: t.howItWorks.step4Desc,
              icon: { ios: 'location.fill', android: 'my_location' },
              color: colors.success,
            },
          ]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: getFontSize('md'),
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  accessBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  accessBannerContent: {
    flex: 1,
    gap: spacing.sm,
  },
  accessBannerTitle: {
    fontSize: getFontSize('lg'),
    fontWeight: '700',
  },
  accessBannerText: {
    fontSize: getFontSize('md'),
    lineHeight: 22,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  subtitle: {
    fontSize: getFontSize('xxl'),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 30,
  },
  plansContainer: {
    gap: spacing.xl,
    marginBottom: spacing.huge,
  },
  planCard: {
    padding: spacing.xxxl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.round,
    gap: 4,
  },
  popularBadgeText: {
    fontSize: getFontSize('xs'),
    fontWeight: '700',
    color: '#ffffff',
  },
  highlightedPlan: {
    borderWidth: 3,
    borderColor: colors.accent,
  },
  planName: {
    fontSize: getFontSize('xxxl'),
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  planPrice: {
    fontSize: getFontSize('xxxl'),
    fontWeight: '700',
  },
  billingPeriod: {
    fontSize: getFontSize('sm'),
    fontWeight: '500',
  },
  planDescription: {
    fontSize: getFontSize('md'),
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    marginBottom: spacing.xl,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  selectButtonDisabled: {
    opacity: 0.6,
  },
  selectButtonText: {
    fontSize: getFontSize('md'),
    fontWeight: '700',
    color: '#ffffff',
  },
  faqSection: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: getFontSize('xxxl'),
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  faqContainer: {
    gap: spacing.md,
  },
  faqItem: {
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: getFontSize('md'),
    fontWeight: '700',
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: getFontSize('md'),
    lineHeight: 22,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
