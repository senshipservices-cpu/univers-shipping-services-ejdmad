
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
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

interface Shipment {
  id: string;
  tracking_number: string;
  current_status: string;
  origin_port: any;
  destination_port: any;
  eta: string | null;
  etd: string | null;
  cargo_type: string | null;
  container_type: string | null;
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
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/(tabs)/client-space');
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load client profile
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (clientError) {
        console.error('Error loading client profile:', clientError);
      } else {
        setClientProfile(clientData);

        // Load shipments
        const { data: shipmentsData, error: shipmentsError } = await supabase
          .from('shipments')
          .select(`
            *,
            origin_port:ports!shipments_origin_port_fkey(name, city, country),
            destination_port:ports!shipments_destination_port_fkey(name, city, country)
          `)
          .eq('client', clientData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (shipmentsError) {
          console.error('Error loading shipments:', shipmentsError);
        } else {
          setShipments(shipmentsData || []);
        }

        // Load subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('client', clientData.id)
          .eq('is_active', true)
          .single();

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Error loading subscription:', subscriptionError);
        } else {
          setSubscription(subscriptionData);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/(tabs)/client-space');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'in_transit':
        return colors.primary;
      case 'at_port':
        return '#f59e0b';
      case 'on_hold':
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <IconSymbol
            ios_icon_name="rectangle.portrait.and.arrow.right"
            android_material_icon_name="logout"
            size={24}
            color={theme.colors.text}
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
          <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
            Welcome back,
          </Text>
          <Text style={[styles.companyName, { color: theme.colors.text }]}>
            {clientProfile?.company_name || 'Client'}
          </Text>
          {!clientProfile?.is_verified && (
            <View style={styles.verificationBanner}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={20}
                color="#f59e0b"
              />
              <Text style={styles.verificationText}>Account pending verification</Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="inventory_2"
              size={32}
              color={colors.primary}
            />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{shipments.length}</Text>
            <Text style={styles.statLabel}>Active Shipments</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={32}
              color={colors.secondary}
            />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {subscription ? formatStatus(subscription.plan_type) : 'Basic'}
            </Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
              onPress={() => router.push('/(tabs)/client-profile')}
            >
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
              onPress={() => router.push('/(tabs)/pricing')}
            >
              <IconSymbol
                ios_icon_name="creditcard.fill"
                android_material_icon_name="credit_card"
                size={24}
                color={colors.secondary}
              />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Upgrade Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Shipments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Shipments</Text>
            {shipments.length > 0 && (
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {shipments.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
              <IconSymbol
                ios_icon_name="shippingbox"
                android_material_icon_name="inventory_2"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
                No shipments yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Your shipments will appear here once created
              </Text>
            </View>
          ) : (
            <View style={styles.shipmentsContainer}>
              {shipments.map((shipment, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.shipmentCard, { backgroundColor: theme.colors.card }]}
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
                      <Text style={styles.routeText}>
                        {shipment.origin_port?.city || 'Origin'}
                      </Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routePoint}>
                      <IconSymbol
                        ios_icon_name="circle"
                        android_material_icon_name="circle"
                        size={8}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.routeText}>
                        {shipment.destination_port?.city || 'Destination'}
                      </Text>
                    </View>
                  </View>
                  {shipment.eta && (
                    <Text style={styles.etaText}>
                      ETA: {new Date(shipment.eta).toLocaleDateString()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
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
  welcomeSection: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  verificationText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  shipmentsContainer: {
    gap: 12,
  },
  shipmentCard: {
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shipmentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    marginBottom: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  routeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  etaText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
