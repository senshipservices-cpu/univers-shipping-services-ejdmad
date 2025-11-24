
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import { supabase } from '@/app/integrations/supabase/client';

interface ClientDetails {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  sector: string | null;
  is_verified: boolean;
  created_at: string;
}

interface Quote {
  id: string;
  status: string;
  cargo_type: string | null;
  created_at: string;
  origin_port: { name: string } | null;
  destination_port: { name: string } | null;
}

interface Shipment {
  id: string;
  tracking_number: string;
  current_status: string;
  created_at: string;
  origin_port: { name: string } | null;
  destination_port: { name: string } | null;
}

interface Subscription {
  id: string;
  plan_type: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminClientDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const isAdmin = appConfig.isAdmin(user?.email);

  const loadClientDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Load client details
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (clientError) {
        console.error('Error loading client:', clientError);
        Alert.alert('Erreur', 'Impossible de charger les détails du client.');
        return;
      }

      setClient(clientData);

      // Load quotes
      const { data: quotesData, error: quotesError } = await supabase
        .from('freight_quotes')
        .select(`
          id,
          status,
          cargo_type,
          created_at,
          origin_port:ports!freight_quotes_origin_port_fkey(name),
          destination_port:ports!freight_quotes_destination_port_fkey(name)
        `)
        .eq('client', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (quotesError) {
        console.error('Error loading quotes:', quotesError);
      } else {
        setQuotes(quotesData || []);
      }

      // Load shipments
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select(`
          id,
          tracking_number,
          current_status,
          created_at,
          origin_port:ports!shipments_origin_port_fkey(name),
          destination_port:ports!shipments_destination_port_fkey(name)
        `)
        .eq('client', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (shipmentsError) {
        console.error('Error loading shipments:', shipmentsError);
      } else {
        setShipments(shipmentsData || []);
      }

      // Load subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('client', id)
        .order('created_at', { ascending: false });

      if (subscriptionsError) {
        console.error('Error loading subscriptions:', subscriptionsError);
      } else {
        setSubscriptions(subscriptionsData || []);
      }
    } catch (error) {
      console.error('Error loading client details:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    if (user && isAdmin) {
      loadClientDetails();
    }
  }, [user, isAdmin, loadClientDetails]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClientDetails();
  }, [loadClientDetails]);

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
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Client introuvable
          </Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
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
      default:
        return colors.textSecondary;
    }
  };

  const formatPlanType = (planType: string) => {
    const planMap: { [key: string]: string } = {
      basic: 'Basic',
      premium_tracking: 'Premium Tracking',
      enterprise_logistics: 'Enterprise Logistics',
      agent_listing: 'Agent Listing',
      digital_portal: 'Digital Portal',
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {client.company_name}
          </Text>
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
        {/* Client Info */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Informations du profil
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Société:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {client.company_name}
              </Text>
            </View>

            {client.contact_name && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Contact:</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {client.contact_name}
                </Text>
              </View>
            )}

            {client.email && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email:</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {client.email}
                </Text>
              </View>
            )}

            {client.phone && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Téléphone:</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {client.phone}
                </Text>
              </View>
            )}

            {client.country && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Pays:</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {client.country}
                </Text>
              </View>
            )}

            {client.city && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Ville:</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {client.city}
                </Text>
              </View>
            )}

            {client.sector && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Secteur:</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {client.sector}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Vérifié:</Text>
              <View style={[
                styles.verifiedBadge,
                { backgroundColor: client.is_verified ? '#10b981' + '20' : colors.textSecondary + '20' }
              ]}>
                <Text style={[
                  styles.verifiedText,
                  { color: client.is_verified ? '#10b981' : colors.textSecondary }
                ]}>
                  {client.is_verified ? 'Oui' : 'Non'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Inscrit le:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatDate(client.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Subscriptions */}
        {subscriptions.length > 0 && (
          <View style={styles.listSection}>
            <Text style={[styles.listTitle, { color: theme.colors.text }]}>
              Abonnements ({subscriptions.length})
            </Text>

            {subscriptions.map((subscription) => (
              <TouchableOpacity
                key={subscription.id}
                style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/(tabs)/admin-subscription-details?id=${subscription.id}` as any)}
              >
                <View style={styles.listCardHeader}>
                  <Text style={[styles.listCardTitle, { color: theme.colors.text }]}>
                    {formatPlanType(subscription.plan_type)}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: subscription.is_active ? '#10b981' + '20' : colors.error + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: subscription.is_active ? '#10b981' : colors.error }
                    ]}>
                      {subscription.is_active ? 'Actif' : 'Inactif'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.listCardSubtitle, { color: colors.textSecondary }]}>
                  Du {formatDate(subscription.start_date)} au {subscription.end_date ? formatDate(subscription.end_date) : 'N/A'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quotes */}
        {quotes.length > 0 && (
          <View style={styles.listSection}>
            <Text style={[styles.listTitle, { color: theme.colors.text }]}>
              Devis ({quotes.length})
            </Text>

            {quotes.map((quote) => (
              <TouchableOpacity
                key={quote.id}
                style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/(tabs)/admin-quote-details?id=${quote.id}` as any)}
              >
                <View style={styles.listCardHeader}>
                  <Text style={[styles.listCardTitle, { color: theme.colors.text }]}>
                    {quote.origin_port?.name || 'N/A'} → {quote.destination_port?.name || 'N/A'}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(quote.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(quote.status) }
                    ]}>
                      {formatStatus(quote.status)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.listCardSubtitle, { color: colors.textSecondary }]}>
                  {formatDate(quote.created_at)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Shipments */}
        {shipments.length > 0 && (
          <View style={styles.listSection}>
            <Text style={[styles.listTitle, { color: theme.colors.text }]}>
              Shipments ({shipments.length})
            </Text>

            {shipments.map((shipment) => (
              <TouchableOpacity
                key={shipment.id}
                style={[styles.listCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/(tabs)/admin-shipment-details?id=${shipment.id}` as any)}
              >
                <View style={styles.listCardHeader}>
                  <Text style={[styles.listCardTitle, { color: theme.colors.text }]}>
                    {shipment.tracking_number}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(shipment.current_status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(shipment.current_status) }
                    ]}>
                      {formatStatus(shipment.current_status)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.listCardSubtitle, { color: colors.textSecondary }]}>
                  {shipment.origin_port?.name || 'N/A'} → {shipment.destination_port?.name || 'N/A'}
                </Text>
                <Text style={[styles.listCardSubtitle, { color: colors.textSecondary }]}>
                  {formatDate(shipment.created_at)}
                </Text>
              </TouchableOpacity>
            ))}
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  verifiedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listSection: {
    gap: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  listCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
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
  listCardSubtitle: {
    fontSize: 14,
  },
});
