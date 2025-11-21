
/**
 * PayPal Utility Functions
 * 
 * This file contains utility functions for PayPal integration.
 * For server-side operations, use PayPal Edge Functions with the PAYPAL_CLIENT_SECRET.
 */

import appConfig from '@/config/appConfig';

/**
 * Get PayPal client ID from environment
 */
export const getPayPalClientId = (): string | null => {
  return appConfig.env.PAYPAL_CLIENT_ID || null;
};

/**
 * Get PayPal environment (sandbox or live)
 */
export const getPayPalEnvironment = (): 'sandbox' | 'live' => {
  return appConfig.payment.paypal.environment;
};

/**
 * Get PayPal API URL based on environment
 */
export const getPayPalApiUrl = (): string => {
  return appConfig.payment.paypal.apiUrl;
};

/**
 * Check if PayPal is in sandbox mode
 */
export const isPayPalSandbox = (): boolean => {
  return appConfig.payment.paypal.isSandbox;
};

/**
 * Check if PayPal is in live mode
 */
export const isPayPalLive = (): boolean => {
  return appConfig.payment.paypal.isLive;
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
 * Validate PayPal client ID format
 */
export const isValidPayPalClientId = (clientId: string): boolean => {
  // PayPal client IDs are typically long alphanumeric strings
  return clientId.length > 20 && /^[A-Za-z0-9_-]+$/.test(clientId);
};

/**
 * Get PayPal currency code
 * PayPal supports many currencies, but some require conversion
 */
export const getPayPalCurrency = (currency: string): string => {
  // PayPal supports EUR, USD, GBP, etc.
  // For unsupported currencies like XOF, you may need to convert to EUR or USD
  const supportedCurrencies = ['EUR', 'USD', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'];
  
  if (supportedCurrencies.includes(currency.toUpperCase())) {
    return currency.toUpperCase();
  }
  
  // Default to EUR for unsupported currencies
  appConfig.logger.warn(`Currency ${currency} not directly supported by PayPal, using EUR`);
  return 'EUR';
};

/**
 * Convert amount to PayPal format
 * PayPal expects amounts as strings with 2 decimal places
 */
export const formatPayPalAmount = (amount: number): string => {
  return amount.toFixed(2);
};

/**
 * Get PayPal SDK script URL
 */
export const getPayPalSdkUrl = (clientId: string, currency: string = 'EUR'): string => {
  const env = getPayPalEnvironment();
  const currencyParam = getPayPalCurrency(currency);
  
  return `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currencyParam}&intent=capture`;
};

/**
 * Log PayPal event (only in development)
 */
export const logPayPalEvent = (event: string, data?: any): void => {
  appConfig.logger.payment('PayPal Event:', event, data);
};
