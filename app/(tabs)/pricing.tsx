
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";

interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  color: string;
  popular?: boolean;
}

export default function PricingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const plans: PricingPlan[] = [
    {
      name: "Basic",
      price: "Contact Us",
      features: [
        "Standard shipping rates",
        "Basic tracking",
        "Email support",
        "Document management",
      ],
      color: colors.textSecondary,
    },
    {
      name: "Professional",
      price: "Contact Us",
      features: [
        "Discounted shipping rates",
        "Priority tracking",
        "24/7 phone support",
        "Advanced document management",
        "Dedicated account manager",
        "Custom reporting",
      ],
      color: colors.primary,
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Volume-based pricing",
        "Real-time tracking API",
        "Priority support",
        "Full document automation",
        "Multiple account managers",
        "Custom integrations",
        "SLA guarantees",
      ],
      color: colors.secondary,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t.pricing.title}
        </Text>
        <View style={{ width: 28 }} />
      </View>

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
            color={colors.secondary}
          />
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            {t.pricing.subtitle}
          </Text>
          <Text style={styles.description}>
            Flexible pricing plans tailored to your business needs
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan, index) => (
            <React.Fragment key={index}>
              <View
                style={[
                  styles.planCard,
                  { backgroundColor: theme.colors.card },
                  plan.popular && styles.popularPlan,
                ]}
              >
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                  </View>
                )}
                <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                <Text style={[styles.planPrice, { color: theme.colors.text }]}>
                  {plan.price}
                </Text>
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, featureIndex) => (
                    <React.Fragment key={featureIndex}>
                      <View style={styles.featureItem}>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check_circle"
                          size={20}
                          color={colors.accent}
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
                    { backgroundColor: plan.popular ? colors.primary : colors.textSecondary },
                  ]}
                  onPress={() => setShowQuoteForm(true)}
                >
                  <Text style={styles.selectButtonText}>Select Plan</Text>
                </TouchableOpacity>
              </View>
            </React.Fragment>
          ))}
        </View>

        {showQuoteForm && (
          <View style={styles.quoteFormSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t.pricing.getQuote}
            </Text>
            <View style={[styles.quoteForm, { backgroundColor: theme.colors.card }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Company Name
                </Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Your company name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Email</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="your.email@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Monthly Shipment Volume
                </Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Estimated number of shipments"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={() => console.log('Quote requested')}
              >
                <Text style={styles.submitButtonText}>Request Quote</Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow_forward"
                  size={20}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!showQuoteForm && (
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={[styles.quoteButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowQuoteForm(true)}
            >
              <Text style={styles.quoteButtonText}>{t.pricing.getQuote}</Text>
              <IconSymbol
                ios_icon_name="arrow.right"
                android_material_icon_name="arrow_forward"
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  plansContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    padding: 24,
    borderRadius: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
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
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularBadgeText: {
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
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  selectButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  quoteFormSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  quoteForm: {
    padding: 24,
    borderRadius: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  quoteButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
