
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl, ActivityIndicator, Dimensions } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/app/integrations/supabase/client";
import { colors } from "@/styles/commonStyles";

const { width } = Dimensions.get('window');

interface KPIData {
  totalQuotes: number;
  quotesThisMonth: number;
  quotesAccepted: number;
  quotesRejected: number;
  totalShipments: number;
  shipmentsInTransit: number;
  shipmentsDelivered: number;
  totalAgents: number;
  agentsPending: number;
  agentsValidated: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalEvents: number;
  eventsThisWeek: number;
  topServices: Array<{ name: string; views: number }>;
  recentEvents: Array<{ event_type: string; created_at: string; count: number }>;
}

type TabType = 'overview' | 'services' | 'quotes' | 'shipments' | 'agents' | 'subscriptions' | 'events';

export default function KPIDashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, client } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [kpiData, setKpiData] = useState<KPIData>({
    totalQuotes: 0,
    quotesThisMonth: 0,
    quotesAccepted: 0,
    quotesRejected: 0,
    totalShipments: 0,
    shipmentsInTransit: 0,
    shipmentsDelivered: 0,
    totalAgents: 0,
    agentsPending: 0,
    agentsValidated: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    totalEvents: 0,
    eventsThisWeek: 0,
    topServices: [],
    recentEvents: [],
  });

  // Check if user is admin
  const isAdmin = client?.is_super_admin === true || client?.admin_option === true;

  // Load KPI data
  const loadKPIData = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Parallel queries for better performance
      const [
        quotesResult,
        shipmentsResult,
        agentsResult,
        subscriptionsResult,
        eventsResult,
        serviceViewsResult,
        recentEventsResult,
      ] = await Promise.all([
        loadQuotesKPI(),
        loadShipmentsKPI(),
        loadAgentsKPI(),
        loadSubscriptionsKPI(),
        loadEventsKPI(),
        loadServiceViews(),
        loadRecentEvents(),
      ]);

      setKpiData({
        ...quotesResult,
        ...shipmentsResult,
        ...agentsResult,
        ...subscriptionsResult,
        ...eventsResult,
        topServices: serviceViewsResult,
        recentEvents: recentEventsResult,
      });
    } catch (error) {
      console.error('Error loading KPI data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  const loadQuotesKPI = async () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count: totalQuotes } = await supabase
      .from('freight_quotes')
      .select('*', { count: 'exact', head: true });

    const { count: quotesThisMonth } = await supabase
      .from('freight_quotes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth);

    const { count: quotesAccepted } = await supabase
      .from('freight_quotes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted');

    const { count: quotesRejected } = await supabase
      .from('freight_quotes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'refused');

    // Calculate total revenue from accepted quotes
    const { data: revenueData } = await supabase
      .from('freight_quotes')
      .select('quote_amount')
      .eq('status', 'accepted')
      .not('quote_amount', 'is', null);

    const totalRevenue = revenueData?.reduce((sum, quote) => sum + (quote.quote_amount || 0), 0) || 0;

    return {
      totalQuotes: totalQuotes || 0,
      quotesThisMonth: quotesThisMonth || 0,
      quotesAccepted: quotesAccepted || 0,
      quotesRejected: quotesRejected || 0,
      totalRevenue,
    };
  };

  const loadShipmentsKPI = async () => {
    const { count: totalShipments } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true });

    const { count: shipmentsInTransit } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('current_status', 'in_transit');

    const { count: shipmentsDelivered } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('current_status', 'delivered');

    return {
      totalShipments: totalShipments || 0,
      shipmentsInTransit: shipmentsInTransit || 0,
      shipmentsDelivered: shipmentsDelivered || 0,
    };
  };

  const loadAgentsKPI = async () => {
    const { count: totalAgents } = await supabase
      .from('global_agents')
      .select('*', { count: 'exact', head: true });

    const { count: agentsPending } = await supabase
      .from('global_agents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: agentsValidated } = await supabase
      .from('global_agents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'validated');

    return {
      totalAgents: totalAgents || 0,
      agentsPending: agentsPending || 0,
      agentsValidated: agentsValidated || 0,
    };
  };

  const loadSubscriptionsKPI = async () => {
    const { count: totalSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return {
      totalSubscriptions: totalSubscriptions || 0,
      activeSubscriptions: activeSubscriptions || 0,
    };
  };

  const loadEventsKPI = async () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { count: totalEvents } = await supabase
      .from('events_log')
      .select('*', { count: 'exact', head: true });

    const { count: eventsThisWeek } = await supabase
      .from('events_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo);

    return {
      totalEvents: totalEvents || 0,
      eventsThisWeek: eventsThisWeek || 0,
    };
  };

  const loadServiceViews = async () => {
    const { data, error } = await supabase
      .from('events_log')
      .select('service_id, services_global(name_fr)')
      .eq('event_type', 'service_view')
      .not('service_id', 'is', null)
      .limit(100);

    if (error || !data) {
      return [];
    }

    // Count views per service
    const viewCounts: Record<string, { name: string; views: number }> = {};
    data.forEach((item: any) => {
      const serviceName = item.services_global?.name_fr || 'Service inconnu';
      if (!viewCounts[serviceName]) {
        viewCounts[serviceName] = { name: serviceName, views: 0 };
      }
      viewCounts[serviceName].views++;
    });

    // Sort by views and return top 5
    return Object.values(viewCounts)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  };

  const loadRecentEvents = async () => {
    const { data, error } = await supabase
      .from('events_log')
      .select('event_type, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return [];
    }

    // Count events by type
    const eventCounts: Record<string, { event_type: string; created_at: string; count: number }> = {};
    data.forEach((item) => {
      if (!eventCounts[item.event_type]) {
        eventCounts[item.event_type] = {
          event_type: item.event_type,
          created_at: item.created_at,
          count: 0,
        };
      }
      eventCounts[item.event_type].count++;
    });

    // Sort by count and return top 10
    return Object.values(eventCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  useEffect(() => {
    if (isAdmin) {
      loadKPIData();
    }
  }, [isAdmin, loadKPIData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadKPIData();
  }, [loadKPIData]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  // Render KPI card
  const renderKPICard = (
    title: string,
    value: string | number,
    icon: string,
    androidIcon: string,
    color: string,
    subtitle?: string
  ) => (
    <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
      <View style={[styles.kpiIconContainer, { backgroundColor: color + '20' }]}>
        <IconSymbol ios_icon_name={icon} android_material_icon_name={androidIcon} size={28} color={color} />
      </View>
      <View style={styles.kpiContent}>
        <Text style={[styles.kpiValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.kpiTitle, { color: colors.textSecondary }]}>{title}</Text>
        {subtitle && <Text style={[styles.kpiSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
    </View>
  );

  // Render overview tab
  const renderOverview = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Vue d&apos;ensemble</Text>

      <View style={styles.kpiGrid}>
        {renderKPICard('Devis Total', formatNumber(kpiData.totalQuotes), 'doc.text', 'description', colors.primary)}
        {renderKPICard(
          'Devis ce mois',
          formatNumber(kpiData.quotesThisMonth),
          'calendar',
          'calendar_today',
          '#f59e0b'
        )}
        {renderKPICard(
          'Expéditions',
          formatNumber(kpiData.totalShipments),
          'shippingbox',
          'inventory_2',
          '#10b981'
        )}
        {renderKPICard('Agents', formatNumber(kpiData.totalAgents), 'person.2', 'groups', '#8b5cf6')}
        {renderKPICard(
          'Abonnements',
          formatNumber(kpiData.activeSubscriptions),
          'star.fill',
          'star',
          '#ec4899',
          `sur ${kpiData.totalSubscriptions} total`
        )}
        {renderKPICard('Revenu Total', formatCurrency(kpiData.totalRevenue), 'dollarsign.circle', 'payments', '#06b6d4')}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>Services les plus consultés</Text>
      <View style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        {kpiData.topServices.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune donnée disponible</Text>
        ) : (
          kpiData.topServices.map((service, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={[styles.rankBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.rankText, { color: colors.primary }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>{service.name}</Text>
              </View>
              <View style={[styles.viewsBadge, { backgroundColor: '#10b981' + '20' }]}>
                <Text style={[styles.viewsText, { color: '#10b981' }]}>{service.views} vues</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );

  // Render services tab
  const renderServices = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Analyse des Services</Text>

      <View style={styles.kpiGrid}>
        {renderKPICard(
          'Vues de services',
          formatNumber(kpiData.topServices.reduce((sum, s) => sum + s.views, 0)),
          'eye',
          'visibility',
          colors.primary
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>Top Services</Text>
      <View style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        {kpiData.topServices.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune donnée disponible</Text>
        ) : (
          kpiData.topServices.map((service, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={[styles.rankBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.rankText, { color: colors.primary }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>{service.name}</Text>
              </View>
              <View style={[styles.viewsBadge, { backgroundColor: '#10b981' + '20' }]}>
                <Text style={[styles.viewsText, { color: '#10b981' }]}>{service.views} vues</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );

  // Render quotes tab
  const renderQuotes = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Analyse des Devis</Text>

      <View style={styles.kpiGrid}>
        {renderKPICard('Total Devis', formatNumber(kpiData.totalQuotes), 'doc.text', 'description', colors.primary)}
        {renderKPICard(
          'Ce mois',
          formatNumber(kpiData.quotesThisMonth),
          'calendar',
          'calendar_today',
          '#f59e0b'
        )}
        {renderKPICard(
          'Acceptés',
          formatNumber(kpiData.quotesAccepted),
          'checkmark.circle',
          'check_circle',
          '#10b981'
        )}
        {renderKPICard('Refusés', formatNumber(kpiData.quotesRejected), 'xmark.circle', 'cancel', '#ef4444')}
        {renderKPICard('Revenu', formatCurrency(kpiData.totalRevenue), 'dollarsign.circle', 'payments', '#06b6d4')}
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Taux de conversion</Text>
        <Text style={[styles.statsValue, { color: colors.primary }]}>
          {kpiData.totalQuotes > 0
            ? `${((kpiData.quotesAccepted / kpiData.totalQuotes) * 100).toFixed(1)}%`
            : '0%'}
        </Text>
        <Text style={[styles.statsSubtitle, { color: colors.textSecondary }]}>
          {kpiData.quotesAccepted} acceptés sur {kpiData.totalQuotes} devis
        </Text>
      </View>
    </View>
  );

  // Render shipments tab
  const renderShipments = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Analyse des Expéditions</Text>

      <View style={styles.kpiGrid}>
        {renderKPICard(
          'Total Expéditions',
          formatNumber(kpiData.totalShipments),
          'shippingbox',
          'inventory_2',
          colors.primary
        )}
        {renderKPICard(
          'En transit',
          formatNumber(kpiData.shipmentsInTransit),
          'arrow.right.circle',
          'local_shipping',
          '#f59e0b'
        )}
        {renderKPICard(
          'Livrées',
          formatNumber(kpiData.shipmentsDelivered),
          'checkmark.circle',
          'check_circle',
          '#10b981'
        )}
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Taux de livraison</Text>
        <Text style={[styles.statsValue, { color: '#10b981' }]}>
          {kpiData.totalShipments > 0
            ? `${((kpiData.shipmentsDelivered / kpiData.totalShipments) * 100).toFixed(1)}%`
            : '0%'}
        </Text>
        <Text style={[styles.statsSubtitle, { color: colors.textSecondary }]}>
          {kpiData.shipmentsDelivered} livrées sur {kpiData.totalShipments} expéditions
        </Text>
      </View>
    </View>
  );

  // Render agents tab
  const renderAgents = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Analyse des Agents</Text>

      <View style={styles.kpiGrid}>
        {renderKPICard('Total Agents', formatNumber(kpiData.totalAgents), 'person.2', 'groups', colors.primary)}
        {renderKPICard(
          'En attente',
          formatNumber(kpiData.agentsPending),
          'clock',
          'schedule',
          '#f59e0b'
        )}
        {renderKPICard(
          'Validés',
          formatNumber(kpiData.agentsValidated),
          'checkmark.circle',
          'check_circle',
          '#10b981'
        )}
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Taux de validation</Text>
        <Text style={[styles.statsValue, { color: '#10b981' }]}>
          {kpiData.totalAgents > 0
            ? `${((kpiData.agentsValidated / kpiData.totalAgents) * 100).toFixed(1)}%`
            : '0%'}
        </Text>
        <Text style={[styles.statsSubtitle, { color: colors.textSecondary }]}>
          {kpiData.agentsValidated} validés sur {kpiData.totalAgents} agents
        </Text>
      </View>
    </View>
  );

  // Render subscriptions tab
  const renderSubscriptions = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Analyse des Abonnements</Text>

      <View style={styles.kpiGrid}>
        {renderKPICard(
          'Total Abonnements',
          formatNumber(kpiData.totalSubscriptions),
          'star',
          'star',
          colors.primary
        )}
        {renderKPICard(
          'Actifs',
          formatNumber(kpiData.activeSubscriptions),
          'checkmark.circle',
          'check_circle',
          '#10b981'
        )}
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Taux d&apos;activation</Text>
        <Text style={[styles.statsValue, { color: '#10b981' }]}>
          {kpiData.totalSubscriptions > 0
            ? `${((kpiData.activeSubscriptions / kpiData.totalSubscriptions) * 100).toFixed(1)}%`
            : '0%'}
        </Text>
        <Text style={[styles.statsSubtitle, { color: colors.textSecondary }]}>
          {kpiData.activeSubscriptions} actifs sur {kpiData.totalSubscriptions} abonnements
        </Text>
      </View>
    </View>
  );

  // Render events tab
  const renderEvents = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Analyse des Événements</Text>

      <View style={styles.kpiGrid}>
        {renderKPICard(
          'Total Événements',
          formatNumber(kpiData.totalEvents),
          'chart.bar',
          'bar_chart',
          colors.primary
        )}
        {renderKPICard(
          'Cette semaine',
          formatNumber(kpiData.eventsThisWeek),
          'calendar',
          'calendar_today',
          '#f59e0b'
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>Événements récents</Text>
      <View style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        {kpiData.recentEvents.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune donnée disponible</Text>
        ) : (
          kpiData.recentEvents.map((event, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={[styles.rankBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.rankText, { color: colors.primary }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>
                  {formatEventType(event.event_type)}
                </Text>
              </View>
              <View style={[styles.viewsBadge, { backgroundColor: '#10b981' + '20' }]}>
                <Text style={[styles.viewsText, { color: '#10b981' }]}>{event.count}x</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );

  // Render tab buttons
  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'overview' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('overview')}
        >
          <IconSymbol
            ios_icon_name="chart.bar"
            android_material_icon_name="dashboard"
            size={20}
            color={activeTab === 'overview' ? '#FFFFFF' : theme.colors.text}
          />
          <Text style={[styles.tabButtonText, { color: activeTab === 'overview' ? '#FFFFFF' : theme.colors.text }]}>
            Vue d&apos;ensemble
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'services' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('services')}
        >
          <IconSymbol
            ios_icon_name="square.grid.2x2"
            android_material_icon_name="apps"
            size={20}
            color={activeTab === 'services' ? '#FFFFFF' : theme.colors.text}
          />
          <Text style={[styles.tabButtonText, { color: activeTab === 'services' ? '#FFFFFF' : theme.colors.text }]}>
            Services
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'quotes' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('quotes')}
        >
          <IconSymbol
            ios_icon_name="doc.text"
            android_material_icon_name="description"
            size={20}
            color={activeTab === 'quotes' ? '#FFFFFF' : theme.colors.text}
          />
          <Text style={[styles.tabButtonText, { color: activeTab === 'quotes' ? '#FFFFFF' : theme.colors.text }]}>
            Devis
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'shipments' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('shipments')}
        >
          <IconSymbol
            ios_icon_name="shippingbox"
            android_material_icon_name="inventory_2"
            size={20}
            color={activeTab === 'shipments' ? '#FFFFFF' : theme.colors.text}
          />
          <Text style={[styles.tabButtonText, { color: activeTab === 'shipments' ? '#FFFFFF' : theme.colors.text }]}>
            Expéditions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'agents' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('agents')}
        >
          <IconSymbol
            ios_icon_name="person.2"
            android_material_icon_name="groups"
            size={20}
            color={activeTab === 'agents' ? '#FFFFFF' : theme.colors.text}
          />
          <Text style={[styles.tabButtonText, { color: activeTab === 'agents' ? '#FFFFFF' : theme.colors.text }]}>
            Agents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'subscriptions' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('subscriptions')}
        >
          <IconSymbol
            ios_icon_name="star"
            android_material_icon_name="star"
            size={20}
            color={activeTab === 'subscriptions' ? '#FFFFFF' : theme.colors.text}
          />
          <Text
            style={[styles.tabButtonText, { color: activeTab === 'subscriptions' ? '#FFFFFF' : theme.colors.text }]}
          >
            Abonnements
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'events' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('events')}
        >
          <IconSymbol
            ios_icon_name="list.bullet"
            android_material_icon_name="list"
            size={20}
            color={activeTab === 'events' ? '#FFFFFF' : theme.colors.text}
          />
          <Text style={[styles.tabButtonText, { color: activeTab === 'events' ? '#FFFFFF' : theme.colors.text }]}>
            Événements
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View style={styles.headerLeft}>
          <IconSymbol
            ios_icon_name="chart.bar.fill"
            android_material_icon_name="analytics"
            size={28}
            color={colors.primary}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>KPI Dashboard</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="close"
            size={28}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      {renderTabButtons()}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Chargement des données...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'services' && renderServices()}
          {activeTab === 'quotes' && renderQuotes()}
          {activeTab === 'shipments' && renderShipments()}
          {activeTab === 'agents' && renderAgents()}
          {activeTab === 'subscriptions' && renderSubscriptions()}
          {activeTab === 'events' && renderEvents()}
        </ScrollView>
      )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.border + '40',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
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
    gap: 4,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  kpiTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  kpiSubtitle: {
    fontSize: 12,
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
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  viewsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  statsSubtitle: {
    fontSize: 14,
  },
});
