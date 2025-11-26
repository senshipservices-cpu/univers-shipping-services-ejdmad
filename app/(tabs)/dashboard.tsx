
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

const PAGE_SIZE = 20;

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
    { label: 'Brouillon', value: 'draft' },
    { label: 'Devis en attente', value: 'quote_pending' },
    { label: 'Confirmé', value: 'confirmed' },
    { label: 'En transit', value: 'in_transit' },
    { label: 'Au port', value: 'at_port' },
    { label: 'Livré', value: 'delivered' },
    { label: 'En attente', value: 'on_hold' },
    { label: 'Annulé', value: 'cancelled' },
  ];

  // Load shipments from API
  const loadShipments = useCallback(async (
    page: number = 1, 
    status: string = 'all',
    search: string = '',
    append: boolean = false
  ) => {
    if (!user?.id || !client?.id) {
      console.log('[DASHBOARD] No user or client ID available');
      return;
    }

    try {
      console.log('[DASHBOARD] Loading shipments - Page:', page, 'Status:', status, 'Search:', search);
      
      setState(prev => ({ 
        ...prev, 
        shipments_loading: true, 
        shipments_error: null,
        current_page: page,
      }));

      // Build query with joins to get port information
      let query = supabase
        .from('shipments')
        .select(`
          id,
          tracking_number,
          current_status,
          created_at,
          origin_port:ports!shipments_origin_port_fkey(city, country),
          destination_port:ports!shipments_destination_port_fkey(city, country)
        `, { count: 'exact' })
        .eq('client', client.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      // Filter by status if not 'all'
      if (status !== 'all') {
        query = query.eq('current_status', status);
      }

      // Filter by tracking number if search is provided
      if (search && search.trim() !== '') {
        query = query.ilike('tracking_number', `%${search.trim()}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('[DASHBOARD] Error loading shipments:', error);
        setState(prev => ({
          ...prev,
          shipments_loading: false,
          shipments_error: search 
            ? 'Aucun envoi trouvé ou service indisponible.'
            : 'Impossible de charger vos envois pour le moment.',
        }));
        return;
      }

      console.log('[DASHBOARD] Loaded shipments:', data?.length || 0);

      // Transform data to match the expected format
      const shipments: Shipment[] = (data || []).map(item => ({
        id: item.id,
        tracking_number: item.tracking_number || 'N/A',
        status: item.current_status || 'draft',
        created_at: item.created_at,
        origin_city: (item.origin_port as any)?.city || 'N/A',
        origin_country: (item.origin_port as any)?.country || 'N/A',
        destination_city: (item.destination_port as any)?.city || 'N/A',
        destination_country: (item.destination_port as any)?.country || 'N/A',
        price_total: 0, // Will be populated from freight_quotes if needed
        currency: 'MAD',
      }));

      const totalCount = count || 0;
      const hasMore = shipments.length > 0 && (page * PAGE_SIZE < totalCount);

      console.log('[DASHBOARD] Total count:', totalCount, 'Has more:', hasMore);

      setState(prev => ({
        ...prev,
        shipments_list: append ? [...prev.shipments_list, ...shipments] : shipments,
        shipments_loading: false,
        current_page: page,
        has_more: hasMore,
      }));
    } catch (error) {
      console.error('[DASHBOARD] Exception loading shipments:', error);
      setState(prev => ({
        ...prev,
        shipments_loading: false,
        shipments_error: search 
          ? 'Aucun envoi trouvé ou service indisponible.'
          : 'Impossible de charger vos envois pour le moment.',
      }));
    }
  }, [user, client]);

  // ⭐ 1. Initial load - ON_SCREEN_LOAD
  useEffect(() => {
    if (user && client) {
      console.log('[DASHBOARD] Initial load triggered');
      loadShipments(1, filterStatus, '');
    }
  }, [user, client]);

  // ⭐ 2. Handle refresh - ON_CLICK (btn_refresh)
  const onRefresh = useCallback(() => {
    console.log('[DASHBOARD] Refresh triggered');
    setRefreshing(true);
    setFilterStatus('all');
    setSearchTracking('');
    loadShipments(1, 'all', '').finally(() => setRefreshing(false));
  }, [loadShipments]);

  // ⭐ 3. Handle filter change - ON_CHANGE (filter_status)
  const handleFilterChange = useCallback((status: string) => {
    console.log('[DASHBOARD] Filter changed to:', status);
    setFilterStatus(status);
    setSearchTracking(''); // Clear search when filtering
    loadShipments(1, status, '');
  }, [loadShipments]);

  // ⭐ 5. Handle search - ON_CLICK (btn_search)
  const handleSearch = useCallback(() => {
    if (!searchTracking.trim()) {
      Alert.alert('Recherche', 'Veuillez saisir un numéro de suivi');
      return;
    }

    console.log('[DASHBOARD] Searching for:', searchTracking);
    
    // Reset to page 1 and search
    loadShipments(1, filterStatus, searchTracking);
  }, [searchTracking, filterStatus, loadShipments]);

  // ⭐ 6. Handle load more - ON_CLICK (btn_load_more)
  const handleLoadMore = useCallback(() => {
    if (state.shipments_loading || !state.has_more) {
      return;
    }

    console.log('[DASHBOARD] Load more triggered');
    const nextPage = state.current_page + 1;
    
    // Load next page and append results
    loadShipments(nextPage, filterStatus, searchTracking, true);
  }, [state.shipments_loading, state.has_more, state.current_page, filterStatus, searchTracking, loadShipments]);

  // ⭐ 8. Handle new shipment button - ON_CLICK (btn_new_shipment)
  const handleNewShipment = useCallback(() => {
    console.log('[DASHBOARD] New shipment button clicked');
    router.push('/(tabs)/new-shipment');
  }, [router]);

  // ⭐ 7. Handle shipment card click - ON_CLICK (list_shipments.item)
  const handleShipmentClick = useCallback((shipment: Shipment) => {
    console.log('[DASHBOARD] Shipment clicked:', shipment.id);
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
      case 'confirmed':
        return '#3b82f6';
      case 'at_port':
        return '#8b5cf6';
      case 'quote_pending':
        return '#f59e0b';
      case 'draft':
        return colors.textSecondary;
      case 'on_hold':
        return '#f97316';
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  }, []);

  // Format status text
  const formatStatus = useCallback((status: string) => {
    const statusMap: { [key: string]: string } = {
      'draft': 'Brouillon',
      'quote_pending': 'Devis en attente',
      'confirmed': 'Confirmé',
      'in_transit': 'En transit',
      'at_port': 'Au port',
      'delivered': 'Livré',
      'on_hold': 'En attente',
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
            disabled={state.shipments_loading}
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
            disabled={state.shipments_loading}
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
        {/* ⭐ 4. Loading State - DISPLAY (si shipments_loading == true) */}
        {state.shipments_loading && state.shipments_list.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Chargement...
            </Text>
          </View>
        )}

        {/* ⭐ 4. Error State - DISPLAY (si shipments_error non nul) */}
        {state.shipments_error && !state.shipments_loading && state.shipments_list.length === 0 && (
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
              onPress={() => loadShipments(1, filterStatus, searchTracking)}
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
            {/* ⭐ 8. Empty state button - ON_CLICK (btn_empty_new) */}
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
              onPress={handleNewShipment}
            >
              <Text style={styles.emptyStateButtonText}>Créer un envoi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Shipments List */}
        {!state.shipments_loading && state.shipments_list.length > 0 && (
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

                {/* Line 3: Status */}
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

        {/* ⭐ 6. Load More Button - Pagination */}
        {state.has_more && !state.shipments_loading && state.shipments_list.length > 0 && (
          <TouchableOpacity
            style={[styles.loadMoreButton, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            onPress={handleLoadMore}
          >
            <Text style={[styles.loadMoreText, { color: colors.primary }]}>
              Charger plus
            </Text>
          </TouchableOpacity>
        )}

        {/* Loading indicator for pagination */}
        {state.shipments_loading && state.shipments_list.length > 0 && (
          <View style={styles.paginationLoadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.paginationLoadingText, { color: colors.textSecondary }]}>
              Chargement...
            </Text>
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
  paginationLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  paginationLoadingText: {
    fontSize: 14,
  },
});
