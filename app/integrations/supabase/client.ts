
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
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL in Natively Environment Variables.');
  console.error('');
  console.error('Steps to fix:');
  console.error('1. Go to Natively → Environment Variables tab');
  console.error('2. Click "Add Variable"');
  console.error('3. Name: EXPO_PUBLIC_SUPABASE_URL');
  console.error('4. Value: https://lnfsjpuffrcyenuuoxxk.supabase.co');
  console.error('5. Click "Save"');
  console.error('6. Restart the app');
  console.error('===========================================');
  throw new Error('Supabase URL is missing. Please configure EXPO_PUBLIC_SUPABASE_URL in Natively Environment Variables.');
}

if (!SUPABASE_URL.startsWith('http://') && !SUPABASE_URL.startsWith('https://')) {
  console.error('===========================================');
  console.error('❌ INVALID SUPABASE URL');
  console.error('===========================================');
  console.error('Current value:', SUPABASE_URL);
  console.error('URL must start with http:// or https://');
  console.error('Expected format: https://lnfsjpuffrcyenuuoxxk.supabase.co');
  console.error('');
  console.error('Steps to fix:');
  console.error('1. Go to Natively → Environment Variables tab');
  console.error('2. Find EXPO_PUBLIC_SUPABASE_URL');
  console.error('3. Update value to: https://lnfsjpuffrcyenuuoxxk.supabase.co');
  console.error('4. Click "Save"');
  console.error('5. Restart the app');
  console.error('===========================================');
  throw new Error('Invalid Supabase URL: Must be a valid HTTP or HTTPS URL');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === '') {
  console.error('===========================================');
  console.error('❌ SUPABASE ANON KEY IS MISSING');
  console.error('===========================================');
  console.error('Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in Natively Environment Variables.');
  console.error('');
  console.error('Steps to fix:');
  console.error('1. Go to Natively → Environment Variables tab');
  console.error('2. Click "Add Variable"');
  console.error('3. Name: EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.error('4. Value: Your Supabase anonymous key');
  console.error('5. Click "Save"');
  console.error('6. Restart the app');
  console.error('');
  console.error('Get your key from:');
  console.error('Supabase Dashboard → Project Settings → API → anon public');
  console.error('===========================================');
  throw new Error('Supabase Anon Key is missing. Please configure EXPO_PUBLIC_SUPABASE_ANON_KEY in Natively Environment Variables.');
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
