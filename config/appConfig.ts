
/**
 * Application Configuration
 * Centralized configuration for environment-specific settings
 * 
 * This module provides:
 * - Environment detection (dev/staging vs production)
 * - Conditional logging based on environment
 * - Access to environment variables
 * - Feature flags based on environment
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
  SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'https://lnfsjpuffrcyenuuoxxk.supabase.co'),
  
  SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZnNqcHVmZnJjeWVudXVveHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTMxNzMsImV4cCI6MjA3ODk4OTE3M30.Q-NG1rOvLUhf5j38qZB19o_ZM5CunvgjPWe85NMbmNU'),
  
  SUPABASE_SERVICE_KEY: getEnvVar('SUPABASE_SERVICE_KEY', ''),
  
  // Stripe Configuration
  STRIPE_PUBLIC_KEY: getEnvVar('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY', ''),
  
  STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY', ''),
  STRIPE_WEBHOOK_SECRET: getEnvVar('STRIPE_WEBHOOK_SECRET', ''),
  
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
};

/**
 * Feature Flags
 * Enable/disable features based on environment
 */
export const features = {
  // Payment features
  enableStripePayments: isProduction ? true : true, // Enable in both for testing
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
  
  // Stripe
  stripePublicKey: env.STRIPE_PUBLIC_KEY,
  
  // Timeouts
  defaultTimeout: isProduction ? 30000 : 60000, // 30s prod, 60s dev
  uploadTimeout: isProduction ? 120000 : 300000, // 2min prod, 5min dev
};

/**
 * Validation
 * Check if required environment variables are set
 */
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required variables
  if (!env.SUPABASE_URL || env.SUPABASE_URL === '') {
    errors.push('SUPABASE_URL is not set');
  } else if (!env.SUPABASE_URL.startsWith('http://') && !env.SUPABASE_URL.startsWith('https://')) {
    errors.push('SUPABASE_URL must be a valid HTTP or HTTPS URL');
  }
  
  if (!env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY === '') {
    errors.push('SUPABASE_ANON_KEY is not set');
  }
  
  // Warn about optional but recommended variables
  if (!env.STRIPE_PUBLIC_KEY && isDev) {
    logger.warn('STRIPE_PUBLIC_KEY is not set - payment features will be limited');
  }
  
  if (!env.GOOGLE_MAPS_API_KEY && isDev) {
    logger.warn('GOOGLE_MAPS_API_KEY is not set - map features will be limited');
  }
  
  if (!env.SMTP_HOST && isProduction) {
    logger.warn('SMTP configuration is not set - email features will not work');
  }
  
  return {
    valid: errors.length === 0,
    errors,
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
  
  // Environment variables
  env,
  
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
