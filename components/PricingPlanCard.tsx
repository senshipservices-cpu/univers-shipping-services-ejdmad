
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatPrice, getBillingPeriodLabel } from '@/utils/stripe';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors } from '@/styles/commonStyles';

interface PricingPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price_eur: number;
  currency: string;
  billing_period: 'one_time' | 'monthly' | 'yearly';
  stripe_price_id: string | null;
  is_active: boolean;
}

interface PricingPlanCardProps {
  plan: PricingPlan;
  onSelect: (planCode: string) => void;
  isSelected?: boolean;
  isPopular?: boolean;
}

export const PricingPlanCard: React.FC<PricingPlanCardProps> = ({
  plan,
  onSelect,
  isSelected = false,
  isPopular = false,
}) => {
  const { language } = useLanguage();

  const handlePress = () => {
    onSelect(plan.code);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isPopular && styles.cardPopular,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>
            {language === 'fr' ? 'Populaire' : 'Popular'}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {formatPrice(plan.price_eur, plan.currency)}
          </Text>
          <Text style={styles.billingPeriod}>
            {getBillingPeriodLabel(plan.billing_period, language)}
          </Text>
        </View>
      </View>

      {plan.description && (
        <Text style={styles.description}>{plan.description}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, isSelected && styles.buttonSelected]}
        onPress={handlePress}
      >
        <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
          {isSelected
            ? language === 'fr'
              ? 'Sélectionné'
              : 'Selected'
            : language === 'fr'
            ? 'Choisir ce plan'
            : 'Choose this plan'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight || colors.surface,
  },
  cardPopular: {
    borderColor: colors.accent,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 24,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  header: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  billingPeriod: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: colors.success || colors.primary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextSelected: {
    color: '#FFFFFF',
  },
});
