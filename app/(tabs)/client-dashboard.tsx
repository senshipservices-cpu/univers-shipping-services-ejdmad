
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { supabase } from "@/app/integrations/supabase/client";
import { colors } from "@/styles/commonStyles";

interface ClientProfile {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  is_verified: boolean;
  preferred_language: string | null;
}

interface Port {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
}

interface Shipment {
  id: string;
  tracking_number: string;
  current_status: string;
  origin_port: Port | null;
  destination_port: Port | null;
  eta: string | null;
  etd: string | null;
  cargo_type: string | null;
  container_type: string | null;
  created_at: string;
  last_update: string | null;
}

interface FreightQuote {
  id: string;
  status: string;
  cargo_type: string | null;
  created_at: string;
  origin_port: Port | null;
  destination_port: Port | null;
}

export default function ClientDashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, client: authClient, signOut, isEmailVerified } = useAuth();
  const { isAdmin } = useAdmin();
  const subscriptionAccess = useSubscriptionAccess();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [quotes, setQuotes] = useState<FreightQuote[]>([]);
  const [quotesCount, setQuotesCount] = useState(0);
  const [shipmentsCount, setShipmentsCount] = useState(0);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }

    try {
      setLoading(true);

      // Load client profile linked to user_id
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (clientError) {
        console.error('Error loading client profile:', clientError);
        if (clientError.code === 'PGRST116') {
          setClientProfile(null);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      } else {
        setClientProfile(clientData);

        // Load freight quotes count for this client
        const { count: quotesCountData, error: quotesCountError } = await supabase
          .from('freight_quotes')
          .select('*', { count: 'exact', head: true })
          .eq('client', clientData.id);

        if (!quotesCountError) {
          setQuotesCount(quotesCountData || 0);
        }

        // Load recent freight quotes
        const { data: quotesData, error: quotesError } = await supabase
          .from('freight_quotes')
          .select(`
            *,
            origin_port:ports!freight_quotes_origin_port_fkey(id, name, city, country),
            destination_port:ports!freight_quotes_destination_port_fkey(id, name, city, country)
          `)
          .eq('client', clientData.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (quotesError) {
          console.error('Error loading quotes:', quotesError);
        } else {
          setQuotes(quotesData || []);
        }

        // Load shipments count for this client
        const { count: shipmentsCountData, error: shipmentsCountError } = await supabase
          .from('shipments')
          .select('*', { count: 'exact', head: true })
          .eq('client', clientData.id);

        if (!shipmentsCountError) {
          setShipmentsCount(shipmentsCountData || 0);
        }

        // Load shipments for this client
        const { data: shipmentsData, error: shipmentsError } = await supabase
          .from('shipments')
          .select(`
            *,
            origin_port:ports!shipments_origin_port_fkey(id, name, city, country),
            destination_port:ports!shipments_destination_port_fkey(id, name, city, country)
          `)
          .eq('client', clientData.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (shipmentsError) {
          console.error('Error loading shipments:', shipmentsError);
        } else {
          setShipments(shipmentsData || []);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
    subscriptionAccess.refresh();
  }, [loadDashboardData, subscriptionAccess]);

  const handleLogout = useCallback(async () => {
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
  }, [signOut, router]);

  const handleDigitalPortalAccess = useCallback(() => {
    console.log('Digital Portal Access - hasDigitalPortalAccess:', subscriptionAccess.hasDigitalPortalAccess);
    
    if (subscriptionAccess.hasDigitalPortalAccess) {
      router.push('/(tabs)/digital-portal');
    } else {
      router.push('/(tabs)/pricing?highlight=digital_portal');
    }
  }, [subscriptionAccess.hasDigitalPortalAccess, router]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'delivered':
      case 'accepted':
        return '#10b981';
      case 'in_transit':
      case 'confirmed':
      case 'in_progress':
        return colors.primary;
      case 'at_port':
      case 'sent_to_client':
        return '#f59e0b';
      case 'on_hold':
      case 'cancelled':
      case 'refused':
        return '#ef4444';
      case 'draft':
      case 'quote_pending':
      case 'received':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  }, []);

  const formatStatus = useCallback((status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);

  const handleShipmentClick = useCallback((shipmentId: string) => {
    if (!subscriptionAccess.hasFullTrackingAccess) {
      Alert.alert(
        'Accès limité',
        'Le suivi détaillé des expéditions nécessite un abonnement Premium Tracking ou Enterprise Logistics.\n\nVoulez-vous découvrir nos plans ?',
        [
          {
            text: 'Voir les plans',
            onPress: () => router.push('/(tabs)/pricing'),
          },
          {
            text: 'Annuler',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    router.push(`/(tabs)/shipment-detail?id=${shipmentId}`);
  }, [subscriptionAccess.hasFullTrackingAccess, router]);

  // Redirect if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/login" />;
  }

  // Redirect if email is not verified
  if (!isEmailVerified()) {
    return <Redirect href="/(tabs)/verify-email" />;
  }

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Mon compte
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t('common.loading')}
          </Text>
        </View>
      </View>
    );
  }

  // No client profile state
  if (!clientProfile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Mon compte
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
        <View style={styles.emptyStateContainer}>
          <IconSymbol
            ios_icon_name="person.crop.circle.badge.exclamationmark"
            android_material_icon_name="person_off"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
            Profil client incomplet
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Veuillez compléter votre profil client pour accéder au tableau de bord.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/client-profile')}
          >
            <Text style={styles.primaryButtonText}>Compléter mon profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Mon compte
        </Text>
        <View style={styles.headerActions}>
          {isAdmin && (
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/admin-dashboard')} 
              style={styles.adminButton}
            >
              <IconSymbol
                ios_icon_name="shield.lefthalf.filled"
                android_material_icon_name="admin_panel_settings"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
            Bonjour,
          </Text>
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, { color: theme.colors.text }]}>
              {clientProfile.contact_name || user.email || 'Client'}
            </Text>
            {isAdmin && (
              <View style={[styles.adminBadge, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="shield.lefthalf.filled"
                  android_material_icon_name="admin_panel_settings"
                  size={14}
                  color={colors.primary}
                />
                <Text style={[styles.adminBadgeText, { color: colors.primary }]}>Admin</Text>
              </View>
            )}
          </View>
          
          {/* User Information Display */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email :</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {user.email}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="building.2"
                android_material_icon_name="business"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Société :</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {clientProfile.company_name}
              </Text>
            </View>

            {clientProfile.country && (
              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="globe"
                  android_material_icon_name="public"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Pays :</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {clientProfile.country}
                </Text>
              </View>
            )}

            {clientProfile.preferred_language && (
              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="globe.badge.chevron.backward"
                  android_material_icon_name="language"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Langue :</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {clientProfile.preferred_language.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <IconSymbol
                ios_icon_name="doc.text.fill"
                android_material_icon_name="description"
                size={32}
                color={colors.primary}
              />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{quotesCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Devis envoyés</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <IconSymbol
                ios_icon_name="shippingbox.fill"
                android_material_icon_name="inventory_2"
                size={32}
                color={colors.secondary}
              />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{shipmentsCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Expéditions</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/freight-quote')}
          >
            <IconSymbol
              ios_icon_name="doc.text"
              android_material_icon_name="description"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>Mes devis</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => {
              if (shipmentsCount === 0) {
                Alert.alert('Aucune expédition', 'Vous n\'avez pas encore d\'expéditions.');
              } else {
                // Navigate to shipments list (you can create this page later)
                Alert.alert('Mes commandes / shipments', 'Liste des expéditions à venir');
              }
            }}
          >
            <IconSymbol
              ios_icon_name="shippingbox"
              android_material_icon_name="inventory_2"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>Mes commandes / shipments</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: colors.border, borderWidth: 2 }]}
            onPress={() => router.push('/(tabs)/client-profile')}
          >
            <IconSymbol
              ios_icon_name="person.circle"
              android_material_icon_name="person"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.actionButtonTextSecondary, { color: colors.primary }]}>
              Mettre à jour mon profil
            </Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Recent Quotes Section */}
        {quotes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Devis récents
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/freight-quote')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>Tout voir</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quotesContainer}>
              {quotes.map((quote, index) => (
                <View
                  key={index}
                  style={[styles.quoteCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.quoteHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                        {formatStatus(quote.status)}
                      </Text>
                    </View>
                    <Text style={[styles.quoteDate, { color: colors.textSecondary }]}>
                      {formatDate(quote.created_at)}
                    </Text>
                  </View>

                  <View style={styles.quoteRoute}>
                    <Text style={[styles.routeText, { color: theme.colors.text }]}>
                      {quote.origin_port?.name || 'Origin'} → {quote.destination_port?.name || 'Destination'}
                    </Text>
                  </View>

                  {quote.cargo_type && (
                    <Text style={[styles.cargoType, { color: colors.textSecondary }]}>
                      {quote.cargo_type}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Shipments Section */}
        {shipments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Expéditions récentes
              </Text>
            </View>

            <View style={styles.shipmentsContainer}>
              {shipments.map((shipment, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.shipmentCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                  onPress={() => handleShipmentClick(shipment.id)}
                >
                  <View style={styles.shipmentHeader}>
                    <Text style={[styles.trackingNumber, { color: theme.colors.text }]}>
                      {shipment.tracking_number}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipment.current_status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(shipment.current_status) }]}>
                        {formatStatus(shipment.current_status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.shipmentRoute}>
                    <Text style={[styles.routeText, { color: colors.textSecondary }]}>
                      {shipment.origin_port?.name || 'Origin'} → {shipment.destination_port?.name || 'Destination'}
                    </Text>
                  </View>

                  {shipment.eta && (
                    <View style={styles.etaContainer}>
                      <IconSymbol
                        ios_icon_name="clock"
                        android_material_icon_name="schedule"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.etaText, { color: colors.textSecondary }]}>
                        ETA: {formatDate(shipment.eta)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Administration
            </Text>
            <TouchableOpacity
              style={[styles.adminCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/admin-dashboard')}
            >
              <View style={styles.adminCardContent}>
                <IconSymbol
                  ios_icon_name="shield.lefthalf.filled"
                  android_material_icon_name="admin_panel_settings"
                  size={40}
                  color={colors.primary}
                />
                <View style={styles.adminCardText}>
                  <Text style={[styles.adminCardTitle, { color: theme.colors.text }]}>
                    Panneau d&apos;administration
                  </Text>
                  <Text style={[styles.adminCardSubtitle, { color: colors.textSecondary }]}>
                    Gérer les devis, agents, abonnements et expéditions
                  </Text>
                </View>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminButton: {
    padding: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeSection: {
    padding: 20,
    gap: 16,
  },
  greetingText: {
    fontSize: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  nameText: {
    fontSize: 32,
    fontWeight: '700',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
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
  quotesContainer: {
    gap: 12,
  },
  quoteCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quoteDate: {
    fontSize: 13,
  },
  quoteRoute: {
    marginTop: 4,
  },
  routeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cargoType: {
    fontSize: 14,
  },
  shipmentsContainer: {
    gap: 12,
  },
  shipmentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  shipmentRoute: {
    marginTop: 4,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  etaText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  adminCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  adminCardText: {
    flex: 1,
    gap: 4,
  },
  adminCardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  adminCardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
