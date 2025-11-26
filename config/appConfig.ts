
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
 * - Admin role management
 * 
 * FIXED: Removed recursive calls and circular dependencies
 */

import Constants from 'expo-constants';

// Get environment from environment variables (simple, no recursion)
const APP_ENV = process.env.APP_ENV || 
                process.env.NODE_ENV || 
                'dev';

// Environment flags
const isProduction = APP_ENV === 'production';
const isDevelopment = !isProduction;

/**
 * Simple environment variable cache
 * Prevents recursive lookups
 */
const envCache: Record<string, string> = {};
let cacheInitialized = false;

/**
 * Initialize cache once at startup
 * This prevents recursive calls during property access
 */
function initializeCache() {
  if (cacheInitialized) {
    return;
  }
  
  cacheInitialized = true;
  
  try {
    // Pre-populate cache with all known environment variables
    const envVars = [
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      'SERVICE_ROLE_KEY',
      'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'EXPO_PUBLIC_PAYPAL_CLIENT_ID',
      'PAYPAL_CLIENT_SECRET',
      'PAYPAL_WEBHOOK_ID',
      'PAYPAL_ENV',
      'PAYMENT_PROVIDER',
      'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USERNAME',
      'SMTP_PASSWORD',
      'ADMIN_EMAILS',
    ];
    
    envVars.forEach(key => {
      // Try process.env first
      if (process.env[key]) {
        envCache[key] = process.env[key] as string;
      } else {
        // Try Constants.expoConfig.extra
        const extraKey = key.replace('EXPO_PUBLIC_', '').toLowerCase().replace(/_/g, '');
        if (Constants.expoConfig?.extra?.[extraKey]) {
          envCache[key] = String(Constants.expoConfig.extra[extraKey]);
        }
      }
    });
    
    console.log('[CONFIG] Environment cache initialized');
  } catch (error) {
    console.error('[CONFIG] Error initializing cache:', error);
  }
}

/**
 * Get environment variable with fallback
 * Uses pre-initialized cache to prevent recursion
 */
function getEnvVar(key: string, fallback: string = ''): string {
  // Initialize cache on first call
  if (!cacheInitialized) {
    initializeCache();
  }
  
  // Return cached value or fallback
  return envCache[key] || fallback;
}

/**
 * Environment Variables
 * All sensitive keys should be accessed through this configuration
 * 
 * FIXED: Using lazy getters to prevent initialization loops
 */
export const env = {
  // App Environment
  get APP_ENV() { return APP_ENV; },
  
  // Supabase Configuration
  get SUPABASE_URL() { 
    return getEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'https://lnfsjpuffrcyenuuoxxk.supabase.co');
  },
  
  get SUPABASE_ANON_KEY() { 
    return getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZnNqcHVmZnJjeWVudXVveHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTMxNzMsImV4cCI6MjA3ODk4OTE3M30.Q-NG1rOvLUhf5j38qZB19o_ZM5CunvgjPWe85NMbmNU');
  },
  
  // Service key is backend-only (no EXPO_PUBLIC prefix)
  get SUPABASE_SERVICE_KEY() { 
    return getEnvVar('SERVICE_ROLE_KEY', '');
  },
  
  // Stripe Configuration (Legacy - kept for backward compatibility)
  get STRIPE_PUBLIC_KEY() { 
    return getEnvVar('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY', '');
  },
  
  get STRIPE_SECRET_KEY() { 
    return getEnvVar('STRIPE_SECRET_KEY', '');
  },
  
  get STRIPE_WEBHOOK_SECRET() { 
    return getEnvVar('STRIPE_WEBHOOK_SECRET', '');
  },
  
  // PayPal Configuration
  get PAYPAL_CLIENT_ID() { 
    return getEnvVar('EXPO_PUBLIC_PAYPAL_CLIENT_ID', '');
  },
  
  get PAYPAL_CLIENT_SECRET() { 
    return getEnvVar('PAYPAL_CLIENT_SECRET', '');
  },
  
  get PAYPAL_WEBHOOK_ID() { 
    return getEnvVar('PAYPAL_WEBHOOK_ID', '');
  },
  
  get PAYPAL_ENV() { 
    return getEnvVar('PAYPAL_ENV', isDevelopment ? 'sandbox' : 'live');
  },
  
  // Payment Provider Configuration
  get PAYMENT_PROVIDER() { 
    return getEnvVar('PAYMENT_PROVIDER', 'paypal');
  },
  
  // Google Maps Configuration
  get GOOGLE_MAPS_API_KEY() { 
    return getEnvVar('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY', '');
  },
  
  // SMTP Configuration
  get SMTP_HOST() { 
    return getEnvVar('SMTP_HOST', '');
  },
  
  get SMTP_PORT() { 
    return getEnvVar('SMTP_PORT', '587');
  },
  
  get SMTP_USERNAME() { 
    return getEnvVar('SMTP_USERNAME', '');
  },
  
  get SMTP_PASSWORD() { 
    return getEnvVar('SMTP_PASSWORD', '');
  },
  
  // Admin Configuration
  get ADMIN_EMAILS() {
    return getEnvVar('ADMIN_EMAILS', 'cheikh@universalshipping.com')
      .split(',')
      .map(email => email.trim().toLowerCase());
  },
};

/**
 * Admin Role Management
 * Check if a user email is in the admin list
 */
export const isAdmin = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;
  const normalizedEmail = userEmail.trim().toLowerCase();
  return env.ADMIN_EMAILS.includes(normalizedEmail);
};

/**
 * Payment Configuration
 * Centralized payment provider settings
 */
export const payment = {
  // Active payment provider
  get provider() { 
    return env.PAYMENT_PROVIDER as 'stripe' | 'paypal';
  },
  
  // PayPal configuration
  paypal: {
    get clientId() { return env.PAYPAL_CLIENT_ID; },
    get environment() { return env.PAYPAL_ENV as 'sandbox' | 'live'; },
    get isSandbox() { return env.PAYPAL_ENV === 'sandbox'; },
    get isLive() { return env.PAYPAL_ENV === 'live'; },
    get apiUrl() { 
      return env.PAYPAL_ENV === 'sandbox' 
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';
    },
  },
  
  // Stripe configuration (legacy)
  stripe: {
    get publishableKey() { return env.STRIPE_PUBLIC_KEY; },
    get isTestMode() { return env.STRIPE_PUBLIC_KEY.startsWith('pk_test_'); },
    get isLiveMode() { return env.STRIPE_PUBLIC_KEY.startsWith('pk_live_'); },
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
    if (isDevelopment) {
      console.log('[APP]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
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
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },
  
  // Essential logs that should appear in production (e.g., critical errors)
  essential: (...args: any[]) => {
    console.log('[ESSENTIAL]', ...args);
  },
  
  // Payment-specific logging (never log sensitive data in production)
  payment: (...args: any[]) => {
    if (isDevelopment) {
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
  get enableStripePayments() { 
    return env.PAYMENT_PROVIDER === 'stripe' && !!env.STRIPE_PUBLIC_KEY;
  },
  get enablePayPalPayments() { 
    return env.PAYMENT_PROVIDER === 'paypal' && !!env.PAYPAL_CLIENT_ID;
  },
  enableTestMode: isDevelopment,
  
  // Logging and debugging
  enableVerboseLogging: isDevelopment,
  enableErrorReporting: isProduction,
  
  // API features
  enableRateLimiting: isProduction,
  enableCaching: isProduction,
  
  // UI features
  showDebugInfo: isDevelopment,
  enableBetaFeatures: isDevelopment,
};

/**
 * API Configuration
 * Backend URLs and endpoints based on environment
 */
export const api = {
  // Supabase
  get supabaseUrl() { return env.SUPABASE_URL; },
  get supabaseAnonKey() { return env.SUPABASE_ANON_KEY; },
  
  // Payment providers
  get paypalClientId() { return env.PAYPAL_CLIENT_ID; },
  get paypalApiUrl() { return payment.paypal.apiUrl; },
  get stripePublicKey() { return env.STRIPE_PUBLIC_KEY; },
  
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
  if (!env.GOOGLE_MAPS_API_KEY && isDevelopment) {
    warnings.push('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is not set - map features will be limited');
  }
  
  // SMTP validation
  if (!env.SMTP_HOST && isProduction) {
    warnings.push('SMTP configuration is not set - email features will not work');
  }
  
  // Admin emails validation
  if (env.ADMIN_EMAILS.length === 0 || (env.ADMIN_EMAILS.length === 1 && env.ADMIN_EMAILS[0] === '')) {
    warnings.push('ADMIN_EMAILS is not set - no admin users configured');
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
  isDevelopment,
  isDev: isDevelopment, // Alias for compatibility
  
  // Payment provider
  get paymentProvider() { return env.PAYMENT_PROVIDER as 'stripe' | 'paypal'; },
  get paypalEnv() { return env.PAYPAL_ENV as 'sandbox' | 'live'; },
  
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
  
  // Admin role management
  isAdmin,
};

export default appConfig;
