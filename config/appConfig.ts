
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

/**
 * Get environment variable with fallback
 * Tries multiple sources in order of priority:
 * 1. process.env (for web and Node.js environments)
 * 2. Constants.expoConfig.extra (for native apps via app.json)
 * 3. Fallback value
 */
function getEnvVar(key: string, fallback: string = ''): string {
  // Try process.env first (for web and development)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  
  // Try Constants.expoConfig.extra (for native apps)
  // Remove EXPO_PUBLIC_ prefix and convert to camelCase for extra lookup
  const extraKey = key.replace('EXPO_PUBLIC_', '').toLowerCase().replace(/_/g, '');
  if (Constants.expoConfig?.extra?.[extraKey]) {
    return Constants.expoConfig.extra[extraKey] as string;
  }
  
  // Also try the original key in extra
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key] as string;
  }
  
  // Return fallback
  return fallback;
}

// Get environment from environment variables
const APP_ENV = getEnvVar('APP_ENV', 'dev');

// Environment flags
const isProduction = APP_ENV === 'production' || APP_ENV === 'PRODUCTION';
const isDev = !isProduction;

/**
 * Environment Variables
 * All sensitive keys should be accessed through this configuration
 */
export const env = {
  // App Environment
  APP_ENV,
  
  // Supabase Configuration
  SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', getEnvVar('SUPABASE_URL', '')),
  SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', getEnvVar('SUPABASE_ANON_KEY', '')),
  SUPABASE_SERVICE_KEY: getEnvVar('SUPABASE_SERVICE_KEY', ''),
  
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
  PAYMENT_PROVIDER: getEnvVar('PAYMENT_PROVIDER', 'paypal'),
  
  // Google Maps Configuration
  GOOGLE_MAPS_API_KEY: getEnvVar('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY', ''),
  
  // SMTP Configuration
  SMTP_HOST: getEnvVar('SMTP_HOST', ''),
  SMTP_PORT: getEnvVar('SMTP_PORT', '587'),
  SMTP_USERNAME: getEnvVar('SMTP_USERNAME', ''),
  SMTP_PASSWORD: getEnvVar('SMTP_PASSWORD', ''),
  
  // Admin Configuration
  ADMIN_EMAILS: getEnvVar('ADMIN_EMAILS', '').split(',').map(email => email.trim()).filter(email => email.length > 0),
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
 * SMTP Configuration
 * Email sending configuration
 */
export const smtp = {
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT, 10) || 587,
  username: env.SMTP_USERNAME,
  password: env.SMTP_PASSWORD,
  
  // Helper to check if SMTP is configured
  isConfigured: () => {
    return !!(env.SMTP_HOST && env.SMTP_USERNAME && env.SMTP_PASSWORD);
  },
};

/**
 * Admin Configuration
 * Admin access control
 */
export const admin = {
  emails: env.ADMIN_EMAILS,
  
  // Check if an email is an admin email
  isAdminEmail: (email: string): boolean => {
    if (!email) return false;
    const normalizedEmail = email.toLowerCase().trim();
    return env.ADMIN_EMAILS.some(adminEmail => 
      adminEmail.toLowerCase().trim() === normalizedEmail
    );
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
    errors.push('SUPABASE_URL is not set');
  } else if (!env.SUPABASE_URL.startsWith('http://') && !env.SUPABASE_URL.startsWith('https://')) {
    errors.push('SUPABASE_URL must be a valid HTTP or HTTPS URL');
  }
  
  if (!env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY === '') {
    errors.push('SUPABASE_ANON_KEY is not set');
  }
  
  // Payment provider validation
  if (!env.PAYMENT_PROVIDER) {
    warnings.push('PAYMENT_PROVIDER is not set - defaulting to PayPal');
  }
  
  if (env.PAYMENT_PROVIDER === 'paypal') {
    if (!env.PAYPAL_CLIENT_ID) {
      errors.push('PAYPAL_CLIENT_ID is not set but PayPal is the active payment provider');
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
      warnings.push('STRIPE_PUBLIC_KEY is not set but Stripe is the active payment provider');
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
    warnings.push('GOOGLE_MAPS_API_KEY is not set - map features will be limited');
  }
  
  // SMTP validation
  if (!smtp.isConfigured() && isProduction) {
    warnings.push('SMTP configuration is not complete - email features will not work');
  }
  
  // Admin emails validation
  if (env.ADMIN_EMAILS.length === 0) {
    warnings.push('ADMIN_EMAILS is not set - no admin access will be available');
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
  
  // SMTP configuration
  smtp,
  
  // Admin configuration
  admin,
  adminEmails: env.ADMIN_EMAILS, // Alias for backward compatibility
  
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
