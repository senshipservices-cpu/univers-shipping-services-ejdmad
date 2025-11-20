
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
 * Environment Variables
 * All sensitive keys should be accessed through this configuration
 */
export const env = {
  // App Environment
  APP_ENV,
  
  // Supabase Configuration
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 
                Constants.expoConfig?.extra?.supabaseUrl || 
                'https://lnfsjpuffrcyenuuoxxk.supabase.co',
  
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                     Constants.expoConfig?.extra?.supabaseAnonKey || 
                     '',
  
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  
  // Stripe Configuration
  STRIPE_PUBLIC_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
                     Constants.expoConfig?.extra?.stripePublishableKey || 
                     '',
  
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Google Maps Configuration
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 
                       Constants.expoConfig?.extra?.googleMapsApiKey || 
                       '',
  
  // SMTP Configuration
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USERNAME: process.env.SMTP_USERNAME || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  
  // Admin Configuration
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || 'cheikh@universalshipping.com')
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
  if (!env.SUPABASE_URL) {
    errors.push('SUPABASE_URL is not set');
  }
  
  if (!env.SUPABASE_ANON_KEY) {
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
