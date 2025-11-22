
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';
import appConfig from '@/config/appConfig';

// Get Supabase credentials from environment configuration
const SUPABASE_URL = appConfig.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = appConfig.env.SUPABASE_ANON_KEY;

// Validate configuration
if (!SUPABASE_URL || SUPABASE_URL === '') {
  console.error('===========================================');
  console.error('❌ SUPABASE URL IS MISSING');
  console.error('===========================================');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL in your environment variables.');
  console.error('');
  console.error('In Natively:');
  console.error('1. Go to Environment Variables tab');
  console.error('2. Add variable: EXPO_PUBLIC_SUPABASE_URL');
  console.error('3. Set value to: https://lnfsjpuffrcyenuuoxxk.supabase.co');
  console.error('');
  console.error('For local development:');
  console.error('1. Copy .env.example to .env');
  console.error('2. Set EXPO_PUBLIC_SUPABASE_URL=https://lnfsjpuffrcyenuuoxxk.supabase.co');
  console.error('===========================================');
  throw new Error('Supabase URL is missing. Please configure EXPO_PUBLIC_SUPABASE_URL in your environment variables.');
}

if (!SUPABASE_URL.startsWith('http://') && !SUPABASE_URL.startsWith('https://')) {
  console.error('===========================================');
  console.error('❌ INVALID SUPABASE URL');
  console.error('===========================================');
  console.error('Current value:', SUPABASE_URL);
  console.error('URL must start with http:// or https://');
  console.error('Expected format: https://lnfsjpuffrcyenuuoxxk.supabase.co');
  console.error('===========================================');
  throw new Error('Invalid Supabase URL: Must be a valid HTTP or HTTPS URL');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === '') {
  console.error('===========================================');
  console.error('❌ SUPABASE ANON KEY IS MISSING');
  console.error('===========================================');
  console.error('Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
  console.error('');
  console.error('In Natively:');
  console.error('1. Go to Environment Variables tab');
  console.error('2. Add variable: EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.error('3. Set value to your Supabase anonymous key');
  console.error('');
  console.error('Get your key from:');
  console.error('Supabase Dashboard → Project Settings → API → anon public');
  console.error('===========================================');
  throw new Error('Supabase Anon Key is missing. Please configure EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
}

console.log('✓ Supabase configuration validated');
console.log('✓ Initializing Supabase client...');

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

console.log('✓ Supabase client initialized successfully');
