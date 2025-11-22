
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';
import appConfig from '@/config/appConfig';

// Get Supabase credentials from environment configuration
const SUPABASE_URL = appConfig.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = appConfig.env.SUPABASE_ANON_KEY;

// Validate configuration
const validation = appConfig.validateConfig();

// Log configuration status
console.log('===========================================');
console.log('🔧 Supabase Configuration Check');
console.log('===========================================');
console.log('Supabase URL:', SUPABASE_URL || '(not set)');
console.log('Supabase Anon Key:', SUPABASE_ANON_KEY ? '(set)' : '(not set)');
console.log('Validation:', validation.valid ? '✓ Valid' : '✗ Invalid');

if (!validation.valid) {
  console.error('');
  console.error('❌ Configuration Errors:');
  validation.errors.forEach((error, index) => {
    console.error(`   ${index + 1}. ${error}`);
  });
}

if (validation.warnings.length > 0) {
  console.warn('');
  console.warn('⚠️  Configuration Warnings:');
  validation.warnings.forEach((warning, index) => {
    console.warn(`   ${index + 1}. ${warning}`);
  });
}

console.log('===========================================');

// Create a placeholder client if configuration is invalid
// This prevents the app from crashing and allows the setup guide to be displayed
let supabase: ReturnType<typeof createClient<Database>>;

if (validation.valid) {
  console.log('✓ Initializing Supabase client...');
  supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  console.log('✓ Supabase client initialized successfully');
} else {
  console.error('✗ Supabase client not initialized - configuration invalid');
  console.error('✗ Creating placeholder client to prevent crashes');
  
  // Create a placeholder client with dummy values
  // This will allow the app to load and show the setup guide
  supabase = createClient<Database>(
    'https://placeholder.supabase.co',
    'placeholder-key',
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
}

export { supabase };

// Export validation status so components can check if Supabase is properly configured
export const isSupabaseConfigured = validation.valid;
export const supabaseConfigErrors = validation.errors;
export const supabaseConfigWarnings = validation.warnings;
