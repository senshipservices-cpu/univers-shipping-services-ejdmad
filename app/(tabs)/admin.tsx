
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';

export default function AdminScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading, signOut } = useAuth();

  // Check if user is admin
  const isAdmin = appConfig.isAdmin(user?.email);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    Alert.alert(
      'Accès refusé',
      'Accès réservé à l\'équipe Universal Shipping Services.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/login'),
        },
      ]
    );
    return <Redirect href="/(tabs)/login" />;
  }

  // Redirect to login if not admin
  if (!loading && user && !isAdmin) {
    Alert.alert(
      'Accès refusé',
      'Accès réservé à l\'équipe Universal Shipping Services.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/login'),
        },
      ]
    );
    return <Redirect href="/(tabs)/login" />;
  }

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
            await signOut();
            router.replace('/(tabs)/(home)/');
          },
        },
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View style={styles.headerLeft}>
          <IconSymbol
            ios_icon_name="shield.lefthalf.filled"
            android_material_icon_name="admin_panel_settings"
            size={32}
            color={colors.primary}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Administration
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.adminEmail, { color: colors.textSecondary }]}>
            {user?.email}
          </Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <IconSymbol
              ios_icon_name="rectangle.portrait.and.arrow.right"
              android_material_icon_name="logout"
              size={24}
              color={colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
            Bienvenue dans le panneau d&apos;administration
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Universal Shipping Services
          </Text>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/admin-dashboard')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol
                ios_icon_name="chart.bar.fill"
                android_material_icon_name="dashboard"
                size={32}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Dashboard</Text>
            <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
              Statistiques et aperçu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/admin-quotes')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.secondary + '20' }]}>
              <IconSymbol
                ios_icon_name="doc.text.fill"
                android_material_icon_name="description"
                size={32}
                color={colors.secondary}
              />
            </View>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Devis</Text>
            <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
              Gérer les demandes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/admin-shipments')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#10b981' + '20' }]}>
              <IconSymbol
                ios_icon_name="shippingbox.fill"
                android_material_icon_name="inventory_2"
                size={32}
                color="#10b981"
              />
            </View>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Shipments</Text>
            <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
              Suivi des expéditions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/admin-agents-ports')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#f59e0b' + '20' }]}>
              <IconSymbol
                ios_icon_name="person.3.fill"
                android_material_icon_name="groups"
                size={32}
                color="#f59e0b"
              />
            </View>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Agents & Ports</Text>
            <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
              Réseau mondial
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/admin-subscriptions')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#8b5cf6' + '20' }]}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={32}
                color="#8b5cf6"
              />
            </View>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Abonnements</Text>
            <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
              Plans et paiements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/admin-services')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#ec4899' + '20' }]}>
              <IconSymbol
                ios_icon_name="wrench.and.screwdriver.fill"
                android_material_icon_name="build"
                size={32}
                color="#ec4899"
              />
            </View>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Services</Text>
            <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
              Catalogue de services
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/admin-clients')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#06b6d4' + '20' }]}>
              <IconSymbol
                ios_icon_name="person.2.fill"
                android_material_icon_name="people"
                size={32}
                color="#06b6d4"
              />
            </View>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Clients</Text>
            <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
              Base de données clients
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/admin-config')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.textSecondary + '20' }]}>
              <IconSymbol
                ios_icon_name="gearshape.fill"
                android_material_icon_name="settings"
                size={32}
                color={colors.textSecondary}
              />
            </View>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Configuration</Text>
            <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
              Paramètres système
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Actions rapides
          </Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/admin-dashboard')}
          >
            <IconSymbol
              ios_icon_name="chart.bar"
              android_material_icon_name="analytics"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>Voir le Dashboard</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: colors.border, borderWidth: 2 }]}
            onPress={() => router.push('/(tabs)/client-dashboard')}
          >
            <IconSymbol
              ios_icon_name="person.circle"
              android_material_icon_name="person"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.actionButtonTextSecondary, { color: colors.primary }]}>
              Retour à l&apos;espace client
            </Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminEmail: {
    fontSize: 14,
    maxWidth: 150,
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  welcomeSection: {
    padding: 20,
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    fontSize: 16,
  },
  menuGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  menuCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  menuIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  menuDescription: {
    fontSize: 14,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    gap: 12,
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
