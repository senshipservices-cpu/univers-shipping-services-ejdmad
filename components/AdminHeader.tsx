
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import { supabaseAdmin } from '@/utils/supabaseAdminClient';
import type { User } from '@supabase/supabase-js';

interface AdminHeaderProps {
  user: User | null;
  title?: string;
  showBackButton?: boolean;
}

/**
 * AdminHeader Component
 * 
 * Displays:
 * - Admin email (top right)
 * - Logout button (top right)
 * - Optional title
 * - Optional back button
 */
export function AdminHeader({ user, title, showBackButton = false }: AdminHeaderProps) {
  const router = useRouter();
  const theme = useTheme();

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabaseAdmin.auth.signOut();
              router.replace('/(tabs)/admin-login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
      <View style={styles.headerLeft}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow_back"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
        
        {title && (
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.headerRight}>
        {user?.email && (
          <View style={styles.userInfo}>
            <IconSymbol
              ios_icon_name="person.circle.fill"
              android_material_icon_name="account_circle"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.adminEmail, { color: colors.textSecondary }]} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        )}
        
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <IconSymbol
            ios_icon_name="rectangle.portrait.and.arrow.right"
            android_material_icon_name="logout"
            size={24}
            color={colors.error}
          />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Déconnexion
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminEmail: {
    fontSize: 14,
    maxWidth: 200,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
