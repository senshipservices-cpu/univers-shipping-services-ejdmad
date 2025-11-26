
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  account_type: 'individual' | 'business';
  company_name?: string;
  country?: string;
  city?: string;
  preferred_language?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut, isEmailVerified } = useAuth();

  // Screen state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load profile data from API
  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      console.log('[PROFILE] No user ID available');
      return;
    }

    try {
      console.log('[PROFILE] Loading profile data...');
      setProfileLoading(true);
      setProfileError(null);

      // Fetch user data from clients table
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('[PROFILE] Error loading profile:', error);
        setProfileError('Impossible de charger vos informations pour le moment.');
        setProfileLoading(false);
        return;
      }

      console.log('[PROFILE] Profile data loaded:', data);

      // Transform data to match ProfileData interface
      const profile: ProfileData = {
        id: data.id,
        name: data.contact_name || data.company_name || user.email || 'Utilisateur',
        email: data.email || user.email || '',
        phone: data.phone || '',
        account_type: data.account_type || 'individual',
        company_name: data.company_name,
        country: data.country,
        city: data.city,
        preferred_language: data.preferred_language,
      };

      setProfileData(profile);
      setProfileLoading(false);
    } catch (error) {
      console.error('[PROFILE] Exception loading profile:', error);
      setProfileError('Impossible de charger vos informations pour le moment.');
      setProfileLoading(false);
    }
  }, [user]);

  // Load profile on mount
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  // Handle edit profile button
  const handleEditProfile = useCallback(() => {
    console.log('[PROFILE] Edit profile button clicked');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to EditProfile with initial profile data
    if (profileData) {
      router.push({
        pathname: '/(tabs)/edit-profile',
        params: {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          account_type: profileData.account_type,
        },
      });
    }
  }, [router, profileData]);

  // Handle change password button
  const handleChangePassword = useCallback(() => {
    console.log('[PROFILE] Change password button clicked');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to ChangePassword screen
    router.push('/(tabs)/change-password');
  }, [router]);

  // Handle logout button
  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      console.log('[PROFILE] Starting logout process...');
      
      await signOut();
      
      console.log('[PROFILE] Logout successful, redirecting to home...');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.error('[PROFILE] Logout error:', error);
      Alert.alert('Erreur', 'La déconnexion a échoué, merci de réessayer.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [signOut, router]);

  // Confirm logout
  const confirmLogout = useCallback(() => {
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
          onPress: handleLogout,
        },
      ]
    );
  }, [handleLogout]);

  // Format account type
  const formatAccountType = useCallback((type: string) => {
    return type === 'individual' ? 'Particulier' : 'Entreprise';
  }, []);

  // Redirect if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/login" />;
  }

  // Redirect if email is not verified
  if (!isEmailVerified()) {
    return <Redirect href="/(tabs)/verify-email" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Mon profil
        </Text>
        {!profileLoading && profileData && (
          <TouchableOpacity
            style={styles.logoutIconButton}
            onPress={confirmLogout}
            disabled={isLoggingOut}
          >
            <IconSymbol
              ios_icon_name="rectangle.portrait.and.arrow.right"
              android_material_icon_name="logout"
              size={24}
              color={colors.error}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading State */}
        {profileLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Chargement de votre profil...
            </Text>
          </View>
        )}

        {/* Error State */}
        {profileError && !profileLoading && (
          <View style={styles.errorContainer}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="error"
              size={48}
              color={colors.error}
            />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {profileError}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadProfile}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Content */}
        {!profileLoading && !profileError && profileData && (
          <View style={styles.contentContainer}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="person.fill"
                  android_material_icon_name="person"
                  size={48}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {profileData.name}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {profileData.email}
              </Text>
            </View>

            {/* Profile Information Card */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Mes informations
              </Text>
              
              <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
                {/* Name */}
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Nom
                    </Text>
                  </View>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {profileData.name}
                  </Text>
                </View>

                {/* Email */}
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <IconSymbol
                      ios_icon_name="envelope.fill"
                      android_material_icon_name="email"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Email
                    </Text>
                  </View>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {profileData.email}
                  </Text>
                </View>

                {/* Phone */}
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <IconSymbol
                      ios_icon_name="phone.fill"
                      android_material_icon_name="phone"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Téléphone
                    </Text>
                  </View>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {profileData.phone || 'Non renseigné'}
                  </Text>
                </View>

                {/* Account Type */}
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <IconSymbol
                      ios_icon_name="briefcase.fill"
                      android_material_icon_name="work"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Type de compte
                    </Text>
                  </View>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {formatAccountType(profileData.account_type)}
                  </Text>
                </View>

                {/* Company Name (if business) */}
                {profileData.account_type === 'business' && profileData.company_name && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <IconSymbol
                        ios_icon_name="building.2.fill"
                        android_material_icon_name="business"
                        size={20}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Entreprise
                      </Text>
                    </View>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {profileData.company_name}
                    </Text>
                  </View>
                )}

                {/* Country */}
                {profileData.country && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <IconSymbol
                        ios_icon_name="globe"
                        android_material_icon_name="public"
                        size={20}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Pays
                      </Text>
                    </View>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {profileData.country}
                    </Text>
                  </View>
                )}

                {/* City */}
                {profileData.city && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabelContainer}>
                      <IconSymbol
                        ios_icon_name="mappin.circle.fill"
                        android_material_icon_name="location_city"
                        size={20}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Ville
                      </Text>
                    </View>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                      {profileData.city}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Actions
              </Text>

              {/* Edit Profile Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryActionButton, { backgroundColor: colors.primary }]}
                onPress={handleEditProfile}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>
                  Modifier mes informations
                </Text>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron_right"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {/* Change Password Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryActionButton, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                onPress={handleChangePassword}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="lock.fill"
                  android_material_icon_name="lock"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={[styles.actionButtonTextSecondary, { color: colors.secondary }]}>
                  Changer mon mot de passe
                </Text>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron_right"
                  size={20}
                  color={colors.secondary}
                />
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.dangerActionButton, { backgroundColor: colors.error, opacity: isLoggingOut ? 0.6 : 1 }]}
                onPress={confirmLogout}
                activeOpacity={0.7}
                disabled={isLoggingOut}
              >
                <IconSymbol
                  ios_icon_name="rectangle.portrait.and.arrow.right"
                  android_material_icon_name="logout"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>
                  {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  logoutIconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 20,
    gap: 24,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  infoRow: {
    gap: 8,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    marginLeft: 28,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  primaryActionButton: {
    // backgroundColor set inline
  },
  secondaryActionButton: {
    borderWidth: 2,
  },
  dangerActionButton: {
    // backgroundColor set inline
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonTextSecondary: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});
