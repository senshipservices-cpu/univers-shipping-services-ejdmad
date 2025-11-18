
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { PageHeader } from "@/components/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";

interface PricingPlan {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  color: string;
  action: 'basic' | 'premium' | 'enterprise' | 'agent';
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function PricingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    console.log('Auth status:', !!session);
  };

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      title: t.pricing.basicTitle,
      price: t.pricing.basicPrice,
      description: t.pricing.basicDesc,
      features: [
        t.pricing.basicFeature1,
        t.pricing.basicFeature2,
        t.pricing.basicFeature3,
      ],
      buttonText: t.pricing.basicButton,
      color: colors.textSecondary,
      action: 'basic',
    },
    {
      id: 'premium',
      title: t.pricing.premiumTitle,
      price: t.pricing.premiumPrice,
      description: t.pricing.premiumDesc,
      features: [
        t.pricing.premiumFeature1,
        t.pricing.premiumFeature2,
        t.pricing.premiumFeature3,
      ],
      buttonText: t.pricing.premiumButton,
      color: colors.primary,
      action: 'premium',
    },
    {
      id: 'enterprise',
      title: t.pricing.enterpriseTitle,
      price: t.pricing.enterprisePrice,
      description: t.pricing.enterpriseDesc,
      features: [
        t.pricing.enterpriseFeature1,
        t.pricing.enterpriseFeature2,
        t.pricing.enterpriseFeature3,
      ],
      buttonText: t.pricing.enterpriseButton,
      color: colors.secondary,
      action: 'enterprise',
    },
    {
      id: 'agent',
      title: t.pricing.agentTitle,
      price: t.pricing.agentPrice,
      description: t.pricing.agentDesc,
      features: [
        t.pricing.agentFeature1,
        t.pricing.agentFeature2,
        t.pricing.agentFeature3,
      ],
      buttonText: t.pricing.agentButton,
      color: colors.accent,
      action: 'agent',
    },
  ];

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

  const handlePlanAction = (action: string) => {
    console.log('Plan action:', action, 'Authenticated:', isAuthenticated);

    switch (action) {
      case 'basic':
        // Basic plan - redirect to client space or dashboard
        if (isAuthenticated) {
          router.push('/client-dashboard');
        } else {
          router.push('/client-space');
        }
        break;

      case 'premium':
        // Premium Tracking - redirect to subscription confirmation
        router.push('/subscription-confirm?plan=premium_tracking');
        break;

      case 'enterprise':
        // Enterprise Logistics - redirect to contact page
        router.push('/contact');
        break;

      case 'agent':
        // Agent Listing - redirect to become-agent page
        router.push('/become-agent');
        break;

      default:
        console.log('Unknown action:', action);
    }
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title={t.pricing.title} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.plansContainer}>
          {plans.map((plan, index) => (
            <React.Fragment key={index}>
              <View
                style={[
                  styles.planCard,
                  { backgroundColor: theme.colors.card },
                  plan.id === 'premium' && styles.popularPlan,
                  plan.id === 'agent' && styles.agentPlan,
                ]}
              >
                {plan.id === 'premium' && (
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

                {plan.id === 'agent' && (
                  <View style={[styles.agentBadge, { backgroundColor: colors.accent }]}>
                    <IconSymbol
                      ios_icon_name="handshake"
                      android_material_icon_name="handshake"
                      size={14}
                      color="#ffffff"
                    />
                    <Text style={styles.agentBadgeText}>Partner Program</Text>
                  </View>
                )}
                
                <Text style={[styles.planName, { color: plan.color }]}>
                  {plan.title}
                </Text>
                
                <Text style={[styles.planPrice, { color: theme.colors.text }]}>
                  {plan.price}
                </Text>
                
                <Text style={[styles.planDescription, { color: colors.textSecondary }]}>
                  {plan.description}
                </Text>

                <View style={styles.divider} />

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, featureIndex) => (
                    <React.Fragment key={featureIndex}>
                      <View style={styles.featureItem}>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check_circle"
                          size={20}
                          color={plan.id === 'agent' ? colors.accent : colors.success}
                        />
                        <Text style={[styles.featureText, { color: theme.colors.text }]}>
                          {feature}
                        </Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    { 
                      backgroundColor: plan.id === 'premium' ? colors.primary : plan.id === 'agent' ? colors.accent : plan.color,
                    },
                  ]}
                  onPress={() => handlePlanAction(plan.action)}
                >
                  <Text style={styles.selectButtonText}>{plan.buttonText}</Text>
                  <IconSymbol
                    ios_icon_name="arrow.right"
                    android_material_icon_name="arrow_forward"
                    size={18}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>
            </React.Fragment>
          ))}
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
  agentPlan: {
    borderWidth: 2,
    borderColor: colors.accent,
    boxShadow: '0px 6px 16px rgba(255, 152, 0, 0.2)',
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
  agentBadge: {
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
  agentBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  planName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  planDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
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
