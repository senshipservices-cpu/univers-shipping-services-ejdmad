
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';
import { formatDate } from '@/utils/formatters';
import { Picker } from '@react-native-picker/picker';

interface Shipment {
  id: string;
  tracking_number: string;
  status: string;
  created_at: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  price_total: number;
  currency: string;
}

interface ShipmentListState {
  shipments_list: Shipment[];
  shipments_loading: boolean;
  shipments_error: string | null;
  current_page: number;
  has_more: boolean;
}

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, client, isEmailVerified } = useAuth();

  // Screen state
  const [state, setState] = useState<ShipmentListState>({
    shipments_list: [],
    shipments_loading: false,
    shipments_error: null,
    current_page: 1,
    has_more: false,
  });

  // Filter and search state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTracking, setSearchTracking] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Status options for filter
  const statusOptions = [
    { label: 'Tous', value: 'all' },
    { label: 'Enregistré', value: 'registered' },
    { label: 'En transit', value: 'in_transit' },
    { label: 'Livré', value: 'delivered' },
    { label: 'Annulé', value: 'cancelled' },
  ];

  // Load shipments from API
  const loadShipments = useCallback(async (page: number = 1, status: string = 'all') => {
    if (!user?.id) {
      console.log('[DASHBOARD] No user ID available');
      return;
    }

    try {
      setState(prev => ({ ...prev, shipments_loading: true, shipments_error: null }));

      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setState(prev => ({
          ...prev,
          shipments_loading: false,
          shipments_error: 'Non authentifié',
        }));
        return;
      }

      // Build query parameters
      const params: any = {
        mine: true,
        page: page,
      };

      if (status !== 'all') {
        params.status = status;
      }

      // Call the shipments API endpoint
      // Note: This assumes you have a Supabase Edge Function or API endpoint
      // For now, we'll query the shipments table directly
      let query = supabase
        .from('shipments')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1);

      // Filter by client if available
      if (client?.id) {
        query = query.eq('client', client.id);
      }

      // Filter by status if not 'all'
      if (status !== 'all') {
        query = query.eq('current_status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('[DASHBOARD] Error loading shipments:', error);
        setState(prev => ({
          ...prev,
          shipments_loading: false,
          shipments_error: 'Erreur lors du chargement des envois',
        }));
        return;
      }

      // Transform data to match the expected format
      const shipments: Shipment[] = (data || []).map(item => ({
        id: item.id,
        tracking_number: item.tracking_number || 'N/A',
        status: item.current_status || 'unknown',
        created_at: item.created_at,
        origin_city: item.origin_city || 'N/A',
        origin_country: item.origin_country || 'N/A',
        destination_city: item.destination_city || 'N/A',
        destination_country: item.destination_country || 'N/A',
        price_total: item.total_price || 0,
        currency: item.currency || 'MAD',
      }));

      const totalCount = count || 0;
      const hasMore = totalCount > page * 20;

      setState(prev => ({
        ...prev,
        shipments_list: shipments,
        shipments_loading: false,
        current_page: page,
        has_more: hasMore,
      }));
    } catch (error) {
      console.error('[DASHBOARD] Exception loading shipments:', error);
      setState(prev => ({
        ...prev,
        shipments_loading: false,
        shipments_error: 'Une erreur est survenue',
      }));
    }
  }, [user, client]);

  // Initial load
  useEffect(() => {
    if (user && client) {
      loadShipments(1, filterStatus);
    }
  }, [user, client, loadShipments, filterStatus]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadShipments(1, filterStatus).finally(() => setRefreshing(false));
  }, [loadShipments, filterStatus]);

  // Handle filter change
  const handleFilterChange = useCallback((status: string) => {
    setFilterStatus(status);
    loadShipments(1, status);
  }, [loadShipments]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchTracking.trim()) {
      Alert.alert('Recherche', 'Veuillez saisir un numéro de suivi');
      return;
    }

    // Filter shipments by tracking number
    const filtered = state.shipments_list.filter(shipment =>
      shipment.tracking_number.toLowerCase().includes(searchTracking.toLowerCase())
    );

    if (filtered.length === 0) {
      Alert.alert('Aucun résultat', 'Aucun envoi trouvé avec ce numéro de suivi');
    } else {
      // Navigate to the first matching shipment
      router.push(`/(tabs)/shipment-detail?id=${filtered[0].id}`);
    }
  }, [searchTracking, state.shipments_list, router]);

  // Handle new shipment button
  const handleNewShipment = useCallback(() => {
    router.push('/(tabs)/new-shipment');
  }, [router]);

  // Handle shipment card click
  const handleShipmentClick = useCallback((shipment: Shipment) => {
    router.push({
      pathname: '/(tabs)/shipment-detail',
      params: {
        shipment_id: shipment.id,
        tracking_number: shipment.tracking_number,
      },
    });
  }, [router]);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'in_transit':
        return colors.primary;
      case 'registered':
        return colors.secondary;
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  }, []);

  // Format status text
  const formatStatus = useCallback((status: string) => {
    const statusMap: { [key: string]: string } = {
      'registered': 'Enregistré',
      'in_transit': 'En transit',
      'delivered': 'Livré',
      'cancelled': 'Annulé',
    };
    return statusMap[status] || status;
  }, []);

  // Redirect if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/login" />;
  }

  // Redirect if email is not verified
  if (!isEmailVerified()) {
    return <Redirect href="/(tabs)/verify-email" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Mes envois
        </Text>
      </View>

      {/* Filters and Search */}
      <View style={[styles.filtersContainer, { backgroundColor: theme.colors.card }]}>
        {/* Status Filter */}
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
            Filtrer par statut
          </Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.background, borderColor: colors.border }]}>
            <Picker
              selectedValue={filterStatus}
              onValueChange={handleFilterChange}
              style={[styles.picker, { color: theme.colors.text }]}
            >
              {statusOptions.map((option, index) => (
                <Picker.Item key={index} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.colors.background, borderColor: colors.border, color: theme.colors.text }]}
            placeholder="Numéro de suivi"
            placeholderTextColor={colors.textSecondary}
            value={searchTracking}
            onChangeText={setSearchTracking}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={handleSearch}
          >
            <IconSymbol
              ios_icon_name="magnifyingglass"
              android_material_icon_name="search"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleNewShipment}
          >
            <IconSymbol
              ios_icon_name="plus"
              android_material_icon_name="add"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.primaryButtonText}>Nouvel envoi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ghostButton, { borderColor: colors.border }]}
            onPress={onRefresh}
          >
            <IconSymbol
              ios_icon_name="arrow.clockwise"
              android_material_icon_name="refresh"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.ghostButtonText, { color: colors.primary }]}>
              Rafraîchir
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Shipments List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Loading State */}
        {state.shipments_loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Chargement des envois...
            </Text>
          </View>
        )}

        {/* Error State */}
        {state.shipments_error && !state.shipments_loading && (
          <View style={styles.errorContainer}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle"
              android_material_icon_name="error"
              size={48}
              color={colors.error}
            />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {state.shipments_error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={() => loadShipments(1, filterStatus)}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!state.shipments_loading && !state.shipments_error && state.shipments_list.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <IconSymbol
              ios_icon_name="shippingbox"
              android_material_icon_name="inventory_2"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
              Aucun envoi pour le moment
            </Text>
            <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
              Créez un premier envoi pour le voir apparaître ici.
            </Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
              onPress={handleNewShipment}
            >
              <Text style={styles.emptyStateButtonText}>Créer un envoi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Shipments List */}
        {!state.shipments_loading && !state.shipments_error && state.shipments_list.length > 0 && (
          <View style={styles.shipmentsContainer}>
            {state.shipments_list.map((shipment, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.shipmentCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                onPress={() => handleShipmentClick(shipment)}
              >
                {/* Line 1: Tracking Number and Created Date */}
                <View style={styles.cardLine}>
                  <View style={styles.cardLineContent}>
                    <Text style={[styles.cardPrimaryText, { color: theme.colors.text }]}>
                      N° suivi : {shipment.tracking_number}
                    </Text>
                    <Text style={[styles.cardSecondaryText, { color: colors.textSecondary }]}>
                      Créé le : {formatDate(shipment.created_at)}
                    </Text>
                  </View>
                </View>

                {/* Line 2: Origin and Destination */}
                <View style={styles.cardLine}>
                  <View style={styles.cardLineContent}>
                    <Text style={[styles.cardPrimaryText, { color: theme.colors.text }]}>
                      De : {shipment.origin_city}, {shipment.origin_country}
                    </Text>
                    <Text style={[styles.cardSecondaryText, { color: colors.textSecondary }]}>
                      Vers : {shipment.destination_city}, {shipment.destination_country}
                    </Text>
                  </View>
                </View>

                {/* Line 3: Status and Price */}
                <View style={styles.cardLine}>
                  <View style={styles.cardLineContent}>
                    <View style={styles.statusRow}>
                      <Text style={[styles.cardPrimaryText, { color: theme.colors.text }]}>
                        Statut :
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipment.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(shipment.status) }]}>
                          {formatStatus(shipment.status)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.cardSecondaryText, { color: colors.textSecondary }]}>
                      Tarif : {shipment.price_total} {shipment.currency}
                    </Text>
                  </View>
                </View>

                {/* Chevron Icon */}
                <View style={styles.chevronContainer}>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron_right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Load More Button */}
        {state.has_more && !state.shipments_loading && (
          <TouchableOpacity
            style={[styles.loadMoreButton, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            onPress={() => loadShipments(state.current_page + 1, filterStatus)}
          >
            <Text style={[styles.loadMoreText, { color: colors.primary }]}>
              Charger plus
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  filtersContainer: {
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterRow: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ghostButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  ghostButtonText: {
    fontSize: 16,
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
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shipmentsContainer: {
    padding: 16,
    gap: 12,
  },
  shipmentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    position: 'relative',
  },
  cardLine: {
    gap: 4,
  },
  cardLineContent: {
    gap: 4,
  },
  cardPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardSecondaryText: {
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  chevronContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  loadMoreButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
