
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import { supabaseAdmin } from '@/utils/supabaseAdminClient';
import appConfig from '@/config/appConfig';
import type { User } from '@supabase/supabase-js';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard Component
 * 
 * Protects admin routes by:
 * 1. Checking if user is authenticated
 * 2. Verifying user email is in ADMIN_EMAILS list
 * 3. Redirecting to /admin-login if not authorized
 * 4. Showing access denied message if authenticated but not admin
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Prevent navigation loops
  const hasCheckedAccess = useRef(false);
  const isNavigating = useRef(false);

  const checkAdminAccess = useCallback(async () => {
    // Prevent multiple checks
    if (hasCheckedAccess.current) {
      return;
    }

    try {
      hasCheckedAccess.current = true;
      setLoading(true);
      
      console.log('[ADMIN_GUARD] Checking admin access...');

      // Get current session
      const { data: { session }, error } = await supabaseAdmin.auth.getSession();

      if (error) {
        console.error('[ADMIN_GUARD] Error getting session:', error);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (!session?.user) {
        // Not authenticated, redirect to login
        console.log('[ADMIN_GUARD] No user session, redirecting to admin login');
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        
        if (!isNavigating.current) {
          isNavigating.current = true;
          router.replace('/(tabs)/admin-login');
        }
        return;
      }

      // Check if user is admin
      const userEmail = session.user.email;
      const adminStatus = appConfig.isAdmin(userEmail);

      console.log('[ADMIN_GUARD] Admin access check:', {
        email: userEmail,
        isAdmin: adminStatus,
      });

      setUser(session.user);
      setIsAdmin(adminStatus);
      setLoading(false);

      // If not admin, don't redirect but show access denied message
      if (!adminStatus) {
        console.log('[ADMIN_GUARD] User is not admin, showing access denied');
      }
    } catch (error) {
      console.error('[ADMIN_GUARD] Exception checking admin access:', error);
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAdminAccess();

    // Listen for auth state changes
    const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange(
      (event, session) => {
        console.log('[ADMIN_GUARD] Auth state changed:', event);
        
        // Reset check flag when auth state changes
        if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
          hasCheckedAccess.current = false;
          isNavigating.current = false;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminAccess]);

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Vérification des accès...
        </Text>
      </View>
    );
  }

  // Not authenticated - will redirect to login
  if (!user) {
    return null;
  }

  // Authenticated but not admin - show access denied
  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
            <IconSymbol
              ios_icon_name="exclamationmark.shield.fill"
              android_material_icon_name="block"
              size={64}
              color={colors.error}
            />
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Accès Restreint
          </Text>
          
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Accès réservé à l&apos;équipe Universal Shipping Services.
          </Text>
          
          <Text style={[styles.submessage, { color: colors.textSecondary }]}>
            Votre compte ({user.email}) n&apos;a pas les permissions nécessaires pour accéder à cette fonctionnalité.
          </Text>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={async () => {
                if (!isNavigating.current) {
                  isNavigating.current = true;
                  await supabaseAdmin.auth.signOut();
                  router.replace('/(tabs)/admin-login');
                }
              }}
            >
              <IconSymbol
                ios_icon_name="arrow.left.circle.fill"
                android_material_icon_name="logout"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.buttonText}>
                Se déconnecter
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonSecondary, { borderColor: colors.border }]}
              onPress={() => {
                if (!isNavigating.current) {
                  router.push('/(tabs)/(home)/');
                }
              }}
            >
              <IconSymbol
                ios_icon_name="house.fill"
                android_material_icon_name="home"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.buttonTextSecondary, { color: colors.primary }]}>
                Retour à l&apos;accueil
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Authenticated and admin - render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  submessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '700',
  },
});
