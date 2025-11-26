
/**
 * Secure Storage Utilities
 * Handles secure token storage using Expo Secure Store
 * Implements token expiration and refresh token management
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Storage keys
const ACCESS_TOKEN_KEY = 'uss_access_token';
const REFRESH_TOKEN_KEY = 'uss_refresh_token';
const TOKEN_EXPIRY_KEY = 'uss_token_expiry';

/**
 * Store access token securely
 * @param token Access token
 * @param expiresIn Token expiration time in seconds (default: 3600 = 1 hour)
 */
export async function storeAccessToken(token: string, expiresIn: number = 3600): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      // For web, use sessionStorage (not as secure but better than localStorage)
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      const expiryTime = Date.now() + (expiresIn * 1000);
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    } else {
      // For native platforms, use SecureStore
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      const expiryTime = Date.now() + (expiresIn * 1000);
      await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
    console.log('[SECURE_STORAGE] Access token stored securely');
  } catch (error) {
    console.error('[SECURE_STORAGE] Error storing access token:', error);
    throw error;
  }
}

/**
 * Get access token from secure storage
 * @returns Access token or null if not found or expired
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    let token: string | null;
    let expiryTime: string | null;

    if (Platform.OS === 'web') {
      token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      expiryTime = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    } else {
      token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      expiryTime = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
    }

    if (!token) {
      console.log('[SECURE_STORAGE] No access token found');
      return null;
    }

    // Check if token is expired
    if (expiryTime) {
      const expiry = parseInt(expiryTime, 10);
      if (Date.now() >= expiry) {
        console.log('[SECURE_STORAGE] Access token expired');
        await clearAccessToken();
        return null;
      }
    }

    return token;
  } catch (error) {
    console.error('[SECURE_STORAGE] Error getting access token:', error);
    return null;
  }
}

/**
 * Clear access token from secure storage
 */
export async function clearAccessToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    } else {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
    }
    console.log('[SECURE_STORAGE] Access token cleared');
  } catch (error) {
    console.error('[SECURE_STORAGE] Error clearing access token:', error);
  }
}

/**
 * Store refresh token securely
 * @param token Refresh token
 */
export async function storeRefreshToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      // For web, use localStorage for refresh token (persists across sessions)
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    }
    console.log('[SECURE_STORAGE] Refresh token stored securely');
  } catch (error) {
    console.error('[SECURE_STORAGE] Error storing refresh token:', error);
    throw error;
  }
}

/**
 * Get refresh token from secure storage
 * @returns Refresh token or null if not found
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('[SECURE_STORAGE] Error getting refresh token:', error);
    return null;
  }
}

/**
 * Clear refresh token from secure storage
 */
export async function clearRefreshToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
    console.log('[SECURE_STORAGE] Refresh token cleared');
  } catch (error) {
    console.error('[SECURE_STORAGE] Error clearing refresh token:', error);
  }
}

/**
 * Clear all tokens from secure storage
 */
export async function clearAllTokens(): Promise<void> {
  await clearAccessToken();
  await clearRefreshToken();
  console.log('[SECURE_STORAGE] All tokens cleared');
}

/**
 * Check if access token is expired
 * @returns true if expired or not found, false otherwise
 */
export async function isAccessTokenExpired(): Promise<boolean> {
  try {
    let expiryTime: string | null;

    if (Platform.OS === 'web') {
      expiryTime = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    } else {
      expiryTime = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
    }

    if (!expiryTime) {
      return true;
    }

    const expiry = parseInt(expiryTime, 10);
    return Date.now() >= expiry;
  } catch (error) {
    console.error('[SECURE_STORAGE] Error checking token expiry:', error);
    return true;
  }
}

/**
 * Get time until token expiry in seconds
 * @returns Seconds until expiry, or 0 if expired or not found
 */
export async function getTokenExpiryTime(): Promise<number> {
  try {
    let expiryTime: string | null;

    if (Platform.OS === 'web') {
      expiryTime = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    } else {
      expiryTime = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
    }

    if (!expiryTime) {
      return 0;
    }

    const expiry = parseInt(expiryTime, 10);
    const timeLeft = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
    return timeLeft;
  } catch (error) {
    console.error('[SECURE_STORAGE] Error getting token expiry time:', error);
    return 0;
  }
}
