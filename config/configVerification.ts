
/**
 * Configuration Verification Utility
 * Automatically verifies that all required services are properly configured
 */

import appConfig, { logger } from './appConfig';
import { supabase } from '@/app/integrations/supabase/client';

export interface VerificationResult {
  service: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  isCritical?: boolean; // NEW: Flag to indicate if this service is critical
}

/**
 * Verify Supabase Configuration
 * CRITICAL SERVICE - Required for app to function
 */
export const verifySupabase = async (): Promise<VerificationResult> => {
  try {
    logger.debug('Verifying Supabase configuration...');
    
    if (!appConfig.env.SUPABASE_URL || !appConfig.env.SUPABASE_ANON_KEY) {
      return {
        service: 'Supabase',
        status: 'error',
        message: 'Database offline - Supabase credentials not configured',
        isCritical: true,
      };
    }
    
    // Test connection by fetching session
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message !== 'Auth session missing!') {
      return {
        service: 'Supabase',
        status: 'error',
        message: `Database offline - Connection failed: ${error.message}`,
        isCritical: true,
      };
    }
    
    logger.info('Supabase configuration verified successfully');
    return {
      service: 'Supabase',
      status: 'success',
      message: 'Database operational',
      details: {
        url: appConfig.env.SUPABASE_URL,
        hasSession: !!data.session,
      },
      isCritical: true,
    };
  } catch (error) {
    logger.error('Supabase verification failed:', error);
    return {
      service: 'Supabase',
      status: 'error',
      message: `Database offline - Verification failed: ${error}`,
      isCritical: true,
    };
  }
};

/**
 * Verify PayPal Configuration
 * OPTIONAL SERVICE - Not critical for USS app
 */
export const verifyPayPal = async (): Promise<VerificationResult> => {
  try {
    logger.debug('Verifying PayPal configuration...');
    
    const clientId = appConfig.env.PAYPAL_CLIENT_ID;
    const environment = appConfig.env.PAYPAL_ENV;
    
    if (!clientId) {
      return {
        service: 'PayPal',
        status: 'warning',
        message: 'Online payment is optional and disabled.',
        isCritical: false,
      };
    }
    
    // Validate environment setting
    if (environment !== 'sandbox' && environment !== 'live') {
      return {
        service: 'PayPal',
        status: 'warning',
        message: `PayPal configuration issue: Invalid environment "${environment}". Online payment may not work.`,
        isCritical: false,
      };
    }
    
    // Check environment consistency
    if (appConfig.isProduction && environment === 'sandbox') {
      return {
        service: 'PayPal',
        status: 'warning',
        message: 'PayPal is configured in sandbox mode (test payments only).',
        details: {
          environment,
          recommendation: 'Change PAYPAL_ENV to "live" for production',
        },
        isCritical: false,
      };
    }
    
    if (!appConfig.isProduction && environment === 'live') {
      return {
        service: 'PayPal',
        status: 'warning',
        message: 'PayPal is configured in live mode (real payments).',
        details: {
          environment,
          recommendation: 'Consider using "sandbox" for development',
        },
        isCritical: false,
      };
    }
    
    logger.info('PayPal configuration verified successfully');
    return {
      service: 'PayPal',
      status: 'success',
      message: `Online payment available via PayPal (${environment} mode)`,
      details: {
        environment,
        clientIdPrefix: clientId.substring(0, 12) + '...',
        apiUrl: appConfig.payment.paypal.apiUrl,
      },
      isCritical: false,
    };
  } catch (error) {
    logger.error('PayPal verification failed:', error);
    return {
      service: 'PayPal',
      status: 'warning',
      message: 'Online payment is optional and currently unavailable.',
      isCritical: false,
    };
  }
};

/**
 * Verify Stripe Configuration
 * OPTIONAL SERVICE - Not critical for USS app
 */
export const verifyStripe = async (): Promise<VerificationResult> => {
  try {
    logger.debug('Verifying Stripe configuration...');
    
    const publicKey = appConfig.env.STRIPE_PUBLIC_KEY;
    
    if (!publicKey) {
      return {
        service: 'Stripe',
        status: 'warning',
        message: 'Stripe payment is optional and not configured.',
        isCritical: false,
      };
    }
    
    // Validate key format
    const isTestKey = publicKey.startsWith('pk_test_');
    const isLiveKey = publicKey.startsWith('pk_live_');
    
    if (!isTestKey && !isLiveKey) {
      return {
        service: 'Stripe',
        status: 'warning',
        message: 'Stripe configuration issue: Invalid key format.',
        isCritical: false,
      };
    }
    
    // Check environment consistency
    if (appConfig.isProduction && isTestKey) {
      return {
        service: 'Stripe',
        status: 'warning',
        message: 'Stripe is configured in test mode.',
        isCritical: false,
      };
    }
    
    if (!appConfig.isProduction && isLiveKey) {
      return {
        service: 'Stripe',
        status: 'warning',
        message: 'Stripe is configured in live mode.',
        isCritical: false,
      };
    }
    
    logger.info('Stripe configuration verified successfully');
    return {
      service: 'Stripe',
      status: 'success',
      message: `Stripe payment available (${isTestKey ? 'test' : 'live'} mode)`,
      details: {
        mode: isTestKey ? 'test' : 'live',
        keyPrefix: publicKey.substring(0, 12) + '...',
      },
      isCritical: false,
    };
  } catch (error) {
    logger.error('Stripe verification failed:', error);
    return {
      service: 'Stripe',
      status: 'warning',
      message: 'Stripe payment is optional and currently unavailable.',
      isCritical: false,
    };
  }
};

/**
 * Verify Google Maps Configuration
 * OPTIONAL SERVICE - Not critical for USS app
 */
export const verifyGoogleMaps = async (): Promise<VerificationResult> => {
  try {
    logger.debug('Verifying Google Maps configuration...');
    
    const apiKey = appConfig.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return {
        service: 'Google Maps',
        status: 'warning',
        message: 'Map display features may be limited.',
        isCritical: false,
      };
    }
    
    // Basic validation - just check if key exists and has reasonable length
    if (apiKey.length < 20) {
      return {
        service: 'Google Maps',
        status: 'warning',
        message: 'Map display features may be limited (invalid API key).',
        isCritical: false,
      };
    }
    
    logger.info('Google Maps configuration verified successfully');
    return {
      service: 'Google Maps',
      status: 'success',
      message: 'Map display features available',
      details: {
        keyPrefix: apiKey.substring(0, 10) + '...',
      },
      isCritical: false,
    };
  } catch (error) {
    logger.error('Google Maps verification failed:', error);
    return {
      service: 'Google Maps',
      status: 'warning',
      message: 'Map display features may be limited.',
      isCritical: false,
    };
  }
};

/**
 * Verify SMTP Configuration
 * OPTIONAL SERVICE - Not critical for USS app
 */
export const verifySMTP = async (): Promise<VerificationResult> => {
  try {
    logger.debug('Verifying SMTP configuration...');
    
    const { SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD } = appConfig.env;
    
    if (!SMTP_HOST || !SMTP_USERNAME || !SMTP_PASSWORD) {
      return {
        service: 'SMTP',
        status: 'warning',
        message: 'Email features are optional and not configured.',
        isCritical: false,
      };
    }
    
    // Validate port
    const port = parseInt(SMTP_PORT, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      return {
        service: 'SMTP',
        status: 'warning',
        message: 'Email features are optional and not properly configured (invalid port).',
        isCritical: false,
      };
    }
    
    logger.info('SMTP configuration verified successfully');
    return {
      service: 'SMTP',
      status: 'success',
      message: 'Email notifications available',
      details: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        username: SMTP_USERNAME,
      },
      isCritical: false,
    };
  } catch (error) {
    logger.error('SMTP verification failed:', error);
    return {
      service: 'SMTP',
      status: 'warning',
      message: 'Email features are optional and currently unavailable.',
      isCritical: false,
    };
  }
};

/**
 * Verify Payment Provider Configuration
 * OPTIONAL SERVICE - Not critical for USS app
 */
export const verifyPaymentProvider = async (): Promise<VerificationResult> => {
  const provider = appConfig.payment.provider;
  
  logger.info(`Active payment provider: ${provider}`);
  
  if (provider === 'paypal') {
    return await verifyPayPal();
  } else if (provider === 'stripe') {
    return await verifyStripe();
  } else {
    return {
      service: 'Payment Provider',
      status: 'warning',
      message: `Payment provider "${provider}" is not recognized. Online payment is optional.`,
      isCritical: false,
    };
  }
};

/**
 * Verify All Services
 */
export const verifyAllServices = async (): Promise<VerificationResult[]> => {
  logger.info('Starting configuration verification...');
  logger.info(`Environment: ${appConfig.appEnv}`);
  logger.info(`Mode: ${appConfig.isProduction ? 'Production' : 'Development'}`);
  logger.info(`Payment Provider: ${appConfig.payment.provider}`);
  
  const results = await Promise.all([
    verifySupabase(),
    verifyPaymentProvider(),
    verifyGoogleMaps(),
    verifySMTP(),
  ]);
  
  // Log summary
  const errors = results.filter(r => r.status === 'error');
  const warnings = results.filter(r => r.status === 'warning');
  const successes = results.filter(r => r.status === 'success');
  
  logger.info('Configuration verification complete:');
  logger.info(`✓ ${successes.length} services configured correctly`);
  if (warnings.length > 0) {
    logger.warn(`⚠ ${warnings.length} warnings (optional services)`);
  }
  if (errors.length > 0) {
    logger.error(`✗ ${errors.length} critical errors`);
  }
  
  // Log details in dev mode
  if (appConfig.isDevelopment) {
    results.forEach(result => {
      const icon = result.status === 'success' ? '✓' : result.status === 'warning' ? '⚠' : '✗';
      const criticalLabel = result.isCritical ? ' [CRITICAL]' : ' [OPTIONAL]';
      logger.debug(`${icon} ${result.service}${criticalLabel}: ${result.message}`);
      if (result.details) {
        logger.debug('  Details:', result.details);
      }
    });
  }
  
  return results;
};

/**
 * Get Configuration Status Summary
 * FIXED: Only Supabase errors cause CRITICAL status
 */
export const getConfigStatus = async (): Promise<{
  overall: 'healthy' | 'degraded' | 'critical';
  results: VerificationResult[];
}> => {
  const results = await verifyAllServices();
  
  // Only critical services (Supabase) can cause CRITICAL status
  const hasCriticalErrors = results.some(r => r.status === 'error' && r.isCritical);
  const hasWarnings = results.some(r => r.status === 'warning');
  
  let overall: 'healthy' | 'degraded' | 'critical';
  if (hasCriticalErrors) {
    overall = 'critical';
  } else if (hasWarnings) {
    overall = 'degraded';
  } else {
    overall = 'healthy';
  }
  
  return { overall, results };
};
