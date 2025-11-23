
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useTheme } from '@react-navigation/native';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireEmailVerification = true,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, isEmailVerified, loading, currentUserIsAdmin } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  // Don't redirect while loading
  if (loading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/login" />;
  }

  // Redirect to verify email if email verification is required and not verified
  if (requireEmailVerification && !isEmailVerified()) {
    return <Redirect href="/(tabs)/verify-email" />;
  }

  // Show access denied message if admin access is required but user is not admin
  if (requireAdmin && !currentUserIsAdmin) {
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
            Cette page est réservée à l&apos;équipe Universal Shipping Services.
          </Text>
          
          <Text style={[styles.submessage, { color: colors.textSecondary }]}>
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette fonctionnalité.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/(home)/')}
          >
            <IconSymbol
              ios_icon_name="house.fill"
              android_material_icon_name="home"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.buttonText}>
              Retour à l&apos;accueil
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  submessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
