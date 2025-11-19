
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl, ActivityIndicator, Alert, Modal, TextInput, Dimensions } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/app/integrations/supabase/client";
import { colors } from "@/styles/commonStyles";

const { width } = Dimensions.get('window');

interface FreightQuote {
  id: string;
  client_email: string | null;
  client_name: string | null;
  status: string;
  quote_amount: number | null;
  quote_currency: string | null;
  payment_status: string | null;
  client_decision: string | null;
  cargo_type: string | null;
  created_at: string;
  origin_port: { name: string } | null;
  destination_port: { name: string } | null;
  service: { name_fr: string; name_en: string } | null;
}

interface GlobalAgent {
  id: string;
  company_name: string;
  email: string | null;
  status: string;
  port: { name: string; country: string } | null;
  activities: string[];
  created_at: string;
  is_premium_listing: boolean;
}

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  client: { company_name: string; email: string } | null;
}

interface Shipment {
  id: string;
  tracking_number: string;
  current_status: string;
  cargo_type: string | null;
  origin_port: { name: string } | null;
  destination_port: { name: string } | null;
  client: { company_name: string } | null;
  created_at: string;
}

interface KPIData {
  totalQuotes: number;
  acceptedQuotes: number;
  ordersCreated: number;
  estimatedRevenue: number;
  activeSubscriptions: number;
  validatedAgents: number;
}

type TabType = 'quotes' | 'shipments' | 'agents' | 'subscriptions' | 'analytics';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('quotes');
  
  // Data states
  const [freightQuotes, setFreightQuotes] = useState<FreightQuote[]>([]);
  const [globalAgents, setGlobalAgents] = useState<GlobalAgent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalQuotes: 0,
    acceptedQuotes: 0,
    ordersCreated: 0,
    estimatedRevenue: 0,
    activeSubscriptions: 0,
    validatedAgents: 0,
  });
  
  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editValue, setEditValue] = useState('');

  // Load data based on active tab
  const loadData = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      switch (activeTab) {
        case 'quotes':
          await loadFreightQuotes();
          break;
        case 'agents':
          await loadGlobalAgents();
          break;
        case 'subscriptions':
          await loadSubscriptions();
          break;
        case 'shipments':
          await loadShipments();
          break;
        case 'analytics':
          await loadKPIData();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, isAdmin]);

  const loadFreightQuotes = async () => {
    const { data, error } = await supabase
      .from('freight_quotes')
      .select(`
        *,
        origin_port:ports!freight_quotes_origin_port_fkey(name),
        destination_port:ports!freight_quotes_destination_port_fkey(name),
        service:services_global(name_fr, name_en)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading freight quotes:', error);
    } else {
      setFreightQuotes(data || []);
    }
  };

  const loadGlobalAgents = async () => {
    const { data, error } = await supabase
      .from('global_agents')
      .select(`
        *,
        port:ports(name, country)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading global agents:', error);
    } else {
      setGlobalAgents(data || []);
    }
  };

  const loadSubscriptions = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        client:clients(company_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading subscriptions:', error);
    } else {
      setSubscriptions(data || []);
    }
  };

  const loadShipments = async () => {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        origin_port:ports!shipments_origin_port_fkey(name),
        destination_port:ports!shipments_destination_port_fkey(name),
        client:clients(company_name)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading shipments:', error);
    } else {
      setShipments(data || []);
    }
  };

  const loadKPIData = async () => {
    // Total quotes
    const { count: totalQuotes } = await supabase
      .from('freight_quotes')
      .select('*', { count: 'exact', head: true });

    // Accepted quotes
    const { count: acceptedQuotes } = await supabase
      .from('freight_quotes')
      .select('*', { count: 'exact', head: true })
      .eq('client_decision', 'accepted');

    // Orders created (shipments)
    const { count: ordersCreated } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true });

    // Estimated revenue
    const { data: revenueData } = await supabase
      .from('freight_quotes')
      .select('quote_amount')
      .eq('payment_status', 'paid')
      .not('quote_amount', 'is', null);

    const estimatedRevenue = revenueData?.reduce((sum, quote) => sum + (Number(quote.quote_amount) || 0), 0) || 0;

    // Active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Validated agents
    const { count: validatedAgents } = await supabase
      .from('global_agents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'validated');

    setKpiData({
      totalQuotes: totalQuotes || 0,
      acceptedQuotes: acceptedQuotes || 0,
      ordersCreated: ordersCreated || 0,
      estimatedRevenue,
      activeSubscriptions: activeSubscriptions || 0,
      validatedAgents: validatedAgents || 0,
    });
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [activeTab, isAdmin, loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // Update agent status
  const updateAgentStatus = async (agentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('global_agents')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', agentId);

      if (error) {
        console.error('Error updating agent status:', error);
        Alert.alert('Erreur', 'Impossible de mettre à jour le statut de l\'agent.');
      } else {
        Alert.alert('Succès', 'Statut de l\'agent mis à jour avec succès.');
        loadGlobalAgents();
      }
    } catch (error) {
      console.error('Exception updating agent status:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  // Update shipment status
  const updateShipmentStatus = async (shipmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ 
          current_status: newStatus, 
          last_update: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', shipmentId);

      if (error) {
        console.error('Error updating shipment status:', error);
        Alert.alert('Erreur', 'Impossible de mettre à jour le statut de l\'expédition.');
      } else {
        Alert.alert('Succès', 'Statut de l\'expédition mis à jour avec succès.');
        loadShipments();
      }
    } catch (error) {
      console.error('Exception updating shipment status:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  // Open edit modal for shipment status
  const openShipmentStatusModal = (shipment: Shipment) => {
    setSelectedItem(shipment);
    setEditValue(shipment.current_status);
    setEditModalVisible(true);
  };

  // Open edit modal for agent status
  const openAgentStatusModal = (agent: GlobalAgent) => {
    setSelectedItem(agent);
    setEditValue(agent.status);
    setEditModalVisible(true);
  };

  // Save changes from modal
  const saveChanges = async () => {
    if (!selectedItem) {
      return;
    }

    if (activeTab === 'shipments') {
      await updateShipmentStatus(selectedItem.id, editValue);
    } else if (activeTab === 'agents') {
      await updateAgentStatus(selectedItem.id, editValue);
    }

    setEditModalVisible(false);
    setSelectedItem(null);
    setEditValue('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'received': colors.textSecondary,
      'in_progress': colors.primary,
      'sent_to_client': '#f59e0b',
      'accepted': '#10b981',
      'refused': '#ef4444',
      'pending': colors.textSecondary,
      'validated': '#10b981',
      'rejected': '#ef4444',
      'active': '#10b981',
      'cancelled': '#ef4444',
      'expired': colors.textSecondary,
      'draft': colors.textSecondary,
      'quote_pending': '#f59e0b',
      'confirmed': colors.primary,
      'in_transit': colors.primary,
      'at_port': '#f59e0b',
      'delivered': '#10b981',
      'on_hold': '#ef4444',
    };
    return statusColors[status] || colors.textSecondary;
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  // Render tab buttons
  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
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
          <Text style={[styles.tabButtonText, { color: activeTab === 'subscriptions' ? '#FFFFFF' : theme.colors.text }]}>
            Abonnements
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'analytics' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('analytics')}
        >
          <IconSymbol
            ios_icon_name="chart.bar.fill"
            android_material_icon_name="analytics"
            size={20}
            color={activeTab === 'analytics' ? '#FFFFFF' : theme.colors.text}
          />
          <Text style={[styles.tabButtonText, { color: activeTab === 'analytics' ? '#FFFFFF' : theme.colors.text }]}>
            KPI Globaux
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Render KPI card
  const renderKPICard = (
    title: string,
    value: string | number,
    icon: string,
    androidIcon: string,
    color: string
  ) => (
    <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
      <View style={[styles.kpiIconContainer, { backgroundColor: color + '20' }]}>
        <IconSymbol ios_icon_name={icon} android_material_icon_name={androidIcon} size={28} color={color} />
      </View>
      <View style={styles.kpiContent}>
        <Text style={[styles.kpiValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.kpiTitle, { color: colors.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );

  // Render analytics tab
  const renderAnalytics = () => (
    <View style={styles.listContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>KPI Globaux</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        Vue d&apos;ensemble des performances
      </Text>

      <View style={styles.kpiGrid}>
        {renderKPICard('Total Devis', formatNumber(kpiData.totalQuotes), 'doc.text', 'description', colors.primary)}
        {renderKPICard('Devis Acceptés', formatNumber(kpiData.acceptedQuotes), 'checkmark.circle', 'check_circle', '#10b981')}
        {renderKPICard('Commandes Créées', formatNumber(kpiData.ordersCreated), 'shippingbox', 'inventory_2', '#f59e0b')}
        {renderKPICard('Revenus Estimés', formatCurrency(kpiData.estimatedRevenue), 'dollarsign.circle', 'payments', '#06b6d4')}
        {renderKPICard('Abonnements Actifs', formatNumber(kpiData.activeSubscriptions), 'star.fill', 'star', '#8b5cf6')}
        {renderKPICard('Agents Validés', formatNumber(kpiData.validatedAgents), 'person.2.fill', 'groups', '#ec4899')}
      </View>

      <TouchableOpacity
        style={[styles.detailedAnalyticsButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/kpi-dashboard')}
      >
        <IconSymbol
          ios_icon_name="chart.bar.fill"
          android_material_icon_name="analytics"
          size={24}
          color="#FFFFFF"
        />
        <Text style={styles.detailedAnalyticsText}>
          Voir les analyses détaillées
        </Text>
        <IconSymbol
          ios_icon_name="arrow.right"
          android_material_icon_name="arrow_forward"
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );

  // Render freight quotes list
  const renderFreightQuotes = () => (
    <View style={styles.listContainer}>
      {freightQuotes.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
          <IconSymbol
            ios_icon_name="doc.text"
            android_material_icon_name="description"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
            Aucun devis trouvé
          </Text>
        </View>
      ) : (
        freightQuotes.map((quote, index) => (
          <View key={index} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {quote.client_name || quote.client_email || 'Client inconnu'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                    {formatStatus(quote.status)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push(`/(tabs)/admin-quote-details?quote_id=${quote.id}`)}
              >
                <IconSymbol
                  ios_icon_name="arrow.right.circle.fill"
                  android_material_icon_name="open_in_new"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              {quote.service && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="briefcase"
                    android_material_icon_name="work"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {quote.service.name_fr}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="envelope"
                  android_material_icon_name="email"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {quote.client_email || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="location"
                  android_material_icon_name="place"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {quote.origin_port?.name || 'N/A'} → {quote.destination_port?.name || 'N/A'}
                </Text>
              </View>

              {quote.cargo_type && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="shippingbox"
                    android_material_icon_name="inventory"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {quote.cargo_type}
                  </Text>
                </View>
              )}

              {quote.quote_amount && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="dollarsign.circle"
                    android_material_icon_name="payments"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {quote.quote_amount} {quote.quote_currency || 'EUR'}
                  </Text>
                </View>
              )}

              {quote.client_decision && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle"
                    android_material_icon_name="check_circle"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Décision: {formatStatus(quote.client_decision)}
                  </Text>
                </View>
              )}

              {quote.payment_status && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="creditcard"
                    android_material_icon_name="credit_card"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Paiement: {formatStatus(quote.payment_status)}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="clock"
                  android_material_icon_name="schedule"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {formatDate(quote.created_at)}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // Render global agents list
  const renderGlobalAgents = () => (
    <View style={styles.listContainer}>
      {globalAgents.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
          <IconSymbol
            ios_icon_name="person.2"
            android_material_icon_name="groups"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
            Aucun agent trouvé
          </Text>
        </View>
      ) : (
        globalAgents.map((agent, index) => (
          <View key={index} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {agent.company_name}
                </Text>
                <View style={styles.statusBadgeRow}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(agent.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(agent.status) }]}>
                      {formatStatus(agent.status)}
                    </Text>
                  </View>
                  {agent.is_premium_listing && (
                    <View style={[styles.premiumBadgeSmall, { backgroundColor: '#f59e0b' + '20' }]}>
                      <IconSymbol
                        ios_icon_name="star.fill"
                        android_material_icon_name="star"
                        size={12}
                        color="#f59e0b"
                      />
                      <Text style={[styles.premiumTextSmall, { color: '#f59e0b' }]}>Premium</Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push(`/(tabs)/admin-agent-details?agent_id=${agent.id}`)}
              >
                <Text style={[styles.manageButtonText, { color: '#FFFFFF' }]}>Gérer</Text>
                <IconSymbol
                  ios_icon_name="arrow.right.circle.fill"
                  android_material_icon_name="open_in_new"
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="envelope"
                  android_material_icon_name="email"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {agent.email || 'N/A'}
                </Text>
              </View>

              {agent.port && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="location"
                    android_material_icon_name="place"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {agent.port.name}, {agent.port.country}
                  </Text>
                </View>
              )}

              {agent.activities && agent.activities.length > 0 && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="briefcase"
                    android_material_icon_name="work"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {agent.activities.slice(0, 3).join(', ')}
                    {agent.activities.length > 3 && ` +${agent.activities.length - 3}`}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="clock"
                  android_material_icon_name="schedule"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {formatDate(agent.created_at)}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // Render subscriptions list
  const renderSubscriptions = () => (
    <View style={styles.listContainer}>
      {subscriptions.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
          <IconSymbol
            ios_icon_name="star"
            android_material_icon_name="star"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
            Aucun abonnement trouvé
          </Text>
        </View>
      ) : (
        subscriptions.map((subscription, index) => (
          <View key={index} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {subscription.client?.company_name || 'Client inconnu'}
                </Text>
                <View style={styles.statusBadgeRow}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(subscription.status) }]}>
                      {formatStatus(subscription.status)}
                    </Text>
                  </View>
                  {subscription.is_active && (
                    <View style={[styles.activeBadgeSmall, { backgroundColor: '#10b981' + '20' }]}>
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check_circle"
                        size={12}
                        color="#10b981"
                      />
                      <Text style={[styles.activeTextSmall, { color: '#10b981' }]}>Actif</Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push(`/(tabs)/admin-subscription-details?subscription_id=${subscription.id}`)}
              >
                <Text style={[styles.manageButtonText, { color: '#FFFFFF' }]}>Modifier</Text>
                <IconSymbol
                  ios_icon_name="arrow.right.circle.fill"
                  android_material_icon_name="open_in_new"
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="envelope"
                  android_material_icon_name="email"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {subscription.client?.email || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="tag"
                  android_material_icon_name="label"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Plan: {formatStatus(subscription.plan_type)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar_today"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Début: {formatDate(subscription.start_date)}
                </Text>
              </View>

              {subscription.end_date && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="calendar"
                    android_material_icon_name="event"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Fin: {formatDate(subscription.end_date)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  // Render shipments list
  const renderShipments = () => (
    <View style={styles.listContainer}>
      {shipments.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
          <IconSymbol
            ios_icon_name="shippingbox"
            android_material_icon_name="inventory_2"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
            Aucune expédition trouvée
          </Text>
        </View>
      ) : (
        shipments.map((shipment, index) => (
          <View key={index} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                  {shipment.tracking_number}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipment.current_status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(shipment.current_status) }]}>
                    {formatStatus(shipment.current_status)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push(`/(tabs)/admin-shipment-details?shipment_id=${shipment.id}`)}
              >
                <Text style={[styles.manageButtonText, { color: '#FFFFFF' }]}>Gérer</Text>
                <IconSymbol
                  ios_icon_name="arrow.right.circle.fill"
                  android_material_icon_name="open_in_new"
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="building.2"
                  android_material_icon_name="business"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {shipment.client?.company_name || 'Client inconnu'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="location"
                  android_material_icon_name="place"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {shipment.origin_port?.name || 'N/A'} → {shipment.destination_port?.name || 'N/A'}
                </Text>
              </View>

              {shipment.cargo_type && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="shippingbox"
                    android_material_icon_name="inventory"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {shipment.cargo_type}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="clock"
                  android_material_icon_name="schedule"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {formatDate(shipment.created_at)}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  // Render edit modal
  const renderEditModal = () => {
    const isShipment = activeTab === 'shipments';
    const isAgent = activeTab === 'agents';

    const shipmentStatuses = [
      'draft',
      'quote_pending',
      'confirmed',
      'in_transit',
      'at_port',
      'delivered',
      'on_hold',
      'cancelled'
    ];

    const agentStatuses = ['pending', 'validated', 'rejected'];

    const statuses = isShipment ? shipmentStatuses : isAgent ? agentStatuses : [];

    return (
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Modifier le statut
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                Sélectionnez un nouveau statut:
              </Text>
              
              {statuses.map((status, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.statusOption,
                    { 
                      backgroundColor: editValue === status ? colors.primary + '20' : theme.colors.background,
                      borderColor: editValue === status ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => setEditValue(status)}
                >
                  <View style={[styles.statusOptionBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
                    <Text style={[styles.statusOptionText, { color: getStatusColor(status) }]}>
                      {formatStatus(status)}
                    </Text>
                  </View>
                  {editValue === status && (
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check_circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={saveChanges}
              >
                <Text style={styles.saveButtonText}>
                  Enregistrer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View style={styles.headerLeft}>
          <IconSymbol
            ios_icon_name="shield.lefthalf.filled"
            android_material_icon_name="admin_panel_settings"
            size={28}
            color={colors.primary}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Admin Dashboard
          </Text>
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
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {activeTab === 'quotes' && renderFreightQuotes()}
          {activeTab === 'agents' && renderGlobalAgents()}
          {activeTab === 'subscriptions' && renderSubscriptions()}
          {activeTab === 'shipments' && renderShipments()}
          {activeTab === 'analytics' && renderAnalytics()}
        </ScrollView>
      )}

      {/* Edit Modal */}
      {renderEditModal()}
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
  listContainer: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  premiumBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  premiumTextSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeTextSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  validateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  detailedAnalyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 8,
  },
  detailedAnalyticsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalBody: {
    gap: 12,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  statusOptionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
