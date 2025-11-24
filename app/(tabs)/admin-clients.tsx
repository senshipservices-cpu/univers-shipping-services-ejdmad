
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import { supabase } from '@/app/integrations/supabase/client';

interface Client {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  quotes_count: number;
  shipments_count: number;
  active_subscription: {
    plan_type: string;
  } | null;
  created_at: string;
}

export default function AdminClientsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const isAdmin = appConfig.isAdmin(user?.email);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);

      // Load clients with their quotes and shipments count
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsError) {
        console.error('Error loading clients:', clientsError);
        Alert.alert('Erreur', 'Impossible de charger les clients.');
        return;
      }

      // For each client, get quotes count, shipments count, and active subscription
      const clientsWithCounts = await Promise.all(
        (clientsData || []).map(async (client) => {
          // Get quotes count
          const { count: quotesCount } = await supabase
            .from('freight_quotes')
            .select('*', { count: 'exact', head: true })
            .eq('client', client.id);

          // Get shipments count
          const { count: shipmentsCount } = await supabase
            .from('shipments')
            .select('*', { count: 'exact', head: true })
            .eq('client', client.id);

          // Get active subscription
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('plan_type')
            .eq('client', client.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...client,
            quotes_count: quotesCount || 0,
            shipments_count: shipmentsCount || 0,
            active_subscription: subscriptionData || null,
          };
        })
      );

      setClients(clientsWithCounts);
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement des clients.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadClients();
    }
  }, [user, isAdmin, loadClients]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClients();
  }, [loadClients]);

  if (!authLoading && !user) {
    return <Redirect href="/(tabs)/login" />;
  }

  if (!authLoading && user && !isAdmin) {
    return <Redirect href="/(tabs)/login" />;
  }

  if (authLoading || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement des clients...
          </Text>
        </View>
      </View>
    );
  }

  const formatPlanType = (planType: string | null) => {
    if (!planType) return 'Aucun';
    const planMap: { [key: string]: string } = {
      basic: 'Basic',
      premium_tracking: 'Premium',
      enterprise_logistics: 'Enterprise',
      agent_listing: 'Agent',
      digital_portal: 'Digital',
    };
    return planMap[planType] || planType;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow_back"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Clients
          </Text>
        </View>
      </View>

      {/* Clients List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {clients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="person.2.slash"
              android_material_icon_name="people_outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucun client trouvé
            </Text>
          </View>
        ) : (
          clients.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={[styles.clientCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/(tabs)/admin-client-details?id=${client.id}` as any)}
            >
              <View style={styles.clientHeader}>
                <View style={styles.clientHeaderLeft}>
                  <Text style={[styles.clientName, { color: theme.colors.text }]}>
                    {client.company_name}
                  </Text>
                  {client.contact_name && (
                    <Text style={[styles.contactName, { color: colors.textSecondary }]}>
                      {client.contact_name}
                    </Text>
                  )}
                </View>
                <View style={[
                  styles.planBadge,
                  { backgroundColor: client.active_subscription ? colors.primary + '20' : colors.textSecondary + '20' }
                ]}>
                  <Text style={[
                    styles.planText,
                    { color: client.active_subscription ? colors.primary : colors.textSecondary }
                  ]}>
                    {formatPlanType(client.active_subscription?.plan_type || null)}
                  </Text>
                </View>
              </View>

              <View style={styles.clientDetails}>
                {client.email && (
                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="envelope"
                      android_material_icon_name="email"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {client.email}
                    </Text>
                  </View>
                )}

                {client.phone && (
                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="phone"
                      android_material_icon_name="phone"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {client.phone}
                    </Text>
                  </View>
                )}

                {client.country && (
                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="location"
                      android_material_icon_name="location_on"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {client.country}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.clientStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {client.quotes_count}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Devis
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {client.shipments_count}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Shipments
                  </Text>
                </View>
              </View>

              <View style={styles.clientFooter}>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron_right"
                  size={20}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  clientCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
  },
  contactName: {
    fontSize: 14,
  },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clientDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  clientStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  clientFooter: {
    alignItems: 'flex-end',
  },
});
