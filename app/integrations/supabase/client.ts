
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';
import appConfig from '@/config/appConfig';

// Get Supabase credentials from environment configuration
const SUPABASE_URL = appConfig.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = appConfig.env.SUPABASE_ANON_KEY;

// Validate configuration
if (!SUPABASE_URL || SUPABASE_URL === '') {
  appConfig.logger.error('Supabase URL is missing!');
  appConfig.logger.error('Please set EXPO_PUBLIC_SUPABASE_URL in your environment');
  throw new Error('Supabase URL is missing');
}

if (!SUPABASE_URL.startsWith('http://') && !SUPABASE_URL.startsWith('https://')) {
  appConfig.logger.error('Invalid Supabase URL:', SUPABASE_URL);
  appConfig.logger.error('URL must start with http:// or https://');
  throw new Error('Invalid Supabase URL: Must be a valid HTTP or HTTPS URL');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === '') {
  appConfig.logger.error('Supabase Anon Key is missing!');
  appConfig.logger.error('Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment');
  throw new Error('Supabase Anon Key is missing');
}

appConfig.logger.info('Initializing Supabase client');
appConfig.logger.debug('Supabase URL:', SUPABASE_URL);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

appConfig.logger.info('Supabase client initialized successfully');
