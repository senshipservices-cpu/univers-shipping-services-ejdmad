
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
}

/**
 * Verify Supabase Configuration
 */
export const verifySupabase = async (): Promise<VerificationResult> => {
  try {
    logger.debug('Verifying Supabase configuration...');
    
    if (!appConfig.env.SUPABASE_URL || !appConfig.env.SUPABASE_ANON_KEY) {
      return {
        service: 'Supabase',
        status: 'error',
        message: 'Supabase credentials not configured',
      };
    }
    
    // Test connection by fetching session
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message !== 'Auth session missing!') {
      return {
        service: 'Supabase',
        status: 'error',
        message: `Supabase connection failed: ${error.message}`,
      };
    }
    
    logger.info('Supabase configuration verified successfully');
    return {
      service: 'Supabase',
      status: 'success',
      message: 'Supabase is properly configured and accessible',
      details: {
        url: appConfig.env.SUPABASE_URL,
        hasSession: !!data.session,
      },
    };
  } catch (error) {
    logger.error('Supabase verification failed:', error);
    return {
      service: 'Supabase',
      status: 'error',
      message: `Supabase verification failed: ${error}`,
    };
  }
};

/**
 * Verify PayPal Configuration
 */
export const verifyPayPal = async (): Promise<VerificationResult> => {
  try {
    logger.debug('Verifying PayPal configuration...');
    
    const clientId = appConfig.env.PAYPAL_CLIENT_ID;
    const environment = appConfig.env.PAYPAL_ENV;
    
    if (!clientId) {
      return {
        service: 'PayPal',
        status: appConfig.payment.provider === 'paypal' ? 'error' : 'warning',
        message: 'PayPal client ID not configured',
      };
    }
    
    // Validate environment setting
    if (environment !== 'sandbox' && environment !== 'live') {
      return {
        service: 'PayPal',
        status: 'error',
        message: `Invalid PayPal environment: ${environment}. Must be "sandbox" or "live"`,
      };
    }
    
    // Check environment consistency
    if (appConfig.isProduction && environment === 'sandbox') {
      return {
        service: 'PayPal',
        status: 'warning',
        message: 'Using PayPal sandbox in production environment',
        details: {
          environment,
          recommendation: 'Change PAYPAL_ENV to "live" for production',
        },
      };
    }
    
    if (!appConfig.isProduction && environment === 'live') {
      return {
        service: 'PayPal',
        status: 'warning',
        message: 'Using PayPal live in development environment',
        details: {
          environment,
          recommendation: 'Consider using "sandbox" for development',
        },
      };
    }
    
    logger.info('PayPal configuration verified successfully');
    return {
      service: 'PayPal',
      status: 'success',
      message: `PayPal is properly configured (${environment} mode)`,
      details: {
        environment,
        clientIdPrefix: clientId.substring(0, 12) + '...',
        apiUrl: appConfig.payment.paypal.apiUrl,
      },
    };
  } catch (error) {
    logger.error('PayPal verification failed:', error);
    return {
      service: 'PayPal',
      status: 'error',
      message: `PayPal verification failed: ${error}`,
    };
  }
};

/**
 * Verify Stripe Configuration
 */
export const verifyStripe = async (): Promise<VerificationResult> => {
  try {
    logger.debug('Verifying Stripe configuration...');
    
    const publicKey = appConfig.env.STRIPE_PUBLIC_KEY;
    
    if (!publicKey) {
      return {
        service: 'Stripe',
        status: appConfig.payment.provider === 'stripe' ? 'error' : 'warning',
        message: 'Stripe public key not configured',
      };
    }
    
    // Validate key format
    const isTestKey = publicKey.startsWith('pk_test_');
    const isLiveKey = publicKey.startsWith('pk_live_');
    
    if (!isTestKey && !isLiveKey) {
      return {
        service: 'Stripe',
        status: 'error',
        message: 'Invalid Stripe public key format',
      };
    }
    
    // Check environment consistency
    if (appConfig.isProduction && isTestKey) {
      return {
        service: 'Stripe',
        status: 'warning',
        message: 'Using Stripe test key in production environment',
      };
    }
    
    if (!appConfig.isProduction && isLiveKey) {
      return {
        service: 'Stripe',
        status: 'warning',
        message: 'Using Stripe live key in development environment',
      };
    }
    
    logger.info('Stripe configuration verified successfully');
    return {
      service: 'Stripe',
      status: 'success',
      message: `Stripe is properly configured (${isTestKey ? 'test' : 'live'} mode)`,
      details: {
        mode: isTestKey ? 'test' : 'live',
        keyPrefix: publicKey.substring(0, 12) + '...',
      },
    };
  } catch (error) {
    logger.error('Stripe verification failed:', error);
    return {
      service: 'Stripe',
      status: 'error',
      message: `Stripe verification failed: ${error}`,
    };
  }
};

/**
 * Verify Google Maps Configuration
 */
export const verifyGoogleMaps = async (): Promise<VerificationResult> => {
  try {
    logger.debug('Verifying Google Maps configuration...');
    
    const apiKey = appConfig.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return {
        service: 'Google Maps',
        status: 'warning',
        message: 'Google Maps API key not configured - map features will be limited',
      };
    }
    
    // Basic validation - just check if key exists and has reasonable length
    if (apiKey.length < 20) {
      return {
        service: 'Google Maps',
        status: 'error',
        message: 'Google Maps API key appears to be invalid (too short)',
      };
    }
    
    logger.info('Google Maps configuration verified successfully');
    return {
      service: 'Google Maps',
      status: 'success',
      message: 'Google Maps API key is configured',
      details: {
        keyPrefix: apiKey.substring(0, 10) + '...',
      },
    };
  } catch (error) {
    logger.error('Google Maps verification failed:', error);
    return {
      service: 'Google Maps',
      status: 'error',
      message: `Google Maps verification failed: ${error}`,
    };
  }
};

/**
 * Verify SMTP Configuration
 */
export const verifySMTP = async (): Promise<VerificationResult> => {
  try {
    logger.debug('Verifying SMTP configuration...');
    
    const { SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD } = appConfig.env;
    
    if (!SMTP_HOST || !SMTP_USERNAME || !SMTP_PASSWORD) {
      return {
        service: 'SMTP',
        status: appConfig.isProduction ? 'error' : 'warning',
        message: 'SMTP configuration incomplete - email features will not work',
        details: {
          hasHost: !!SMTP_HOST,
          hasUsername: !!SMTP_USERNAME,
          hasPassword: !!SMTP_PASSWORD,
        },
      };
    }
    
    // Validate port
    const port = parseInt(SMTP_PORT, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      return {
        service: 'SMTP',
        status: 'error',
        message: 'Invalid SMTP port number',
      };
    }
    
    logger.info('SMTP configuration verified successfully');
    return {
      service: 'SMTP',
      status: 'success',
      message: 'SMTP is properly configured',
      details: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        username: SMTP_USERNAME,
      },
    };
  } catch (error) {
    logger.error('SMTP verification failed:', error);
    return {
      service: 'SMTP',
      status: 'error',
      message: `SMTP verification failed: ${error}`,
    };
  }
};

/**
 * Verify Payment Provider Configuration
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
      status: 'error',
      message: `Unknown payment provider: ${provider}`,
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
    logger.warn(`⚠ ${warnings.length} warnings`);
  }
  if (errors.length > 0) {
    logger.error(`✗ ${errors.length} errors`);
  }
  
  // Log details in dev mode
  if (appConfig.isDevelopment) {
    results.forEach(result => {
      const icon = result.status === 'success' ? '✓' : result.status === 'warning' ? '⚠' : '✗';
      logger.debug(`${icon} ${result.service}: ${result.message}`);
      if (result.details) {
        logger.debug('  Details:', result.details);
      }
    });
  }
  
  return results;
};

/**
 * Get Configuration Status Summary
 */
export const getConfigStatus = async (): Promise<{
  overall: 'healthy' | 'degraded' | 'critical';
  results: VerificationResult[];
}> => {
  const results = await verifyAllServices();
  
  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');
  
  let overall: 'healthy' | 'degraded' | 'critical';
  if (hasErrors) {
    overall = 'critical';
  } else if (hasWarnings) {
    overall = 'degraded';
  } else {
    overall = 'healthy';
  }
  
  return { overall, results };
};
