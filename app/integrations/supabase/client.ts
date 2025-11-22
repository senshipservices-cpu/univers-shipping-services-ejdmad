
/**
 * Supabase Client Configuration
 * 
 * This module initializes and exports the Supabase client for use throughout the app.
 * It handles environment variable validation and provides helpful error messages.
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
  // Check for placeholder patterns like ${VAR_NAME}
  if (value.startsWith('${') && value.endsWith('}')) return false;
  return true;
}

/**
 * Get environment variable with multiple fallback sources
 */
function getEnvVar(key: string): string {
  // 1. Try Constants.expoConfig.extra (Natively environment variables)
  if (Constants.expoConfig?.extra) {
    const exactValue = Constants.expoConfig.extra[key];
    if (isValidValue(exactValue)) {
      return String(exactValue);
    }
    
    // Try camelCase version
    const camelKey = key
      .replace('EXPO_PUBLIC_', '')
      .toLowerCase()
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    const camelValue = Constants.expoConfig.extra[camelKey];
    if (isValidValue(camelValue)) {
      return String(camelValue);
    }
  }
  
  // 2. Try process.env (local development)
  if (typeof process !== 'undefined' && process.env) {
    let envValue: string | undefined;
    
    switch (key) {
      case 'EXPO_PUBLIC_SUPABASE_URL':
        envValue = process.env.EXPO_PUBLIC_SUPABASE_URL;
        break;
      case 'EXPO_PUBLIC_SUPABASE_ANON_KEY':
        envValue = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        break;
      case 'supabaseUrl':
        envValue = process.env.supabaseUrl;
        break;
      case 'supabaseAnonKey':
        envValue = process.env.supabaseAnonKey;
        break;
    }
    
    if (isValidValue(envValue)) {
      return String(envValue);
    }
  }
  
  return '';
}

// Get Supabase configuration from environment
const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL') || getEnvVar('supabaseUrl');
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY') || getEnvVar('supabaseAnonKey');

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
console.log('URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
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
