
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

// Admin email whitelist - Add authorized admin emails here
const ADMIN_EMAILS = [
  'admin@3sglobal.com',
  'your-email@example.com', // Replace with actual admin emails
];

interface KPIData {
  // Section 3.1: Global Commercial Performance
  totalQuotes: number;
  acceptedQuotes: number;
  ordersCreated: number;
  estimatedRevenue: number;

  // Section 3.2: Conversion Funnel
  serviceViews: number;
  quoteClicks: number;
  quotesCreated: number;
  quotesAccepted: number;
  quotesPaid: number;
  shipmentsCreated: number;
  conversionRate: number;

  // Section 3.3: Service Performance
  topServices: Array<{
    id: string;
    name: string;
    views: number;
    quoteClicks: number;
    quotesCreated: number;
    quotesAccepted: number;
    shipmentsCreated: number;
  }>;

  // Section 3.4: Port Analysis
  portAnalysis: Array<{
    id: string;
    name: string;
    city: string;
    country: string;
    shipmentsOrigin: number;
    shipmentsDestination: number;
    validatedAgents: number;
  }>;

  // Section 3.5: Subscriptions
  activeSubscriptions: number;
  plansByType: Array<{
    planType: string;
    count: number;
  }>;
  expiringThisWeek: number;

  // Section 3.6: Client Activity
  clientActivity: Array<{
    id: string;
    name: string;
    company: string;
    quotesCreated: number;
    shipmentsCreated: number;
    portalAccess: number;
  }>;
}

type TabType = 'commercial' | 'funnel' | 'services' | 'ports' | 'subscriptions' | 'clients';

export default function KPIDashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, client } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('commercial');
  const [kpiData, setKpiData] = useState<KPIData>({
    totalQuotes: 0,
    acceptedQuotes: 0,
    ordersCreated: 0,
    estimatedRevenue: 0,
    serviceViews: 0,
    quoteClicks: 0,
    quotesCreated: 0,
    quotesAccepted: 0,
    quotesPaid: 0,
    shipmentsCreated: 0,
    conversionRate: 0,
    topServices: [],
    portAnalysis: [],
    activeSubscriptions: 0,
    plansByType: [],
    expiringThisWeek: 0,
    clientActivity: [],
  });

  // Check if user is admin by email whitelist
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  // Load all KPI data
  const loadKPIData = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Parallel queries for better performance
      const [
        commercialData,
        funnelData,
        servicesData,
        portsData,
        subscriptionsData,
        clientsData,
      ] = await Promise.all([
        loadCommercialPerformance(),
        loadConversionFunnel(),
        loadServicePerformance(),
        loadPortAnalysis(),
        loadSubscriptionData(),
        loadClientActivity(),
      ]);

      setKpiData({
        ...commercialData,
        ...funnelData,
        topServices: servicesData,
        portAnalysis: portsData,
        ...subscriptionsData,
        clientActivity: clientsData,
      });
    } catch (error) {
      console.error('Error loading KPI data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  // Section 3.1: Global Commercial Performance
  const loadCommercialPerformance = async () => {
    // Card 1: Total quotes
    const { count: totalQuotes } = await supabase
      .from('freight_quotes')
      .select('*', { count: 'exact', head: true });

    // Card 2: Accepted quotes
    const { count: acceptedQuotes } = await supabase
      .from('freight_quotes')
      .select('*', { count: 'exact', head: true })
      .eq('client_decision', 'accepted');

    // Card 3: Orders created (shipments)
    const { count: ordersCreated } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true });

    // Card 4: Estimated revenue (sum of paid quotes)
    const { data: revenueData } = await supabase
      .from('freight_quotes')
      .select('quote_amount')
      .eq('payment_status', 'paid')
      .not('quote_amount', 'is', null);

    const estimatedRevenue = revenueData?.reduce((sum, quote) => sum + (Number(quote.quote_amount) || 0), 0) || 0;

    return {
      totalQuotes: totalQuotes || 0,
      acceptedQuotes: acceptedQuotes || 0,
      ordersCreated: ordersCreated || 0,
      estimatedRevenue,
    };
  };

  // Section 3.2: Conversion Funnel
  const loadConversionFunnel = async () => {
    // Service views
    const { count: serviceViews } = await supabase
      .from('events_log')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'service_view');

    // Quote clicks
    const { count: quoteClicks } = await supabase
      .from('events_log')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'service_quote_click');

    // Quotes created
    const { count: quotesCreated } = await supabase
      .from('freight_quotes')
      .select('*', { count: 'exact', head: true });

    // Quotes accepted
    const { count: quotesAccepted } = await supabase
      .from('freight_quotes')
      .select('*', { count: 'exact', head: true })
      .eq('client_decision', 'accepted');

    // Quotes paid
    const { count: quotesPaid } = await supabase
      .from('freight_quotes')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid');

    // Shipments created
    const { count: shipmentsCreated } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true });

    // Calculate conversion rate
    const conversionRate = quotesCreated && quotesCreated > 0
      ? (quotesAccepted || 0) / quotesCreated * 100
      : 0;

    return {
      serviceViews: serviceViews || 0,
      quoteClicks: quoteClicks || 0,
      quotesCreated: quotesCreated || 0,
      quotesAccepted: quotesAccepted || 0,
      quotesPaid: quotesPaid || 0,
      shipmentsCreated: shipmentsCreated || 0,
      conversionRate,
    };
  };

  // Section 3.3: Service Performance
  const loadServicePerformance = async () => {
    // Get all services
    const { data: services } = await supabase
      .from('services_global')
      .select('id, name_fr, name_en')
      .eq('is_active', true);

    if (!services) return [];

    // For each service, get performance metrics
    const servicePerformance = await Promise.all(
      services.map(async (service) => {
        // Views
        const { count: views } = await supabase
          .from('events_log')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'service_view')
          .eq('service_id', service.id);

        // Quote clicks
        const { count: quoteClicks } = await supabase
          .from('events_log')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'service_quote_click')
          .eq('service_id', service.id);

        // Quotes created
        const { count: quotesCreated } = await supabase
          .from('freight_quotes')
          .select('*', { count: 'exact', head: true })
          .eq('service_id', service.id);

        // Quotes accepted
        const { count: quotesAccepted } = await supabase
          .from('freight_quotes')
          .select('*', { count: 'exact', head: true })
          .eq('service_id', service.id)
          .eq('client_decision', 'accepted');

        // Shipments created (via quotes with this service)
        const { data: quotesWithShipments } = await supabase
          .from('freight_quotes')
          .select('ordered_as_shipment')
          .eq('service_id', service.id)
          .not('ordered_as_shipment', 'is', null);

        const shipmentsCreated = quotesWithShipments?.length || 0;

        return {
          id: service.id,
          name: service.name_fr || service.name_en || 'Service',
          views: views || 0,
          quoteClicks: quoteClicks || 0,
          quotesCreated: quotesCreated || 0,
          quotesAccepted: quotesAccepted || 0,
          shipmentsCreated,
        };
      })
    );

    // Sort by performance (views + quotes + shipments)
    return servicePerformance
      .sort((a, b) => {
        const scoreA = a.views + (a.quotesCreated * 5) + (a.shipmentsCreated * 10);
        const scoreB = b.views + (b.quotesCreated * 5) + (b.shipmentsCreated * 10);
        return scoreB - scoreA;
      })
      .slice(0, 10); // Top 10 services
  };

  // Section 3.4: Port Analysis
  const loadPortAnalysis = async () => {
    // Get all ports
    const { data: ports } = await supabase
      .from('ports')
      .select('id, name, city, country')
      .eq('status', 'actif');

    if (!ports) return [];

    // For each port, get metrics
    const portMetrics = await Promise.all(
      ports.map(async (port) => {
        // Shipments by origin port
        const { count: shipmentsOrigin } = await supabase
          .from('shipments')
          .select('*', { count: 'exact', head: true })
          .eq('origin_port', port.id);

        // Shipments by destination port
        const { count: shipmentsDestination } = await supabase
          .from('shipments')
          .select('*', { count: 'exact', head: true })
          .eq('destination_port', port.id);

        // Validated agents in this port
        const { count: validatedAgents } = await supabase
          .from('global_agents')
          .select('*', { count: 'exact', head: true })
          .eq('port', port.id)
          .eq('status', 'validated');

        return {
          id: port.id,
          name: port.name,
          city: port.city || '',
          country: port.country || '',
          shipmentsOrigin: shipmentsOrigin || 0,
          shipmentsDestination: shipmentsDestination || 0,
          validatedAgents: validatedAgents || 0,
        };
      })
    );

    // Sort by total shipments
    return portMetrics
      .sort((a, b) => {
        const totalA = a.shipmentsOrigin + a.shipmentsDestination;
        const totalB = b.shipmentsOrigin + b.shipmentsDestination;
        return totalB - totalA;
      })
      .slice(0, 15); // Top 15 ports
  };

  // Section 3.5: Subscriptions
  const loadSubscriptionData = async () => {
    // Card 1: Active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Card 2: Plans by type
    const { data: subscriptionsByPlan } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('is_active', true);

    const planCounts: Record<string, number> = {};
    subscriptionsByPlan?.forEach((sub) => {
      planCounts[sub.plan_type] = (planCounts[sub.plan_type] || 0) + 1;
    });

    const plansByType = Object.entries(planCounts).map(([planType, count]) => ({
      planType,
      count,
    }));

    // Card 3: Expiring this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { count: expiringThisWeek } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .gte('end_date', startOfWeek.toISOString().split('T')[0])
      .lte('end_date', now.toISOString().split('T')[0]);

    return {
      activeSubscriptions: activeSubscriptions || 0,
      plansByType,
      expiringThisWeek: expiringThisWeek || 0,
    };
  };

  // Section 3.6: Client Activity
  const loadClientActivity = async () => {
    // Get all clients
    const { data: clients } = await supabase
      .from('clients')
      .select('id, company_name, contact_name')
      .limit(100);

    if (!clients) return [];

    // For each client, get activity metrics
    const clientMetrics = await Promise.all(
      clients.map(async (client) => {
        // Quotes created
        const { count: quotesCreated } = await supabase
          .from('freight_quotes')
          .select('*', { count: 'exact', head: true })
          .eq('client', client.id);

        // Shipments created
        const { count: shipmentsCreated } = await supabase
          .from('shipments')
          .select('*', { count: 'exact', head: true })
          .eq('client', client.id);

        // Portal access
        const { count: portalAccess } = await supabase
          .from('events_log')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'portal_access')
          .eq('client_id', client.id);

        return {
          id: client.id,
          name: client.contact_name || '',
          company: client.company_name,
          quotesCreated: quotesCreated || 0,
          shipmentsCreated: shipmentsCreated || 0,
          portalAccess: portalAccess || 0,
        };
      })
    );

    // Sort by activity (quotes + shipments + portal access)
    return clientMetrics
      .filter((c) => c.quotesCreated > 0 || c.shipmentsCreated > 0 || c.portalAccess > 0)
      .sort((a, b) => {
        const scoreA = a.quotesCreated + a.shipmentsCreated + a.portalAccess;
        const scoreB = b.quotesCreated + b.shipmentsCreated + b.portalAccess;
        return scoreB - scoreA;
      })
      .slice(0, 20); // Top 20 active clients
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
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

  // Section 3.1: Global Commercial Performance
  const renderCommercialPerformance = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Performance Commerciale Globale</Text>

      <View style={styles.kpiGrid}>
        {renderKPICard('Total Devis', formatNumber(kpiData.totalQuotes), 'doc.text', 'description', colors.primary)}
        {renderKPICard(
          'Devis Acceptés',
          formatNumber(kpiData.acceptedQuotes),
          'checkmark.circle',
          'check_circle',
          '#10b981'
        )}
        {renderKPICard(
          'Commandes Créées',
          formatNumber(kpiData.ordersCreated),
          'shippingbox',
          'inventory_2',
          '#f59e0b'
        )}
        {renderKPICard(
          'Revenus Estimés',
          formatCurrency(kpiData.estimatedRevenue),
          'dollarsign.circle',
          'payments',
          '#06b6d4'
        )}
      </View>
    </View>
  );

  // Section 3.2: Conversion Funnel
  const renderConversionFunnel = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Funnel de Conversion</Text>

      <View style={styles.funnelContainer}>
        <View style={[styles.funnelStep, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <View style={styles.funnelStepHeader}>
            <IconSymbol ios_icon_name="eye" android_material_icon_name="visibility" size={24} color={colors.primary} />
            <Text style={[styles.funnelStepTitle, { color: theme.colors.text }]}>Vues de Services</Text>
          </View>
          <Text style={[styles.funnelStepValue, { color: colors.primary }]}>{formatNumber(kpiData.serviceViews)}</Text>
        </View>

        <View style={styles.funnelArrow}>
          <IconSymbol ios_icon_name="arrow.down" android_material_icon_name="arrow_downward" size={20} color={colors.textSecondary} />
        </View>

        <View style={[styles.funnelStep, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <View style={styles.funnelStepHeader}>
            <IconSymbol ios_icon_name="hand.tap" android_material_icon_name="touch_app" size={24} color="#f59e0b" />
            <Text style={[styles.funnelStepTitle, { color: theme.colors.text }]}>Clics &quot;Demander un devis&quot;</Text>
          </View>
          <Text style={[styles.funnelStepValue, { color: '#f59e0b' }]}>{formatNumber(kpiData.quoteClicks)}</Text>
        </View>

        <View style={styles.funnelArrow}>
          <IconSymbol ios_icon_name="arrow.down" android_material_icon_name="arrow_downward" size={20} color={colors.textSecondary} />
        </View>

        <View style={[styles.funnelStep, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <View style={styles.funnelStepHeader}>
            <IconSymbol ios_icon_name="doc.text" android_material_icon_name="description" size={24} color="#8b5cf6" />
            <Text style={[styles.funnelStepTitle, { color: theme.colors.text }]}>Devis Créés</Text>
          </View>
          <Text style={[styles.funnelStepValue, { color: '#8b5cf6' }]}>{formatNumber(kpiData.quotesCreated)}</Text>
        </View>

        <View style={styles.funnelArrow}>
          <IconSymbol ios_icon_name="arrow.down" android_material_icon_name="arrow_downward" size={20} color={colors.textSecondary} />
        </View>

        <View style={[styles.funnelStep, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <View style={styles.funnelStepHeader}>
            <IconSymbol ios_icon_name="checkmark.circle" android_material_icon_name="check_circle" size={24} color="#10b981" />
            <Text style={[styles.funnelStepTitle, { color: theme.colors.text }]}>Devis Acceptés</Text>
          </View>
          <Text style={[styles.funnelStepValue, { color: '#10b981' }]}>{formatNumber(kpiData.quotesAccepted)}</Text>
        </View>

        <View style={styles.funnelArrow}>
          <IconSymbol ios_icon_name="arrow.down" android_material_icon_name="arrow_downward" size={20} color={colors.textSecondary} />
        </View>

        <View style={[styles.funnelStep, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <View style={styles.funnelStepHeader}>
            <IconSymbol ios_icon_name="creditcard" android_material_icon_name="payment" size={24} color="#06b6d4" />
            <Text style={[styles.funnelStepTitle, { color: theme.colors.text }]}>Devis Payés</Text>
          </View>
          <Text style={[styles.funnelStepValue, { color: '#06b6d4' }]}>{formatNumber(kpiData.quotesPaid)}</Text>
        </View>

        <View style={styles.funnelArrow}>
          <IconSymbol ios_icon_name="arrow.down" android_material_icon_name="arrow_downward" size={20} color={colors.textSecondary} />
        </View>

        <View style={[styles.funnelStep, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <View style={styles.funnelStepHeader}>
            <IconSymbol ios_icon_name="shippingbox" android_material_icon_name="inventory_2" size={24} color="#ec4899" />
            <Text style={[styles.funnelStepTitle, { color: theme.colors.text }]}>Shipments Créés</Text>
          </View>
          <Text style={[styles.funnelStepValue, { color: '#ec4899' }]}>{formatNumber(kpiData.shipmentsCreated)}</Text>
        </View>
      </View>

      <View style={[styles.conversionCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        <Text style={[styles.conversionTitle, { color: theme.colors.text }]}>Taux de Conversion</Text>
        <Text style={[styles.conversionValue, { color: colors.primary }]}>
          {formatPercentage(kpiData.conversionRate)}
        </Text>
        <Text style={[styles.conversionSubtitle, { color: colors.textSecondary }]}>
          Devis acceptés / Devis créés
        </Text>
      </View>
    </View>
  );

  // Section 3.3: Service Performance
  const renderServicePerformance = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Performance des Services</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Top Services par Performance</Text>

      <View style={[styles.tableCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.tableServiceName, { color: colors.textSecondary }]}>Service</Text>
          <Text style={[styles.tableHeaderCell, styles.tableMetric, { color: colors.textSecondary }]}>Vues</Text>
          <Text style={[styles.tableHeaderCell, styles.tableMetric, { color: colors.textSecondary }]}>Clics</Text>
          <Text style={[styles.tableHeaderCell, styles.tableMetric, { color: colors.textSecondary }]}>Devis</Text>
          <Text style={[styles.tableHeaderCell, styles.tableMetric, { color: colors.textSecondary }]}>Accept.</Text>
          <Text style={[styles.tableHeaderCell, styles.tableMetric, { color: colors.textSecondary }]}>Ships</Text>
        </View>

        {/* Table Rows */}
        {kpiData.topServices.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune donnée disponible</Text>
        ) : (
          kpiData.topServices.map((service, index) => (
            <View key={service.id} style={[styles.tableRow, index % 2 === 0 && { backgroundColor: colors.border + '20' }]}>
              <View style={[styles.tableCell, styles.tableServiceName]}>
                <View style={[styles.rankBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.rankText, { color: colors.primary }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.serviceName, { color: theme.colors.text }]} numberOfLines={2}>
                  {service.name}
                </Text>
              </View>
              <Text style={[styles.tableCell, styles.tableMetric, { color: theme.colors.text }]}>
                {formatNumber(service.views)}
              </Text>
              <Text style={[styles.tableCell, styles.tableMetric, { color: theme.colors.text }]}>
                {formatNumber(service.quoteClicks)}
              </Text>
              <Text style={[styles.tableCell, styles.tableMetric, { color: theme.colors.text }]}>
                {formatNumber(service.quotesCreated)}
              </Text>
              <Text style={[styles.tableCell, styles.tableMetric, { color: theme.colors.text }]}>
                {formatNumber(service.quotesAccepted)}
              </Text>
              <Text style={[styles.tableCell, styles.tableMetric, { color: theme.colors.text }]}>
                {formatNumber(service.shipmentsCreated)}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );

  // Section 3.4: Port Analysis
  const renderPortAnalysis = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Analyse Portuaire</Text>

      <View style={[styles.tableCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.portNameColumn, { color: colors.textSecondary }]}>Port</Text>
          <Text style={[styles.tableHeaderCell, styles.portMetric, { color: colors.textSecondary }]}>Origine</Text>
          <Text style={[styles.tableHeaderCell, styles.portMetric, { color: colors.textSecondary }]}>Dest.</Text>
          <Text style={[styles.tableHeaderCell, styles.portMetric, { color: colors.textSecondary }]}>Agents</Text>
        </View>

        {/* Table Rows */}
        {kpiData.portAnalysis.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune donnée disponible</Text>
        ) : (
          kpiData.portAnalysis.map((port, index) => (
            <View key={port.id} style={[styles.tableRow, index % 2 === 0 && { backgroundColor: colors.border + '20' }]}>
              <View style={[styles.tableCell, styles.portNameColumn]}>
                <Text style={[styles.portName, { color: theme.colors.text }]} numberOfLines={1}>
                  {port.name}
                </Text>
                <Text style={[styles.portLocation, { color: colors.textSecondary }]} numberOfLines={1}>
                  {port.city}, {port.country}
                </Text>
              </View>
              <Text style={[styles.tableCell, styles.portMetric, { color: theme.colors.text }]}>
                {formatNumber(port.shipmentsOrigin)}
              </Text>
              <Text style={[styles.tableCell, styles.portMetric, { color: theme.colors.text }]}>
                {formatNumber(port.shipmentsDestination)}
              </Text>
              <Text style={[styles.tableCell, styles.portMetric, { color: theme.colors.text }]}>
                {formatNumber(port.validatedAgents)}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );

  // Section 3.5: Subscriptions
  const renderSubscriptions = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Abonnements</Text>

      <View style={styles.kpiGrid}>
        {renderKPICard(
          'Abonnements Actifs',
          formatNumber(kpiData.activeSubscriptions),
          'star.fill',
          'star',
          colors.primary
        )}
        {renderKPICard(
          'Expirent cette semaine',
          formatNumber(kpiData.expiringThisWeek),
          'clock',
          'schedule',
          '#f59e0b'
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>Plans les plus utilisés</Text>
      <View style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        {kpiData.plansByType.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune donnée disponible</Text>
        ) : (
          kpiData.plansByType
            .sort((a, b) => b.count - a.count)
            .map((plan, index) => (
              <View key={plan.planType} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <View style={[styles.rankBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.rankText, { color: colors.primary }]}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>
                    {plan.planType.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: '#10b981' + '20' }]}>
                  <Text style={[styles.countText, { color: '#10b981' }]}>{plan.count}</Text>
                </View>
              </View>
            ))
        )}
      </View>
    </View>
  );

  // Section 3.6: Client Activity
  const renderClientActivity = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Activité par Client</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Clients les plus actifs</Text>

      <View style={[styles.tableCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.clientNameColumn, { color: colors.textSecondary }]}>Client</Text>
          <Text style={[styles.tableHeaderCell, styles.clientMetric, { color: colors.textSecondary }]}>Devis</Text>
          <Text style={[styles.tableHeaderCell, styles.clientMetric, { color: colors.textSecondary }]}>Ships</Text>
          <Text style={[styles.tableHeaderCell, styles.clientMetric, { color: colors.textSecondary }]}>Portail</Text>
        </View>

        {/* Table Rows */}
        {kpiData.clientActivity.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune donnée disponible</Text>
        ) : (
          kpiData.clientActivity.map((client, index) => (
            <View key={client.id} style={[styles.tableRow, index % 2 === 0 && { backgroundColor: colors.border + '20' }]}>
              <View style={[styles.tableCell, styles.clientNameColumn]}>
                <Text style={[styles.clientCompany, { color: theme.colors.text }]} numberOfLines={1}>
                  {client.company}
                </Text>
                {client.name && (
                  <Text style={[styles.clientName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {client.name}
                  </Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.clientMetric, { color: theme.colors.text }]}>
                {formatNumber(client.quotesCreated)}
              </Text>
              <Text style={[styles.tableCell, styles.clientMetric, { color: theme.colors.text }]}>
                {formatNumber(client.shipmentsCreated)}
              </Text>
              <Text style={[styles.tableCell, styles.clientMetric, { color: theme.colors.text }]}>
                {formatNumber(client.portalAccess)}
              </Text>
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
          style={[styles.tabButton, activeTab === 'commercial' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('commercial')}
        >
          <IconSymbol
            ios_icon_name="chart.bar"
            android_material_icon_name="bar_chart"
            size={20}
            color={activeTab === 'commercial' ? '#FFFFFF' : theme.colors.text}
          />
          <Text style={[styles.tabButtonText, { color: activeTab === 'commercial' ? '#FFFFFF' : theme.colors.text }]}>
            Commercial
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'funnel' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('funnel')}
        >
          <IconSymbol
            ios_icon_name="arrow.down.right.circle"
            android_material_icon_name="trending_down"
            size={20}
            color={activeTab === 'funnel' ? '#FFFFFF' : theme.colors.text}
          />
          <Text style={[styles.tabButtonText, { color: activeTab === 'funnel' ? '#FFFFFF' : theme.colors.text }]}>
            Funnel
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
          style={[styles.tabButton, activeTab === 'ports' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('ports')}
        >
          <IconSymbol
            ios_icon_name="location"
            android_material_icon_name="location_on"
            size={20}
            color={activeTab === 'ports' ? '#FFFFFF' : theme.colors.text}
          />
          <Text style={[styles.tabButtonText, { color: activeTab === 'ports' ? '#FFFFFF' : theme.colors.text }]}>
            Ports
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
          style={[styles.tabButton, activeTab === 'clients' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('clients')}
        >
          <IconSymbol
            ios_icon_name="person.2"
            android_material_icon_name="groups"
            size={20}
            color={activeTab === 'clients' ? '#FFFFFF' : theme.colors.text}
          />
          <Text style={[styles.tabButtonText, { color: activeTab === 'clients' ? '#FFFFFF' : theme.colors.text }]}>
            Clients
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
          {activeTab === 'commercial' && renderCommercialPerformance()}
          {activeTab === 'funnel' && renderConversionFunnel()}
          {activeTab === 'services' && renderServicePerformance()}
          {activeTab === 'ports' && renderPortAnalysis()}
          {activeTab === 'subscriptions' && renderSubscriptions()}
          {activeTab === 'clients' && renderClientActivity()}
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
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
  funnelContainer: {
    gap: 8,
  },
  funnelStep: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  funnelStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  funnelStepTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  funnelStepValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  funnelArrow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  conversionCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  conversionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversionValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  conversionSubtitle: {
    fontSize: 14,
  },
  tableCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
  },
  tableCell: {
    fontSize: 14,
    justifyContent: 'center',
  },
  tableServiceName: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableMetric: {
    width: 50,
    textAlign: 'center',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  portNameColumn: {
    flex: 1,
  },
  portMetric: {
    width: 60,
    textAlign: 'center',
  },
  portName: {
    fontSize: 14,
    fontWeight: '600',
  },
  portLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  clientNameColumn: {
    flex: 1,
  },
  clientMetric: {
    width: 60,
    textAlign: 'center',
  },
  clientCompany: {
    fontSize: 14,
    fontWeight: '600',
  },
  clientName: {
    fontSize: 12,
    marginTop: 2,
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
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
