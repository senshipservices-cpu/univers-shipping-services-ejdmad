
/**
 * Application Configuration
 * Centralized configuration for environment-specific settings
 * 
 * This module provides:
 * - Environment detection (dev/staging vs production)
 * - Conditional logging based on environment
 * - Access to environment variables
 * - Feature flags based on environment
 * - Payment provider configuration (Stripe/PayPal)
 */

import Constants from 'expo-constants';

// Get environment from environment variables
const APP_ENV = process.env.APP_ENV || 
                Constants.expoConfig?.extra?.appEnv || 
                process.env.NODE_ENV || 
                'dev';

// Environment flags
const isProduction = APP_ENV === 'production';
const isDev = !isProduction;

/**
 * Get environment variable with fallback
 * Tries multiple sources in order of priority
 */
function getEnvVar(key: string, fallback: string = ''): string {
  // Try process.env first (for web and development)
  if (process.env[key]) {
    return process.env[key] as string;
  }
  
  // Try Constants.expoConfig.extra (for native apps)
  const extraKey = key.replace('EXPO_PUBLIC_', '').toLowerCase().replace(/_/g, '');
  if (Constants.expoConfig?.extra?.[extraKey]) {
    return Constants.expoConfig.extra[extraKey] as string;
  }
  
  // Return fallback
  return fallback;
}

/**
 * Environment Variables
 * All sensitive keys should be accessed through this configuration
 */
export const env = {
  // App Environment
  APP_ENV,
  
  // Supabase Configuration
  // Note: Using EXPO_PUBLIC_ prefix for frontend-accessible variables
  SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'https://lnfsjpuffrcyenuuoxxk.supabase.co'),
  
  SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZnNqcHVmZnJjeWVudXVveHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTMxNzMsImV4cCI6MjA3ODk4OTE3M30.Q-NG1rOvLUhf5j38qZB19o_ZM5CunvgjPWe85NMbmNU'),
  
  // Service key is backend-only (no EXPO_PUBLIC prefix)
  SUPABASE_SERVICE_KEY: getEnvVar('SERVICE_ROLE_KEY', ''),
  
  // Stripe Configuration (Legacy - kept for backward compatibility)
  STRIPE_PUBLIC_KEY: getEnvVar('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY', ''),
  STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY', ''),
  STRIPE_WEBHOOK_SECRET: getEnvVar('STRIPE_WEBHOOK_SECRET', ''),
  
  // PayPal Configuration
  PAYPAL_CLIENT_ID: getEnvVar('EXPO_PUBLIC_PAYPAL_CLIENT_ID', ''),
  PAYPAL_CLIENT_SECRET: getEnvVar('PAYPAL_CLIENT_SECRET', ''),
  PAYPAL_WEBHOOK_ID: getEnvVar('PAYPAL_WEBHOOK_ID', ''),
  PAYPAL_ENV: getEnvVar('PAYPAL_ENV', isDev ? 'sandbox' : 'live'),
  
  // Payment Provider Configuration
  PAYMENT_PROVIDER: getEnvVar('PAYMENT_PROVIDER', 'paypal'), // 'stripe' or 'paypal'
  
  // Google Maps Configuration
  GOOGLE_MAPS_API_KEY: getEnvVar('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY', ''),
  
  // SMTP Configuration
  SMTP_HOST: getEnvVar('SMTP_HOST', ''),
  SMTP_PORT: getEnvVar('SMTP_PORT', '587'),
  SMTP_USERNAME: getEnvVar('SMTP_USERNAME', ''),
  SMTP_PASSWORD: getEnvVar('SMTP_PASSWORD', ''),
  
  // Admin Configuration
  ADMIN_EMAILS: getEnvVar('ADMIN_EMAILS', 'cheikh@universalshipping.com')
    .split(',')
    .map(email => email.trim()),
};

/**
 * Payment Configuration
 * Centralized payment provider settings
 */
export const payment = {
  // Active payment provider
  provider: env.PAYMENT_PROVIDER as 'stripe' | 'paypal',
  
  // PayPal configuration
  paypal: {
    clientId: env.PAYPAL_CLIENT_ID,
    environment: env.PAYPAL_ENV as 'sandbox' | 'live',
    isSandbox: env.PAYPAL_ENV === 'sandbox',
    isLive: env.PAYPAL_ENV === 'live',
    apiUrl: env.PAYPAL_ENV === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com',
  },
  
  // Stripe configuration (legacy)
  stripe: {
    publishableKey: env.STRIPE_PUBLIC_KEY,
    isTestMode: env.STRIPE_PUBLIC_KEY.startsWith('pk_test_'),
    isLiveMode: env.STRIPE_PUBLIC_KEY.startsWith('pk_live_'),
  },
  
  // Helper to check if payment provider is configured
  isConfigured: () => {
    if (env.PAYMENT_PROVIDER === 'paypal') {
      return !!env.PAYPAL_CLIENT_ID;
    } else if (env.PAYMENT_PROVIDER === 'stripe') {
      return !!env.STRIPE_PUBLIC_KEY;
    }
    return false;
  },
};

/**
 * Conditional Logger
 * Only logs in development mode, suppresses logs in production
 */
export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log('[APP]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDev) {
      console.info('[INFO]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    // Always log warnings, even in production
    console.warn('[WARN]', ...args);
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error('[ERROR]', ...args);
  },
  
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug('[DEBUG]', ...args);
    }
  },
  
  // Essential logs that should appear in production (e.g., critical errors)
  essential: (...args: any[]) => {
    console.log('[ESSENTIAL]', ...args);
  },
  
  // Payment-specific logging (never log sensitive data in production)
  payment: (...args: any[]) => {
    if (isDev) {
      console.log('[PAYMENT]', ...args);
    }
  },
};

/**
 * Feature Flags
 * Enable/disable features based on environment
 */
export const features = {
  // Payment features
  enableStripePayments: env.PAYMENT_PROVIDER === 'stripe' && !!env.STRIPE_PUBLIC_KEY,
  enablePayPalPayments: env.PAYMENT_PROVIDER === 'paypal' && !!env.PAYPAL_CLIENT_ID,
  enableTestMode: isDev,
  
  // Logging and debugging
  enableVerboseLogging: isDev,
  enableErrorReporting: isProduction,
  
  // API features
  enableRateLimiting: isProduction,
  enableCaching: isProduction,
  
  // UI features
  showDebugInfo: isDev,
  enableBetaFeatures: isDev,
};

/**
 * API Configuration
 * Backend URLs and endpoints based on environment
 */
export const api = {
  // Supabase
  supabaseUrl: env.SUPABASE_URL,
  supabaseAnonKey: env.SUPABASE_ANON_KEY,
  
  // Payment providers
  paypalClientId: env.PAYPAL_CLIENT_ID,
  paypalApiUrl: payment.paypal.apiUrl,
  stripePublicKey: env.STRIPE_PUBLIC_KEY,
  
  // Timeouts
  defaultTimeout: isProduction ? 30000 : 60000, // 30s prod, 60s dev
  uploadTimeout: isProduction ? 120000 : 300000, // 2min prod, 5min dev
};

/**
 * Validation
 * Check if required environment variables are set
 */
export const validateConfig = (): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required variables
  if (!env.SUPABASE_URL || env.SUPABASE_URL === '') {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is not set');
  } else if (!env.SUPABASE_URL.startsWith('http://') && !env.SUPABASE_URL.startsWith('https://')) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL');
  }
  
  if (!env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY === '') {
    errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is not set');
  }
  
  // Payment provider validation
  if (!env.PAYMENT_PROVIDER) {
    warnings.push('PAYMENT_PROVIDER is not set - defaulting to PayPal');
  }
  
  if (env.PAYMENT_PROVIDER === 'paypal') {
    if (!env.PAYPAL_CLIENT_ID) {
      errors.push('EXPO_PUBLIC_PAYPAL_CLIENT_ID is not set but PayPal is the active payment provider');
    }
    
    if (!env.PAYPAL_CLIENT_SECRET && isProduction) {
      errors.push('PAYPAL_CLIENT_SECRET is not set - required for backend operations');
    }
    
    if (!env.PAYPAL_WEBHOOK_ID && isProduction) {
      warnings.push('PAYPAL_WEBHOOK_ID is not set - webhook verification will be limited');
    }
    
    // Environment consistency check
    if (isProduction && env.PAYPAL_ENV === 'sandbox') {
      warnings.push('Using PayPal SANDBOX in production environment - this should be changed to "live"');
    }
    
    if (!isProduction && env.PAYPAL_ENV === 'live') {
      warnings.push('Using PayPal LIVE in development environment - consider using "sandbox" for testing');
    }
  } else if (env.PAYMENT_PROVIDER === 'stripe') {
    if (!env.STRIPE_PUBLIC_KEY) {
      warnings.push('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set but Stripe is the active payment provider');
    }
    
    if (env.STRIPE_PUBLIC_KEY) {
      const isTestKey = env.STRIPE_PUBLIC_KEY.startsWith('pk_test_');
      const isLiveKey = env.STRIPE_PUBLIC_KEY.startsWith('pk_live_');
      
      if (!isTestKey && !isLiveKey) {
        errors.push('Invalid Stripe public key format');
      }
      
      if (isProduction && isTestKey) {
        warnings.push('Using Stripe test key in production environment');
      }
      
      if (!isProduction && isLiveKey) {
        warnings.push('Using Stripe live key in development environment');
      }
    }
  }
  
  // Google Maps validation
  if (!env.GOOGLE_MAPS_API_KEY && isDev) {
    warnings.push('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is not set - map features will be limited');
  }
  
  // SMTP validation
  if (!env.SMTP_HOST && isProduction) {
    warnings.push('SMTP configuration is not set - email features will not work');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Main Configuration Export
 */
const appConfig = {
  // Environment
  appEnv: APP_ENV,
  isProduction,
  isDev,
  
  // Payment provider
  paymentProvider: env.PAYMENT_PROVIDER as 'stripe' | 'paypal',
  paypalEnv: env.PAYPAL_ENV as 'sandbox' | 'live',
  
  // Environment variables
  env,
  
  // Payment configuration
  payment,
  
  // Logger
  logger,
  
  // Features
  features,
  
  // API configuration
  api,
  
  // Validation
  validateConfig,
};

export default appConfig;
