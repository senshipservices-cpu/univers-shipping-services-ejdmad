
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
import { formatPrice, getBillingPeriodLabel } from "@/utils/stripe";
import { ConfigStatus } from "@/components/ConfigStatus";
import appConfig from "@/config/appConfig";
import * as Linking from 'expo-linking';

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
  const { t } = useLanguage();
  const { user, session } = useAuth();
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
      appConfig.logger.info('Highlighting plan:', params.highlight);
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
        appConfig.logger.error('Error fetching plans:', error);
        Alert.alert('Erreur', 'Impossible de charger les plans tarifaires.');
        return;
      }

      appConfig.logger.info('Fetched plans:', data);
      setPlans(data || []);
    } catch (error) {
      appConfig.logger.error('Exception fetching plans:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement des plans.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: PricingPlan) => {
    appConfig.logger.info('Plan selected:', plan.code, 'User:', user?.id);

    // Check if user is authenticated
    if (!user || !session) {
      Alert.alert(
        'Connexion requise',
        'Veuillez vous connecter pour souscrire à un plan.',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Se connecter', 
            onPress: () => router.push('/login')
          }
        ]
      );
      return;
    }

    try {
      setProcessingPlan(plan.code);

      // Call the Edge Function to create a Stripe Checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          plan_code: plan.code,
        },
      });

      if (error) {
        appConfig.logger.error('Error creating checkout session:', error);
        Alert.alert(
          'Erreur',
          'Impossible de créer la session de paiement. Veuillez réessayer.'
        );
        return;
      }

      appConfig.logger.info('Checkout session created:', data);

      // Redirect to Stripe Checkout
      if (data.url) {
        const supported = await Linking.canOpenURL(data.url);
        if (supported) {
          await Linking.openURL(data.url);
        } else {
          Alert.alert('Erreur', 'Impossible d\'ouvrir la page de paiement.');
        }
      } else {
        Alert.alert('Erreur', 'URL de paiement non disponible.');
      }
    } catch (error) {
      appConfig.logger.error('Exception handling plan selection:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
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
            Chargement des plans...
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
          <View style={[styles.accessBanner, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={32}
              color={colors.accent}
            />
            <View style={styles.accessBannerContent}>
              <Text style={[styles.accessBannerTitle, { color: theme.colors.text }]}>
                Accès au Portail Digital requis
              </Text>
              <Text style={[styles.accessBannerText, { color: colors.textSecondary }]}>
                Pour accéder au Portail Digital Maritime, vous devez souscrire à un plan Premium Tracking, Enterprise Logistics ou Digital Portal.
              </Text>
            </View>
          </View>
        )}

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
                      <Text style={styles.popularBadgeText}>Populaire</Text>
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
                      {getBillingPeriodLabel(plan.billing_period, 'fr')}
                    </Text>
                  </View>
                  
                  {plan.description && (
                    <Text style={[styles.planDescription, { color: colors.textSecondary }]}>
                      {plan.description}
                    </Text>
                  )}

                  <View style={styles.divider} />

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
                        <>
                          <Text style={styles.selectButtonText}>
                            {plan.billing_period === 'one_time' ? 'Acheter maintenant' : 'Choisir ce plan'}
                          </Text>
                          <IconSymbol
                            ios_icon_name="arrow.right"
                            android_material_icon_name="arrow_forward"
                            size={18}
                            color="#ffffff"
                          />
                        </>
                      )}
                    </TouchableOpacity>
                    {isPopular && (
                      <MicroCopy
                        text="Paiement sécurisé par Stripe"
                        icon={{ ios: 'lock.shield.fill', android: 'security' }}
                      />
                    )}
                  </View>
                </View>
              </React.Fragment>
            );
          })}
        </View>

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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
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
    gap: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  accessBannerContent: {
    flex: 1,
    gap: 8,
  },
  accessBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  accessBannerText: {
    fontSize: 15,
    lineHeight: 22,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 30,
  },
  plansContainer: {
    paddingHorizontal: 20,
    gap: 20,
    marginBottom: 40,
  },
  planCard: {
    padding: 24,
    borderRadius: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: colors.primary,
    boxShadow: '0px 6px 16px rgba(3, 169, 244, 0.2)',
    elevation: 6,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  highlightedPlan: {
    borderWidth: 3,
    borderColor: colors.accent,
    boxShadow: '0px 8px 24px rgba(255, 152, 0, 0.3)',
    elevation: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
  },
  billingPeriod: {
    fontSize: 14,
    fontWeight: '500',
  },
  planDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  selectButtonDisabled: {
    opacity: 0.6,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  faqSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  faqContainer: {
    gap: 12,
  },
  faqItem: {
    padding: 20,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
