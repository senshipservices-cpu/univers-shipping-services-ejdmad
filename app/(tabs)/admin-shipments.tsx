
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import { supabase } from '@/app/integrations/supabase/client';

interface Shipment {
  id: string;
  tracking_number: string;
  current_status: string;
  eta: string | null;
  updated_at: string;
  origin_port: { id: string; name: string } | null;
  destination_port: { id: string; name: string } | null;
  clients: { company_name: string; contact_name: string | null } | null;
  responsible_user: { email: string } | null;
}

export default function AdminShipmentsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = appConfig.isAdmin(user?.email);

  const loadShipments = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('shipments')
        .select(`
          id,
          tracking_number,
          current_status,
          eta,
          updated_at,
          origin_port:ports!shipments_origin_port_fkey(id, name),
          destination_port:ports!shipments_destination_port_fkey(id, name),
          clients(company_name, contact_name),
          responsible_user:auth.users!shipments_responsible_fkey(email)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading shipments:', error);
        Alert.alert('Erreur', 'Impossible de charger les expéditions.');
      } else {
        setShipments(data || []);
        setFilteredShipments(data || []);
      }
    } catch (error) {
      console.error('Error loading shipments:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadShipments();
    }
  }, [user, isAdmin, loadShipments]);

  useEffect(() => {
    let filtered = shipments;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.current_status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.tracking_number?.toLowerCase().includes(query) ||
        s.clients?.company_name?.toLowerCase().includes(query) ||
        s.origin_port?.name.toLowerCase().includes(query) ||
        s.destination_port?.name.toLowerCase().includes(query)
      );
    }

    setFilteredShipments(filtered);
  }, [statusFilter, searchQuery, shipments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadShipments();
  }, [loadShipments]);

  if (!authLoading && !user) {
    Alert.alert('Accès refusé', 'Accès réservé à l\'équipe Universal Shipping Services.');
    return <Redirect href="/(tabs)/login" />;
  }

  if (!authLoading && user && !isAdmin) {
    Alert.alert('Accès refusé', 'Accès réservé à l\'équipe Universal Shipping Services.');
    return <Redirect href="/(tabs)/login" />;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
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
        return '#10b981';
      case 'in_transit':
      case 'confirmed':
        return colors.primary;
      case 'at_port':
        return '#f59e0b';
      case 'on_hold':
      case 'cancelled':
        return '#ef4444';
      case 'draft':
      case 'quote_pending':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement des expéditions...
          </Text>
        </View>
      </View>
    );
  }

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
            Gestion des Shipments
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: statusFilter === 'all' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[styles.filterChipText, { color: statusFilter === 'all' ? '#FFFFFF' : theme.colors.text }]}>
              Tous ({shipments.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: statusFilter === 'confirmed' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setStatusFilter('confirmed')}
          >
            <Text style={[styles.filterChipText, { color: statusFilter === 'confirmed' ? '#FFFFFF' : theme.colors.text }]}>
              Confirmé
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: statusFilter === 'in_transit' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setStatusFilter('in_transit')}
          >
            <Text style={[styles.filterChipText, { color: statusFilter === 'in_transit' ? '#FFFFFF' : theme.colors.text }]}>
              En transit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: statusFilter === 'delivered' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setStatusFilter('delivered')}
          >
            <Text style={[styles.filterChipText, { color: statusFilter === 'delivered' ? '#FFFFFF' : theme.colors.text }]}>
              Livré
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: statusFilter === 'cancelled' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setStatusFilter('cancelled')}
          >
            <Text style={[styles.filterChipText, { color: statusFilter === 'cancelled' ? '#FFFFFF' : theme.colors.text }]}>
              Annulé
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Rechercher par référence, client, ports..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
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
        {filteredShipments.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="shippingbox"
              android_material_icon_name="inventory_2"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Aucune expédition trouvée
            </Text>
          </View>
        ) : (
          <View style={styles.shipmentsList}>
            {filteredShipments.map((shipment) => (
              <TouchableOpacity
                key={shipment.id}
                style={[styles.shipmentCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/(tabs)/admin-shipment-details?id=${shipment.id}`)}
              >
                <View style={styles.shipmentHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipment.current_status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(shipment.current_status) }]}>
                      {formatStatus(shipment.current_status)}
                    </Text>
                  </View>
                  <Text style={[styles.shipmentDate, { color: colors.textSecondary }]}>
                    Mis à jour: {formatDate(shipment.updated_at)}
                  </Text>
                </View>

                <View style={styles.shipmentContent}>
                  <View style={styles.shipmentRow}>
                    <IconSymbol
                      ios_icon_name="number"
                      android_material_icon_name="tag"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.shipmentText, { color: theme.colors.text, fontWeight: '600' }]}>
                      {shipment.tracking_number}
                    </Text>
                  </View>

                  <View style={styles.shipmentRow}>
                    <IconSymbol
                      ios_icon_name="building.2.fill"
                      android_material_icon_name="business"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.shipmentText, { color: colors.textSecondary }]}>
                      {shipment.clients?.company_name || 'Client inconnu'}
                    </Text>
                  </View>

                  <View style={styles.shipmentRow}>
                    <IconSymbol
                      ios_icon_name="location.fill"
                      android_material_icon_name="place"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.shipmentText, { color: colors.textSecondary }]}>
                      {shipment.origin_port?.name || 'N/A'} → {shipment.destination_port?.name || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.shipmentRow}>
                    <IconSymbol
                      ios_icon_name="calendar"
                      android_material_icon_name="event"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.shipmentText, { color: colors.textSecondary }]}>
                      ETA: {formatDate(shipment.eta)}
                    </Text>
                  </View>

                  {shipment.responsible_user && (
                    <View style={styles.shipmentRow}>
                      <IconSymbol
                        ios_icon_name="person.fill"
                        android_material_icon_name="person"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.shipmentText, { color: colors.textSecondary }]}>
                        Responsable: {shipment.responsible_user.email}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.shipmentFooter}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push(`/(tabs)/admin-shipment-details?id=${shipment.id}`)}
                  >
                    <Text style={styles.actionButtonText}>Gérer</Text>
                    <IconSymbol
                      ios_icon_name="chevron.right"
                      android_material_icon_name="chevron_right"
                      size={16}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
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
  },
  filtersSection: {
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
  },
  shipmentsList: {
    padding: 20,
    gap: 16,
  },
  shipmentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  shipmentHeader: {
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
  shipmentDate: {
    fontSize: 11,
  },
  shipmentContent: {
    gap: 8,
  },
  shipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shipmentText: {
    fontSize: 14,
    flex: 1,
  },
  shipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
