
/**
 * API Client with Security Features
 * Handles API calls with authentication, rate limiting, and timeouts
 */

import { supabase } from '@/app/integrations/supabase/client';
import { RateLimiter } from './security';

// Rate limiters for different endpoints
const loginRateLimiter = new RateLimiter();
const trackingRateLimiter = new RateLimiter();
const paymentRateLimiter = new RateLimiter();

// API timeout in milliseconds (15 seconds)
const API_TIMEOUT = 15000;

/**
 * Create a timeout promise
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
}

/**
 * Make an authenticated API call with timeout
 */
export async function makeAuthenticatedRequest<T>(
  functionName: string,
  body: any,
  options: {
    timeout?: number;
    idempotencyKey?: string;
  } = {}
): Promise<{ data: T | null; error: any }> {
  const timeout = options.timeout || API_TIMEOUT;

  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add idempotency key if provided (for payment operations)
    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    // Make request with timeout
    const requestPromise = supabase.functions.invoke(functionName, {
      body,
      headers,
    });

    const result = await Promise.race([
      requestPromise,
      createTimeout(timeout),
    ]);

    return result as { data: T | null; error: any };
  } catch (error: any) {
    console.error(`[API_CLIENT] Error calling ${functionName}:`, error);
    
    if (error.message === 'Request timeout') {
      return { 
        data: null, 
        error: { message: 'La requête a expiré. Veuillez réessayer.' } 
      };
    }

    return { data: null, error };
  }
}

/**
 * Login with rate limiting
 */
export async function loginWithRateLimit(
  email: string,
  password: string
): Promise<{ error: any }> {
  const key = `login_${email}`;
  
  // Check rate limit: max 5 attempts per 15 minutes
  if (!loginRateLimiter.isAllowed(key, 5, 15 * 60 * 1000)) {
    return { 
      error: { 
        message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.' 
      } 
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Reset rate limit on successful login
    loginRateLimiter.reset(key);
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Track shipment with rate limiting
 */
export async function trackShipmentWithRateLimit(
  trackingNumber: string
): Promise<{ data: any; error: any }> {
  const key = `tracking_${trackingNumber}`;
  
  // Check rate limit: max 10 requests per minute
  if (!trackingRateLimiter.isAllowed(key, 10, 60 * 1000)) {
    return { 
      data: null,
      error: { 
        message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' 
      } 
    };
  }

  try {
    // Call tracking endpoint (public - no auth required)
    const { data, error } = await Promise.race([
      supabase.functions.invoke('public-tracking', {
        body: { tracking_number: trackingNumber },
      }),
      createTimeout(API_TIMEOUT),
    ]);

    return { data, error };
  } catch (error: any) {
    if (error.message === 'Request timeout') {
      return { 
        data: null, 
        error: { message: 'La requête a expiré. Veuillez réessayer.' } 
      };
    }
    return { data: null, error };
  }
}

/**
 * Process payment with rate limiting and idempotency
 */
export async function processPaymentWithSecurity(
  quoteId: string,
  paymentMethod: string,
  paymentToken: string,
  idempotencyKey: string
): Promise<{ data: any; error: any }> {
  const key = `payment_${quoteId}`;
  
  // Check rate limit: max 3 payment attempts per 5 minutes
  if (!paymentRateLimiter.isAllowed(key, 3, 5 * 60 * 1000)) {
    return { 
      data: null,
      error: { 
        message: 'Trop de tentatives de paiement. Veuillez réessayer dans 5 minutes.' 
      } 
    };
  }

  try {
    const result = await makeAuthenticatedRequest('shipments-create-and-pay', {
      quote_id: quoteId,
      payment_method: paymentMethod,
      payment_token: paymentToken,
    }, {
      idempotencyKey,
      timeout: 20000, // 20 seconds for payment operations
    });

    if (!result.error) {
      // Reset rate limit on successful payment
      paymentRateLimiter.reset(key);
    }

    return result;
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Calculate quote with timeout
 */
export async function calculateQuoteWithTimeout(
  quoteData: any
): Promise<{ data: any; error: any }> {
  return makeAuthenticatedRequest('shipments-quote', quoteData, {
    timeout: 10000, // 10 seconds for quote calculation
  });
}
