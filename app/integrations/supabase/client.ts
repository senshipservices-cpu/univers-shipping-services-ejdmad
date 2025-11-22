
/**
 * Supabase Client Configuration
 * 
 * This module initializes and exports the Supabase client for use throughout the app.
 */

import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

/**
 * Check if a value is valid (not empty, undefined, or a placeholder)
 */
function isValidValue(value: any): boolean {
  if (!value) return false;
  if (typeof value !== 'string') return false;
  if (value === '') return false;
  if (value.trim() === '') return false;
  if (value.startsWith('${') && value.endsWith('}')) return false;
  if (value === 'YOUR_SUPABASE_URL') return false;
  if (value === 'YOUR_SUPABASE_ANON_KEY') return false;
  if (value === 'placeholder') return false;
  if (value.includes('placeholder')) return false;
  return true;
}

/**
 * Get environment variable with multiple fallback sources
 * Simplified version that works better with Natively
 */
function getEnvVar(key: string): string {
  try {
    console.log(`[SUPABASE] Looking for: ${key}`);
    
    // Try Constants.expoConfig.extra (Natively environment variables)
    if (Constants.expoConfig?.extra) {
      console.log(`[SUPABASE] Constants.expoConfig.extra available`);
      console.log(`[SUPABASE] Available keys:`, Object.keys(Constants.expoConfig.extra));
      
      // Try exact match
      const exactValue = Constants.expoConfig.extra[key];
      console.log(`[SUPABASE] ${key} exact match:`, exactValue ? 'Found' : 'Not found');
      if (isValidValue(exactValue)) {
        console.log(`[SUPABASE] ✓ Using ${key} from Constants.expoConfig.extra`);
        return String(exactValue);
      }
      
      // Try without EXPO_PUBLIC_ prefix
      const withoutPrefix = key.replace('EXPO_PUBLIC_', '');
      const withoutPrefixValue = Constants.expoConfig.extra[withoutPrefix];
      console.log(`[SUPABASE] ${withoutPrefix} match:`, withoutPrefixValue ? 'Found' : 'Not found');
      if (isValidValue(withoutPrefixValue)) {
        console.log(`[SUPABASE] ✓ Using ${withoutPrefix} from Constants.expoConfig.extra`);
        return String(withoutPrefixValue);
      }
      
      // Try camelCase version
      const camelKey = withoutPrefix
        .toLowerCase()
        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      const camelValue = Constants.expoConfig.extra[camelKey];
      console.log(`[SUPABASE] ${camelKey} (camelCase) match:`, camelValue ? 'Found' : 'Not found');
      if (isValidValue(camelValue)) {
        console.log(`[SUPABASE] ✓ Using ${camelKey} from Constants.expoConfig.extra`);
        return String(camelValue);
      }
      
      // Try lowercase version
      const lowerKey = withoutPrefix.toLowerCase();
      const lowerValue = Constants.expoConfig.extra[lowerKey];
      console.log(`[SUPABASE] ${lowerKey} (lowercase) match:`, lowerValue ? 'Found' : 'Not found');
      if (isValidValue(lowerValue)) {
        console.log(`[SUPABASE] ✓ Using ${lowerKey} from Constants.expoConfig.extra`);
        return String(lowerValue);
      }
    } else {
      console.log(`[SUPABASE] Constants.expoConfig.extra NOT available`);
    }
    
    // Try process.env (for local development)
    if (typeof process !== 'undefined' && process.env) {
      console.log(`[SUPABASE] Trying process.env for ${key}`);
      const envValue = process.env[key];
      if (isValidValue(envValue)) {
        console.log(`[SUPABASE] ✓ Using ${key} from process.env`);
        return String(envValue);
      }
    }
    
    console.log(`[SUPABASE] ✗ ${key} not found`);
  } catch (error) {
    console.error(`[SUPABASE] Error getting environment variable ${key}:`, error);
  }
  
  return '';
}

// Get Supabase configuration from environment
const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

// Validation arrays
export const supabaseConfigErrors: string[] = [];
export const supabaseConfigWarnings: string[] = [];

// Validate Supabase URL
if (!supabaseUrl || supabaseUrl === '') {
  supabaseConfigErrors.push('SUPABASE_URL is not set. Please set EXPO_PUBLIC_SUPABASE_URL in your environment variables.');
} else if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseConfigErrors.push(`SUPABASE_URL must be a valid HTTP or HTTPS URL. Current value: "${supabaseUrl}"`);
}

// Validate Supabase Anon Key
if (!supabaseAnonKey || supabaseAnonKey === '') {
  supabaseConfigErrors.push('SUPABASE_ANON_KEY is not set. Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables.');
}

// Check if configuration is valid
export const isSupabaseConfigured = supabaseConfigErrors.length === 0;

// Log configuration status
console.log('=== Supabase Configuration ===');
console.log('URL:', supabaseUrl ? `✓ Set (${supabaseUrl.substring(0, 30)}...)` : '✗ Missing');
console.log('Anon Key:', supabaseAnonKey ? `✓ Set (${supabaseAnonKey.substring(0, 20)}...)` : '✗ Missing');
console.log('Configured:', isSupabaseConfigured ? '✓ Yes' : '✗ No');
console.log('Errors:', supabaseConfigErrors.length);
console.log('Warnings:', supabaseConfigWarnings.length);

if (supabaseConfigErrors.length > 0) {
  console.error('Configuration Errors:');
  supabaseConfigErrors.forEach((error, index) => {
    console.error(`  ${index + 1}. ${error}`);
  });
}

if (supabaseConfigWarnings.length > 0) {
  console.warn('Configuration Warnings:');
  supabaseConfigWarnings.forEach((warning, index) => {
    console.warn(`  ${index + 1}. ${warning}`);
  });
}

console.log('==============================');

// Create Supabase client with fallback values
// If configuration is invalid, we still create a client to avoid crashes
// The SupabaseConfigCheck component will prevent the app from rendering
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

// Log successful initialization
if (isSupabaseConfigured) {
  console.log('✓ Supabase client initialized successfully');
} else {
  console.error('✗ Supabase client initialized with placeholder values - app will show configuration screen');
}
