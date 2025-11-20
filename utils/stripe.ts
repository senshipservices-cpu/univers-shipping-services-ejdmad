
/**
 * Stripe Utility Functions
 * 
 * This file contains utility functions for Stripe integration.
 * For server-side operations, use Stripe Edge Functions with the STRIPE_SECRET_KEY.
 */

import Constants from 'expo-constants';

/**
 * Get Stripe publishable key from environment
 */
export const getStripePublishableKey = (): string | null => {
  return Constants.expoConfig?.extra?.stripePublishableKey || 
         process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
         null;
};

/**
 * Format price for display
 */
export const formatPrice = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Get billing period label
 */
export const getBillingPeriodLabel = (period: string, language: string = 'fr'): string => {
  const labels: Record<string, Record<string, string>> = {
    one_time: {
      fr: 'Paiement unique',
      en: 'One-time payment',
      es: 'Pago único',
      ar: 'دفعة واحدة',
    },
    monthly: {
      fr: 'Par mois',
      en: 'Per month',
      es: 'Por mes',
      ar: 'شهريا',
    },
    yearly: {
      fr: 'Par an',
      en: 'Per year',
      es: 'Por año',
      ar: 'سنويا',
    },
  };

  return labels[period]?.[language] || labels[period]?.['en'] || period;
};

/**
 * Validate Stripe publishable key format
 */
export const isValidStripePublishableKey = (key: string): boolean => {
  return key.startsWith('pk_test_') || key.startsWith('pk_live_');
};

/**
 * Check if Stripe is in test mode
 */
export const isStripeTestMode = (key: string): boolean => {
  return key.startsWith('pk_test_');
};
