
/**
 * Application Configuration
 * Centralized configuration for environment-specific settings
 */

import Constants from 'expo-constants';

/**
 * Check if a value is a valid environment variable value
 */
function isValidValue(value: any): boolean {
  if (!value) return false;
  if (typeof value !== 'string') return false;
  if (value === '') return false;
  if (value.trim() === '') return false;
  // Check for placeholder patterns
  if (value.startsWith('${') && value.endsWith('}')) return false;
  if (value === 'YOUR_SUPABASE_URL') return false;
  if (value === 'YOUR_SUPABASE_ANON_KEY') return false;
  if (value === 'placeholder') return false;
  if (value.includes('placeholder')) return false;
  return true;
}

/**
 * Get environment variable with fallback
 * Simplified version that works better with Natively
 */
function getEnvVar(key: string, fallback: string = ''): string {
  try {
    // Log what we're looking for
    console.log(`[ENV] Looking for: ${key}`);
    
    // Try Constants.expoConfig.extra first (Natively environment variables)
    if (Constants.expoConfig?.extra) {
      console.log(`[ENV] Constants.expoConfig.extra available`);
      console.log(`[ENV] Available keys:`, Object.keys(Constants.expoConfig.extra));
      
      // Try exact match first
      const exactValue = Constants.expoConfig.extra[key];
      console.log(`[ENV] ${key} exact match:`, exactValue ? 'Found' : 'Not found');
      if (isValidValue(exactValue)) {
        console.log(`[ENV] ✓ Using ${key} from Constants.expoConfig.extra`);
        return String(exactValue);
      }
      
      // Try without EXPO_PUBLIC_ prefix
      const withoutPrefix = key.replace('EXPO_PUBLIC_', '');
      const withoutPrefixValue = Constants.expoConfig.extra[withoutPrefix];
      console.log(`[ENV] ${withoutPrefix} match:`, withoutPrefixValue ? 'Found' : 'Not found');
      if (isValidValue(withoutPrefixValue)) {
        console.log(`[ENV] ✓ Using ${withoutPrefix} from Constants.expoConfig.extra`);
        return String(withoutPrefixValue);
      }
      
      // Try camelCase version
      const camelKey = withoutPrefix
        .toLowerCase()
        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      const camelValue = Constants.expoConfig.extra[camelKey];
      console.log(`[ENV] ${camelKey} (camelCase) match:`, camelValue ? 'Found' : 'Not found');
      if (isValidValue(camelValue)) {
        console.log(`[ENV] ✓ Using ${camelKey} from Constants.expoConfig.extra`);
        return String(camelValue);
      }
      
      // Try lowercase version
      const lowerKey = withoutPrefix.toLowerCase();
      const lowerValue = Constants.expoConfig.extra[lowerKey];
      console.log(`[ENV] ${lowerKey} (lowercase) match:`, lowerValue ? 'Found' : 'Not found');
      if (isValidValue(lowerValue)) {
        console.log(`[ENV] ✓ Using ${lowerKey} from Constants.expoConfig.extra`);
        return String(lowerValue);
      }
    } else {
      console.log(`[ENV] Constants.expoConfig.extra NOT available`);
    }
    
    // Try process.env (for local development)
    if (typeof process !== 'undefined' && process.env) {
      console.log(`[ENV] Trying process.env for ${key}`);
      const envValue = process.env[key];
      if (isValidValue(envValue)) {
        console.log(`[ENV] ✓ Using ${key} from process.env`);
        return String(envValue);
      }
    }
    
    console.log(`[ENV] ✗ ${key} not found, using fallback`);
  } catch (error) {
    console.error(`[ENV] Error getting environment variable ${key}:`, error);
  }
  
  return fallback;
}

// Get environment from environment variables
const APP_ENV = getEnvVar('APP_ENV', 'dev');

// Environment flags
const isProduction = APP_ENV === 'production' || APP_ENV === 'PRODUCTION';
const isDev = !isProduction;

/**
 * Environment Variables
 */
export const env = {
  APP_ENV,
  
  // Supabase Configuration
  SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', ''),
  SUPABASE_SERVICE_KEY: getEnvVar('SUPABASE_SERVICE_KEY', ''),
  
  // Stripe Configuration
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
 * Conditional Logger
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
    console.warn('[WARN]', ...args);
  },
  
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
  
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug('[DEBUG]', ...args);
    }
  },
  
  essential: (...args: any[]) => {
    console.log('[ESSENTIAL]', ...args);
  },
  
  payment: (...args: any[]) => {
    if (isDev) {
      console.log('[PAYMENT]', ...args);
    }
  },
};

// Log configuration status on startup
logger.essential('=== Configuration Status ===');
logger.essential('Environment:', APP_ENV);
logger.essential('Is Production:', isProduction);
logger.essential('Supabase URL:', env.SUPABASE_URL ? `✓ Set (${env.SUPABASE_URL.substring(0, 30)}...)` : '✗ Missing');
logger.essential('Supabase Anon Key:', env.SUPABASE_ANON_KEY ? `✓ Set (${env.SUPABASE_ANON_KEY.substring(0, 20)}...)` : '✗ Missing');
logger.essential('Payment Provider:', env.PAYMENT_PROVIDER);
logger.essential('PayPal Client ID:', env.PAYPAL_CLIENT_ID ? '✓ Set' : '✗ Missing');
logger.essential('PayPal Environment:', env.PAYPAL_ENV);
logger.essential('Google Maps API Key:', env.GOOGLE_MAPS_API_KEY ? '✓ Set' : '✗ Missing');
logger.essential('===========================');

/**
 * Payment Configuration
 */
export const payment = {
  provider: env.PAYMENT_PROVIDER as 'stripe' | 'paypal',
  
  paypal: {
    clientId: env.PAYPAL_CLIENT_ID,
    environment: env.PAYPAL_ENV as 'sandbox' | 'live',
    isSandbox: env.PAYPAL_ENV === 'sandbox',
    isLive: env.PAYPAL_ENV === 'live',
    apiUrl: env.PAYPAL_ENV === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com',
  },
  
  stripe: {
    publishableKey: env.STRIPE_PUBLIC_KEY,
    isTestMode: env.STRIPE_PUBLIC_KEY.startsWith('pk_test_'),
    isLiveMode: env.STRIPE_PUBLIC_KEY.startsWith('pk_live_'),
  },
  
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
 */
export const smtp = {
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT, 10) || 587,
  username: env.SMTP_USERNAME,
  password: env.SMTP_PASSWORD,
  
  isConfigured: () => {
    return !!(env.SMTP_HOST && env.SMTP_USERNAME && env.SMTP_PASSWORD);
  },
};

/**
 * Admin Configuration
 */
export const admin = {
  emails: env.ADMIN_EMAILS,
  
  isAdminEmail: (email: string): boolean => {
    if (!email) return false;
    const normalizedEmail = email.toLowerCase().trim();
    return env.ADMIN_EMAILS.some(adminEmail => 
      adminEmail.toLowerCase().trim() === normalizedEmail
    );
  },
};

/**
 * Feature Flags
 */
export const features = {
  enableStripePayments: env.PAYMENT_PROVIDER === 'stripe' && !!env.STRIPE_PUBLIC_KEY,
  enablePayPalPayments: env.PAYMENT_PROVIDER === 'paypal' && !!env.PAYPAL_CLIENT_ID,
  enableTestMode: isDev,
  enableVerboseLogging: isDev,
  enableErrorReporting: isProduction,
  enableRateLimiting: isProduction,
  enableCaching: isProduction,
  showDebugInfo: isDev,
  enableBetaFeatures: isDev,
};

/**
 * API Configuration
 */
export const api = {
  supabaseUrl: env.SUPABASE_URL,
  supabaseAnonKey: env.SUPABASE_ANON_KEY,
  paypalClientId: env.PAYPAL_CLIENT_ID,
  paypalApiUrl: payment.paypal.apiUrl,
  stripePublicKey: env.STRIPE_PUBLIC_KEY,
  defaultTimeout: isProduction ? 30000 : 60000,
  uploadTimeout: isProduction ? 120000 : 300000,
};

/**
 * Validation
 */
export const validateConfig = (): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required variables
  if (!env.SUPABASE_URL || env.SUPABASE_URL === '') {
    errors.push('SUPABASE_URL is not set. Please set EXPO_PUBLIC_SUPABASE_URL in your environment variables.');
  } else if (!env.SUPABASE_URL.startsWith('http://') && !env.SUPABASE_URL.startsWith('https://')) {
    errors.push(`SUPABASE_URL must be a valid HTTP or HTTPS URL. Current value: "${env.SUPABASE_URL}"`);
  }
  
  if (!env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY === '') {
    errors.push('SUPABASE_ANON_KEY is not set. Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
  }
  
  // Payment provider validation
  if (!env.PAYMENT_PROVIDER) {
    warnings.push('PAYMENT_PROVIDER is not set - defaulting to PayPal');
  }
  
  if (env.PAYMENT_PROVIDER === 'paypal') {
    if (!env.PAYPAL_CLIENT_ID) {
      warnings.push('PAYPAL_CLIENT_ID is not set but PayPal is the active payment provider');
    }
    
    if (!env.PAYPAL_CLIENT_SECRET && isProduction) {
      warnings.push('PAYPAL_CLIENT_SECRET is not set - required for backend operations');
    }
    
    if (!env.PAYPAL_WEBHOOK_ID && isProduction) {
      warnings.push('PAYPAL_WEBHOOK_ID is not set - webhook verification will be limited');
    }
    
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
  
  if (!env.GOOGLE_MAPS_API_KEY && isDev) {
    warnings.push('GOOGLE_MAPS_API_KEY is not set - map features will be limited');
  }
  
  if (!smtp.isConfigured() && isProduction) {
    warnings.push('SMTP configuration is not complete - email features will not work');
  }
  
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
  appEnv: APP_ENV,
  isProduction,
  isDev,
  paymentProvider: env.PAYMENT_PROVIDER as 'stripe' | 'paypal',
  paypalEnv: env.PAYPAL_ENV as 'sandbox' | 'live',
  env,
  payment,
  smtp,
  admin,
  adminEmails: env.ADMIN_EMAILS,
  logger,
  features,
  api,
  validateConfig,
};

export default appConfig;
