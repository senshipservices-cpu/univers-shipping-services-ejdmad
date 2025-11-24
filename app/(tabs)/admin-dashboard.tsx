
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import { supabase } from '@/app/integrations/supabase/client';

interface DashboardStats {
  quotesReceived: number;
  quotesConverted: number;
  newClients: number;
  validatedAgents: number;
  activeSubscriptions: {
    basic: number;
    premium_tracking: number;
    enterprise_logistics: number;
    agent_listing: number;
    digital_portal: number;
  };
}

interface RecentQuote {
  id: string;
  client_email: string | null;
  cargo_type: string | null;
  status: string;
  created_at: string;
  origin_port: { name: string } | null;
  destination_port: { name: string } | null;
}

interface RecentShipment {
  id: string;
  tracking_number: string;
  current_status: string;
  created_at: string;
  origin_port: { name: string } | null;
  destination_port: { name: string } | null;
}

interface RecentAgent {
  id: string;
  company_name: string;
  status: string;
  created_at: string;
  port: { name: string; country: string } | null;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    quotesReceived: 0,
    quotesConverted: 0,
    newClients: 0,
    validatedAgents: 0,
    activeSubscriptions: {
      basic: 0,
      premium_tracking: 0,
      enterprise_logistics: 0,
      agent_listing: 0,
      digital_portal: 0,
    },
  });
  const [recentQuotes, setRecentQuotes] = useState<RecentQuote[]>([]);
  const [recentShipments, setRecentShipments] = useState<RecentShipment[]>([]);
  const [recentAgents, setRecentAgents] = useState<RecentAgent[]>([]);

  // Check if user is admin
  const isAdmin = appConfig.isAdmin(user?.email);

  // Load dashboard data - MUST be defined before any conditional returns
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

      // Load quotes received in last 30 days
      const { count: quotesCount, error: quotesError } = await supabase
        .from('freight_quotes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgoISO);

      if (quotesError) {
        console.error('Error loading quotes count:', quotesError);
      }

      // Load quotes converted to shipments in last 30 days
      const { count: convertedCount, error: convertedError } = await supabase
        .from('freight_quotes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgoISO)
        .not('ordered_as_shipment', 'is', null);

      if (convertedError) {
        console.error('Error loading converted quotes:', convertedError);
      }

      // Load new clients in last 30 days
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgoISO);

      if (clientsError) {
        console.error('Error loading clients count:', clientsError);
      }

      // Load validated agents in last 30 days
      const { count: agentsCount, error: agentsError } = await supabase
        .from('global_agents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'validated')
        .gte('created_at', thirtyDaysAgoISO);

      if (agentsError) {
        console.error('Error loading agents count:', agentsError);
      }

      // Load active subscriptions by plan
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('is_active', true);

      if (subscriptionsError) {
        console.error('Error loading subscriptions:', subscriptionsError);
      }

      // Count subscriptions by plan type
      const subscriptionCounts = {
        basic: 0,
        premium_tracking: 0,
        enterprise_logistics: 0,
        agent_listing: 0,
        digital_portal: 0,
      };

      if (subscriptionsData) {
        subscriptionsData.forEach((sub) => {
          if (sub.plan_type && Object.hasOwn(subscriptionCounts, sub.plan_type)) {
            subscriptionCounts[sub.plan_type as keyof typeof subscriptionCounts]++;
          }
        });
      }

      // Update stats
      setStats({
        quotesReceived: quotesCount || 0,
        quotesConverted: convertedCount || 0,
        newClients: clientsCount || 0,
        validatedAgents: agentsCount || 0,
        activeSubscriptions: subscriptionCounts,
      });

      // Load recent quotes
      const { data: quotesData, error: recentQuotesError } = await supabase
        .from('freight_quotes')
        .select(`
          id,
          client_email,
          cargo_type,
          status,
          created_at,
          origin_port:ports!freight_quotes_origin_port_fkey(name),
          destination_port:ports!freight_quotes_destination_port_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentQuotesError) {
        console.error('Error loading recent quotes:', recentQuotesError);
      } else {
        setRecentQuotes(quotesData || []);
      }

      // Load recent shipments
      const { data: shipmentsData, error: recentShipmentsError } = await supabase
        .from('shipments')
        .select(`
          id,
          tracking_number,
          current_status,
          created_at,
          origin_port:ports!shipments_origin_port_fkey(name),
          destination_port:ports!shipments_destination_port_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentShipmentsError) {
        console.error('Error loading recent shipments:', recentShipmentsError);
      } else {
        setRecentShipments(shipmentsData || []);
      }

      // Load recent validated agents
      const { data: agentsData, error: recentAgentsError } = await supabase
        .from('global_agents')
        .select(`
          id,
          company_name,
          status,
          created_at,
          port:ports(name, country)
        `)
        .eq('status', 'validated')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentAgentsError) {
        console.error('Error loading recent agents:', recentAgentsError);
      } else {
        setRecentAgents(agentsData || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du tableau de bord.');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      received: 'Reçu',
      in_progress: 'En cours',
      sent_to_client: 'Envoyé',
      accepted: 'Accepté',
      refused: 'Refusé',
      draft: 'Brouillon',
      quote_pending: 'Devis en attente',
      confirmed: 'Confirmé',
      in_transit: 'En transit',
      at_port: 'Au port',
      delivered: 'Livré',
      on_hold: 'En attente',
      cancelled: 'Annulé',
      pending: 'En attente',
      validated: 'Validé',
      rejected: 'Rejeté',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'accepted':
      case 'validated':
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
      case 'rejected':
        return '#ef4444';
      case 'draft':
      case 'quote_pending':
      case 'received':
      case 'pending':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

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

  const totalSubscriptions = Object.values(stats.activeSubscriptions).reduce((a, b) => a + b, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Statistiques (30 derniers jours)
          </Text>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="doc.text.fill"
                  android_material_icon_name="description"
                  size={28}
                  color={colors.primary}
                />
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats.quotesReceived}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Devis reçus
                </Text>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#10b981' + '20' }]}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={28}
                  color="#10b981"
                />
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats.quotesConverted}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Devis convertis
                </Text>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.secondary + '20' }]}>
                <IconSymbol
                  ios_icon_name="person.2.fill"
                  android_material_icon_name="people"
                  size={28}
                  color={colors.secondary}
                />
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats.newClients}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Nouveaux clients
                </Text>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#f59e0b' + '20' }]}>
                <IconSymbol
                  ios_icon_name="person.3.fill"
                  android_material_icon_name="groups"
                  size={28}
                  color="#f59e0b"
                />
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats.validatedAgents}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Agents validés
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Active Subscriptions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Abonnements actifs
            </Text>
            <View style={[styles.totalBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.totalBadgeText, { color: colors.primary }]}>
                Total: {totalSubscriptions}
              </Text>
            </View>
          </View>

          <View style={[styles.subscriptionsCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <View style={styles.subscriptionRow}>
              <View style={styles.subscriptionLeft}>
                <View style={[styles.subscriptionDot, { backgroundColor: '#06b6d4' }]} />
                <Text style={[styles.subscriptionLabel, { color: theme.colors.text }]}>
                  Basic
                </Text>
              </View>
              <Text style={[styles.subscriptionValue, { color: theme.colors.text }]}>
                {stats.activeSubscriptions.basic}
              </Text>
            </View>

            <View style={styles.subscriptionRow}>
              <View style={styles.subscriptionLeft}>
                <View style={[styles.subscriptionDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.subscriptionLabel, { color: theme.colors.text }]}>
                  Premium Tracking
                </Text>
              </View>
              <Text style={[styles.subscriptionValue, { color: theme.colors.text }]}>
                {stats.activeSubscriptions.premium_tracking}
              </Text>
            </View>

            <View style={styles.subscriptionRow}>
              <View style={styles.subscriptionLeft}>
                <View style={[styles.subscriptionDot, { backgroundColor: '#8b5cf6' }]} />
                <Text style={[styles.subscriptionLabel, { color: theme.colors.text }]}>
                  Enterprise Logistics
                </Text>
              </View>
              <Text style={[styles.subscriptionValue, { color: theme.colors.text }]}>
                {stats.activeSubscriptions.enterprise_logistics}
              </Text>
            </View>

            <View style={styles.subscriptionRow}>
              <View style={styles.subscriptionLeft}>
                <View style={[styles.subscriptionDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={[styles.subscriptionLabel, { color: theme.colors.text }]}>
                  Agent Listing
                </Text>
              </View>
              <Text style={[styles.subscriptionValue, { color: theme.colors.text }]}>
                {stats.activeSubscriptions.agent_listing}
              </Text>
            </View>

            <View style={styles.subscriptionRow}>
              <View style={styles.subscriptionLeft}>
                <View style={[styles.subscriptionDot, { backgroundColor: '#10b981' }]} />
                <Text style={[styles.subscriptionLabel, { color: theme.colors.text }]}>
                  Digital Portal
                </Text>
              </View>
              <Text style={[styles.subscriptionValue, { color: theme.colors.text }]}>
                {stats.activeSubscriptions.digital_portal}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Events */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Derniers événements
          </Text>

          {/* Recent Quotes */}
          {recentQuotes.length > 0 && (
            <View style={styles.eventsSection}>
              <Text style={[styles.eventsSectionTitle, { color: theme.colors.text }]}>
                Derniers devis
              </Text>
              {recentQuotes.map((quote, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.eventCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/(tabs)/admin-quote-details?id=${quote.id}`)}
                >
                  <View style={styles.eventHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                        {formatStatus(quote.status)}
                      </Text>
                    </View>
                    <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
                      {formatDate(quote.created_at)}
                    </Text>
                  </View>
                  <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
                    {quote.origin_port?.name || 'N/A'} → {quote.destination_port?.name || 'N/A'}
                  </Text>
                  <Text style={[styles.eventSubtitle, { color: colors.textSecondary }]}>
                    {quote.client_email || 'Email non fourni'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Recent Shipments */}
          {recentShipments.length > 0 && (
            <View style={styles.eventsSection}>
              <Text style={[styles.eventsSectionTitle, { color: theme.colors.text }]}>
                Derniers shipments
              </Text>
              {recentShipments.map((shipment, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.eventCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/(tabs)/admin-shipment-details?id=${shipment.id}`)}
                >
                  <View style={styles.eventHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipment.current_status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(shipment.current_status) }]}>
                        {formatStatus(shipment.current_status)}
                      </Text>
                    </View>
                    <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
                      {formatDate(shipment.created_at)}
                    </Text>
                  </View>
                  <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
                    {shipment.tracking_number}
                  </Text>
                  <Text style={[styles.eventSubtitle, { color: colors.textSecondary }]}>
                    {shipment.origin_port?.name || 'N/A'} → {shipment.destination_port?.name || 'N/A'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Recent Validated Agents */}
          {recentAgents.length > 0 && (
            <View style={styles.eventsSection}>
              <Text style={[styles.eventsSectionTitle, { color: theme.colors.text }]}>
                Derniers agents validés
              </Text>
              {recentAgents.map((agent, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.eventCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/(tabs)/admin-agent-details?id=${agent.id}`)}
                >
                  <View style={styles.eventHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(agent.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(agent.status) }]}>
                        {formatStatus(agent.status)}
                      </Text>
                    </View>
                    <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
                      {formatDate(agent.created_at)}
                    </Text>
                  </View>
                  <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
                    {agent.company_name}
                  </Text>
                  <Text style={[styles.eventSubtitle, { color: colors.textSecondary }]}>
                    {agent.port?.name || 'N/A'}, {agent.port?.country || 'N/A'}
                  </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  totalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  totalBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  subscriptionsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subscriptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  subscriptionLabel: {
    fontSize: 16,
  },
  subscriptionValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  eventsSection: {
    gap: 12,
    marginTop: 16,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  eventCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  eventHeader: {
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
  eventDate: {
    fontSize: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventSubtitle: {
    fontSize: 14,
  },
});
