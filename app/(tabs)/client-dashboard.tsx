
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
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

interface Subscription {
  id: string;
  plan_type: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export default function ClientDashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, client: authClient, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // Redirect if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/client-space" />;
  }

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }

    try {
      setLoading(true);

      // Load client profile
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (clientError) {
        console.error('Error loading client profile:', clientError);
        // If no client profile exists, show message
        if (clientError.code === 'PGRST116') {
          setClientProfile(null);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      } else {
        setClientProfile(clientData);

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
          .limit(10);

        if (shipmentsError) {
          console.error('Error loading shipments:', shipmentsError);
        } else {
          setShipments(shipmentsData || []);
        }

        // Load active subscriptions for this client
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('client', clientData.id)
          .eq('is_active', true);

        if (subscriptionsError) {
          console.error('Error loading subscriptions:', subscriptionsError);
        } else {
          setSubscriptions(subscriptionsData || []);
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
  }, [loadDashboardData]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'in_transit':
      case 'confirmed':
        return colors.primary;
      case 'at_port':
        return '#f59e0b';
      case 'on_hold':
      case 'cancelled':
        return '#ef4444';
      case 'draft':
      case 'quote_pending':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatPlanType = (planType: string) => {
    const planNames: Record<string, string> = {
      'basic': 'Basic',
      'premium_tracking': 'Premium Tracking',
      'enterprise_logistics': 'Enterprise Logistics',
      'agent_listing': 'Agent Listing',
    };
    return planNames[planType] || planType;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t('clientSpace.dashboard')}
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
            {t('clientSpace.dashboard')}
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
          {t('clientSpace.dashboard')}
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
          <Text style={[styles.nameText, { color: theme.colors.text }]}>
            {clientProfile.contact_name || clientProfile.email || 'Client'}
          </Text>
          
          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="building.2"
              android_material_icon_name="business"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Entreprise : {clientProfile.company_name}
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
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Pays : {clientProfile.country}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.updateProfileButton, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/client-profile')}
          >
            <IconSymbol
              ios_icon_name="person.circle"
              android_material_icon_name="person"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.updateProfileText, { color: colors.primary }]}>
              Mettre à jour mon profil
            </Text>
          </TouchableOpacity>
        </View>

        {/* My Subscriptions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Mes abonnements
          </Text>
          
          {subscriptions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <IconSymbol
                ios_icon_name="star.circle"
                android_material_icon_name="star_border"
                size={40}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyCardText, { color: theme.colors.text }]}>
                Vous n&apos;avez pas encore d&apos;abonnement actif.
              </Text>
              <Text style={[styles.emptyCardSubtext, { color: colors.textSecondary }]}>
                Consultez la page Pricing pour découvrir nos plans.
              </Text>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/pricing')}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  Voir les plans
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.subscriptionsContainer}>
              {subscriptions.map((subscription, index) => (
                <View
                  key={index}
                  style={[styles.subscriptionCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.subscriptionHeader}>
                    <View style={[styles.planBadge, { backgroundColor: colors.primary + '20' }]}>
                      <IconSymbol
                        ios_icon_name="star.fill"
                        android_material_icon_name="star"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={[styles.planType, { color: colors.primary }]}>
                        {formatPlanType(subscription.plan_type)}
                      </Text>
                    </View>
                    <View style={[styles.activeBadge, { backgroundColor: '#10b981' + '20' }]}>
                      <Text style={[styles.activeText, { color: '#10b981' }]}>Actif</Text>
                    </View>
                  </View>
                  <View style={styles.subscriptionDates}>
                    <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                      Début : {formatDate(subscription.start_date)}
                    </Text>
                    {subscription.end_date && (
                      <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                        Fin : {formatDate(subscription.end_date)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* My Shipments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Mes dossiers logistiques
            </Text>
            {shipments.length > 0 && (
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>Tout voir</Text>
              </TouchableOpacity>
            )}
          </View>

          {shipments.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <IconSymbol
                ios_icon_name="shippingbox"
                android_material_icon_name="inventory_2"
                size={40}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyCardText, { color: theme.colors.text }]}>
                Vous n&apos;avez pas encore de dossier logistique en cours.
              </Text>
              <Text style={[styles.emptyCardSubtext, { color: colors.textSecondary }]}>
                Contactez-nous pour créer votre première expédition.
              </Text>
            </View>
          ) : (
            <View style={styles.shipmentsContainer}>
              {shipments.map((shipment, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.shipmentCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/(tabs)/shipment-detail?id=${shipment.id}`)}
                >
                  <View style={styles.shipmentHeader}>
                    <View style={styles.shipmentInfo}>
                      <Text style={[styles.trackingNumber, { color: theme.colors.text }]}>
                        {shipment.tracking_number}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipment.current_status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(shipment.current_status) }]}>
                          {formatStatus(shipment.current_status)}
                        </Text>
                      </View>
                    </View>
                    <IconSymbol
                      ios_icon_name="chevron.right"
                      android_material_icon_name="chevron_right"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </View>

                  <View style={styles.shipmentRoute}>
                    <View style={styles.routePoint}>
                      <IconSymbol
                        ios_icon_name="circle.fill"
                        android_material_icon_name="circle"
                        size={8}
                        color={colors.primary}
                      />
                      <Text style={[styles.routeText, { color: colors.textSecondary }]}>
                        {shipment.origin_port?.name || 'Origin'}
                      </Text>
                    </View>
                    <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
                    <View style={styles.routePoint}>
                      <IconSymbol
                        ios_icon_name="location.fill"
                        android_material_icon_name="location_on"
                        size={8}
                        color={colors.secondary}
                      />
                      <Text style={[styles.routeText, { color: colors.textSecondary }]}>
                        {shipment.destination_port?.name || 'Destination'}
                      </Text>
                    </View>
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

                  <View style={styles.shipmentFooter}>
                    <Text style={[styles.detailLink, { color: colors.primary }]}>
                      Voir le détail →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Actions rapides
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => {
                Alert.alert('Demander un devis', 'Cette fonctionnalité sera bientôt disponible.');
              }}
            >
              <IconSymbol
                ios_icon_name="doc.text"
                android_material_icon_name="description"
                size={28}
                color={colors.primary}
              />
              <Text style={[styles.actionCardText, { color: theme.colors.text }]}>
                Demander un devis
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => {
                Alert.alert('Contacter le support', 'Email: support@3sglobal.com');
              }}
            >
              <IconSymbol
                ios_icon_name="envelope"
                android_material_icon_name="email"
                size={28}
                color={colors.secondary}
              />
              <Text style={[styles.actionCardText, { color: theme.colors.text }]}>
                Contacter le support
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    gap: 8,
  },
  greetingText: {
    fontSize: 16,
  },
  nameText: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  infoText: {
    fontSize: 15,
  },
  updateProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  updateProfileText: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  emptyCardText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCardSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  subscriptionsContainer: {
    gap: 12,
  },
  subscriptionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planType: {
    fontSize: 15,
    fontWeight: '700',
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionDates: {
    gap: 4,
  },
  dateLabel: {
    fontSize: 14,
  },
  shipmentsContainer: {
    gap: 12,
  },
  shipmentCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shipmentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '700',
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
  shipmentRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  routeLine: {
    height: 1,
    width: 40,
  },
  routeText: {
    fontSize: 14,
    flex: 1,
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
  shipmentFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  actionCardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
