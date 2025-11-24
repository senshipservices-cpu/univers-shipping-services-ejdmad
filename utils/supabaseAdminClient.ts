
/**
 * Supabase Admin Client
 * Shared Supabase client for the USS Admin Web application
 * 
 * This client uses the same Supabase instance as the mobile app
 * but is specifically configured for the admin web interface.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/app/integrations/supabase/types';
import appConfig from '@/config/appConfig';

// Get Supabase credentials from environment configuration
const SUPABASE_URL = appConfig.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = appConfig.env.SUPABASE_ANON_KEY;

// Validate configuration
if (!SUPABASE_URL || SUPABASE_URL === '') {
  appConfig.logger.error('Supabase URL is missing for admin client!');
  throw new Error('Supabase URL is missing');
}

if (!SUPABASE_URL.startsWith('http://') && !SUPABASE_URL.startsWith('https://')) {
  appConfig.logger.error('Invalid Supabase URL for admin client:', SUPABASE_URL);
  throw new Error('Invalid Supabase URL: Must be a valid HTTP or HTTPS URL');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === '') {
  appConfig.logger.error('Supabase Anon Key is missing for admin client!');
  throw new Error('Supabase Anon Key is missing');
}

appConfig.logger.info('Initializing Supabase Admin client');

/**
 * Supabase Admin Client
 * 
 * Import this client in admin pages:
 * import { supabaseAdmin } from '@/utils/supabaseAdminClient';
 */
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Use localStorage for web admin (no AsyncStorage needed)
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

appConfig.logger.info('Supabase Admin client initialized successfully');

/**
 * Check if current user is an admin
 * @returns Promise<boolean>
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    
    if (!user?.email) {
      return false;
    }
    
    return appConfig.isAdmin(user.email);
  } catch (error) {
    appConfig.logger.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get current admin user
 */
export async function getCurrentAdminUser() {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser();
    
    if (error) {
      appConfig.logger.error('Error getting admin user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    appConfig.logger.error('Exception getting admin user:', error);
    return null;
  }
}
