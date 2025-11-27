
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import { supabase } from '@/app/integrations/supabase/client';

const { width } = Dimensions.get('window');

interface DashboardStats {
  total_quotes: number;
  quotes_last_7_days: number;
  quotes_last_30_days: number;
  total_users: number;
  admin_users: number;
  regular_users: number;
  top_ports: Array<{
    id: string;
    name: string;
    city: string;
    country: string;
    total_quotes: number;
    departure_count: number;
    arrival_count: number;
  }>;
  top_agents: Array<{
    id: string;
    company_name: string;
    port_name: string;
    port_country: string;
    quotes_count: number;
  }>;
  quotes_by_day: Array<{
    day: string;
    count: number;
  }>;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Check if user is admin
  const isAdmin = appConfig.isAdmin(user?.email);

  // Load dashboard data using RPC function
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      console.log('[ADMIN DASHBOARD] Loading dashboard stats...');
      
      // Call the RPC function to get all stats
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');

      if (error) {
        console.error('[ADMIN DASHBOARD] Error loading stats:', error);
        Alert.alert('Erreur', 'Impossible de charger les statistiques du dashboard.');
        return;
      }

      console.log('[ADMIN DASHBOARD] Stats loaded:', data);
      setStats(data);
    } catch (error) {
      console.error('[ADMIN DASHBOARD] Exception loading dashboard data:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement des données.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

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

  // useEffect MUST be called before any conditional returns
  useEffect(() => {
    if (user && isAdmin) {
      loadDashboardData();
    }
  }, [user, isAdmin, loadDashboardData]);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
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
  if (!authLoading && user && !isAdmin) {
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Calculate max value for chart scaling
  const maxQuotesPerDay = stats?.quotes_by_day?.length 
    ? Math.max(...stats.quotes_by_day.map(d => d.count))
    : 1;

  // Loading state
  if (authLoading || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement du dashboard...
          </Text>
        </View>
      </View>
    );
  }

  // No data state
  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="warning"
            size={48}
            color={colors.warning}
          />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Aucune donnée disponible
          </Text>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={onRefresh}
          >
            <IconSymbol
              ios_icon_name="arrow.clockwise"
              android_material_icon_name="refresh"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.refreshButtonText}>Actualiser</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol
            ios_icon_name="chart.bar.fill"
            android_material_icon_name="analytics"
            size={28}
            color={colors.primary}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Dashboard Admin
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshIconButton, { backgroundColor: colors.primary + '20' }]}
          onPress={onRefresh}
        >
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={24}
            color={colors.primary}
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
        {/* KPI Cards Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Indicateurs Clés
          </Text>

          <View style={styles.kpiGrid}>
            {/* Total Quotes */}
            <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <View style={[styles.kpiIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="doc.text.fill"
                  android_material_icon_name="description"
                  size={28}
                  color={colors.primary}
                />
              </View>
              <View style={styles.kpiContent}>
                <Text style={[styles.kpiValue, { color: theme.colors.text }]}>
                  {formatNumber(stats.total_quotes)}
                </Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                  Total Devis
                </Text>
              </View>
            </View>

            {/* Quotes Last 7 Days */}
            <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#10b981' + '20' }]}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="event"
                  size={28}
                  color="#10b981"
                />
              </View>
              <View style={styles.kpiContent}>
                <Text style={[styles.kpiValue, { color: theme.colors.text }]}>
                  {formatNumber(stats.quotes_last_7_days)}
                </Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                  7 derniers jours
                </Text>
              </View>
            </View>

            {/* Quotes Last 30 Days */}
            <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <View style={[styles.kpiIconContainer, { backgroundColor: colors.secondary + '20' }]}>
                <IconSymbol
                  ios_icon_name="calendar.badge.clock"
                  android_material_icon_name="date_range"
                  size={28}
                  color={colors.secondary}
                />
              </View>
              <View style={styles.kpiContent}>
                <Text style={[styles.kpiValue, { color: theme.colors.text }]}>
                  {formatNumber(stats.quotes_last_30_days)}
                </Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                  30 derniers jours
                </Text>
              </View>
            </View>

            {/* Total Users */}
            <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#f59e0b' + '20' }]}>
                <IconSymbol
                  ios_icon_name="person.2.fill"
                  android_material_icon_name="people"
                  size={28}
                  color="#f59e0b"
                />
              </View>
              <View style={styles.kpiContent}>
                <Text style={[styles.kpiValue, { color: theme.colors.text }]}>
                  {formatNumber(stats.total_users)}
                </Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                  Utilisateurs
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* User Distribution */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Répartition par Rôle
          </Text>

          <View style={[styles.distributionCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <View style={styles.distributionRow}>
              <View style={styles.distributionLeft}>
                <View style={[styles.distributionDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.distributionLabel, { color: theme.colors.text }]}>
                  Administrateurs
                </Text>
              </View>
              <Text style={[styles.distributionValue, { color: theme.colors.text }]}>
                {formatNumber(stats.admin_users)}
              </Text>
            </View>

            <View style={styles.distributionRow}>
              <View style={styles.distributionLeft}>
                <View style={[styles.distributionDot, { backgroundColor: colors.secondary }]} />
                <Text style={[styles.distributionLabel, { color: theme.colors.text }]}>
                  Utilisateurs
                </Text>
              </View>
              <Text style={[styles.distributionValue, { color: theme.colors.text }]}>
                {formatNumber(stats.regular_users)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quotes Chart (Last 7 Days) */}
        {stats.quotes_by_day && stats.quotes_by_day.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Devis par Jour (7 derniers jours)
            </Text>

            <View style={[styles.chartCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <View style={styles.chartContainer}>
                {stats.quotes_by_day.map((dayData, index) => {
                  const barHeight = maxQuotesPerDay > 0 
                    ? (dayData.count / maxQuotesPerDay) * 120 
                    : 0;
                  
                  return (
                    <View key={index} style={styles.chartBar}>
                      <Text style={[styles.chartValue, { color: theme.colors.text }]}>
                        {dayData.count}
                      </Text>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(barHeight, 4),
                            backgroundColor: colors.primary,
                          },
                        ]}
                      />
                      <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
                        {formatDate(dayData.day)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Top 5 Ports */}
        {stats.top_ports && stats.top_ports.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Top 5 Ports les Plus Demandés
            </Text>

            <View style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              {stats.top_ports.map((port, index) => (
                <View key={port.id} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <View style={[styles.rankBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.rankText, { color: colors.primary }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.listItemInfo}>
                      <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>
                        {port.name}
                      </Text>
                      <Text style={[styles.listItemSubtitle, { color: colors.textSecondary }]}>
                        {port.city}, {port.country}
                      </Text>
                      <View style={styles.portStats}>
                        <Text style={[styles.portStatText, { color: colors.textSecondary }]}>
                          Départ: {port.departure_count} • Arrivée: {port.arrival_count}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.countBadge, { backgroundColor: '#10b981' + '20' }]}>
                    <Text style={[styles.countText, { color: '#10b981' }]}>
                      {port.total_quotes}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top 5 Agents */}
        {stats.top_agents && stats.top_agents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Top 5 Agents les Plus Sollicités
            </Text>

            <View style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              {stats.top_agents.map((agent, index) => (
                <TouchableOpacity
                  key={agent.id}
                  style={styles.listItem}
                  onPress={() => router.push(`/(tabs)/admin-agent-details?id=${agent.id}`)}
                >
                  <View style={styles.listItemLeft}>
                    <View style={[styles.rankBadge, { backgroundColor: colors.secondary + '20' }]}>
                      <Text style={[styles.rankText, { color: colors.secondary }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.listItemInfo}>
                      <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>
                        {agent.company_name}
                      </Text>
                      <Text style={[styles.listItemSubtitle, { color: colors.textSecondary }]}>
                        {agent.port_name}, {agent.port_country}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.countBadge, { backgroundColor: colors.accent + '20' }]}>
                    <Text style={[styles.countText, { color: colors.accent }]}>
                      {agent.quotes_count}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty states */}
        {(!stats.top_ports || stats.top_ports.length === 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Top 5 Ports les Plus Demandés
            </Text>
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <IconSymbol
                ios_icon_name="location"
                android_material_icon_name="location_on"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aucune donnée disponible
              </Text>
            </View>
          </View>
        )}

        {(!stats.top_agents || stats.top_agents.length === 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Top 5 Agents les Plus Sollicités
            </Text>
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <IconSymbol
                ios_icon_name="person.3"
                android_material_icon_name="groups"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aucun agent validé
              </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  refreshIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kpiIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiContent: {
    flex: 1,
    gap: 4,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  distributionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  distributionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  distributionValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  chartCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  listCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listItemInfo: {
    flex: 1,
    gap: 4,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItemSubtitle: {
    fontSize: 14,
  },
  portStats: {
    marginTop: 2,
  },
  portStatText: {
    fontSize: 12,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  countText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
