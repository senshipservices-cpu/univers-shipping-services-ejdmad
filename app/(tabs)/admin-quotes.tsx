
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import { supabase } from '@/app/integrations/supabase/client';

interface FreightQuote {
  id: string;
  client_email: string | null;
  client_name: string | null;
  cargo_type: string | null;
  status: string;
  created_at: string;
  service_id: string | null;
  origin_port: { id: string; name: string } | null;
  destination_port: { id: string; name: string } | null;
  services_global: { name_fr: string } | null;
}

export default function AdminQuotesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quotes, setQuotes] = useState<FreightQuote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<FreightQuote[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = appConfig.isAdmin(user?.email);

  const loadQuotes = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('freight_quotes')
        .select(`
          id,
          client_email,
          client_name,
          cargo_type,
          status,
          created_at,
          service_id,
          origin_port:ports!freight_quotes_origin_port_fkey(id, name),
          destination_port:ports!freight_quotes_destination_port_fkey(id, name),
          services_global(name_fr)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading quotes:', error);
        Alert.alert('Erreur', 'Impossible de charger les devis.');
      } else {
        setQuotes(data || []);
        setFilteredQuotes(data || []);
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadQuotes();
    }
  }, [user, isAdmin, loadQuotes]);

  useEffect(() => {
    let filtered = quotes;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.client_email?.toLowerCase().includes(query) ||
        q.client_name?.toLowerCase().includes(query) ||
        q.cargo_type?.toLowerCase().includes(query) ||
        q.origin_port?.name.toLowerCase().includes(query) ||
        q.destination_port?.name.toLowerCase().includes(query)
      );
    }

    setFilteredQuotes(filtered);
  }, [statusFilter, searchQuery, quotes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadQuotes();
  }, [loadQuotes]);

  if (!authLoading && !user) {
    Alert.alert('Accès refusé', 'Accès réservé à l\'équipe Universal Shipping Services.');
    return <Redirect href="/(tabs)/login" />;
  }

  if (!authLoading && user && !isAdmin) {
    Alert.alert('Accès refusé', 'Accès réservé à l\'équipe Universal Shipping Services.');
    return <Redirect href="/(tabs)/login" />;
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
      pending: 'En attente',
      in_review: 'En révision',
      quoted: 'Devisé',
      converted: 'Converti',
      rejected: 'Rejeté',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'converted':
        return '#10b981';
      case 'in_progress':
      case 'in_review':
        return colors.primary;
      case 'sent_to_client':
      case 'quoted':
        return '#f59e0b';
      case 'refused':
      case 'rejected':
        return '#ef4444';
      case 'received':
      case 'pending':
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
            Chargement des devis...
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
            Gestion des Devis
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
              Tous ({quotes.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: statusFilter === 'pending' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setStatusFilter('pending')}
          >
            <Text style={[styles.filterChipText, { color: statusFilter === 'pending' ? '#FFFFFF' : theme.colors.text }]}>
              En attente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: statusFilter === 'in_review' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setStatusFilter('in_review')}
          >
            <Text style={[styles.filterChipText, { color: statusFilter === 'in_review' ? '#FFFFFF' : theme.colors.text }]}>
              En révision
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: statusFilter === 'quoted' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setStatusFilter('quoted')}
          >
            <Text style={[styles.filterChipText, { color: statusFilter === 'quoted' ? '#FFFFFF' : theme.colors.text }]}>
              Devisé
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: statusFilter === 'converted' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setStatusFilter('converted')}
          >
            <Text style={[styles.filterChipText, { color: statusFilter === 'converted' ? '#FFFFFF' : theme.colors.text }]}>
              Converti
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: statusFilter === 'rejected' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setStatusFilter('rejected')}
          >
            <Text style={[styles.filterChipText, { color: statusFilter === 'rejected' ? '#FFFFFF' : theme.colors.text }]}>
              Rejeté
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
            placeholder="Rechercher par client, email, cargo..."
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

      {/* Quotes List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {filteredQuotes.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="doc.text"
              android_material_icon_name="description"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Aucun devis trouvé
            </Text>
          </View>
        ) : (
          <View style={styles.quotesList}>
            {filteredQuotes.map((quote) => (
              <TouchableOpacity
                key={quote.id}
                style={[styles.quoteCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/(tabs)/admin-quote-details?id=${quote.id}`)}
              >
                <View style={styles.quoteHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                      {formatStatus(quote.status)}
                    </Text>
                  </View>
                  <Text style={[styles.quoteDate, { color: colors.textSecondary }]}>
                    {formatDate(quote.created_at)}
                  </Text>
                </View>

                <View style={styles.quoteContent}>
                  <View style={styles.quoteRow}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.quoteText, { color: theme.colors.text }]}>
                      {quote.client_name || quote.client_email || 'Client inconnu'}
                    </Text>
                  </View>

                  <View style={styles.quoteRow}>
                    <IconSymbol
                      ios_icon_name="envelope.fill"
                      android_material_icon_name="email"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.quoteText, { color: colors.textSecondary }]}>
                      {quote.client_email || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.quoteRow}>
                    <IconSymbol
                      ios_icon_name="shippingbox.fill"
                      android_material_icon_name="inventory_2"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.quoteText, { color: colors.textSecondary }]}>
                      {quote.cargo_type || 'Non spécifié'}
                    </Text>
                  </View>

                  <View style={styles.quoteRow}>
                    <IconSymbol
                      ios_icon_name="location.fill"
                      android_material_icon_name="place"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.quoteText, { color: colors.textSecondary }]}>
                      {quote.origin_port?.name || 'N/A'} → {quote.destination_port?.name || 'N/A'}
                    </Text>
                  </View>

                  {quote.services_global && (
                    <View style={styles.quoteRow}>
                      <IconSymbol
                        ios_icon_name="wrench.and.screwdriver.fill"
                        android_material_icon_name="build"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.quoteText, { color: colors.textSecondary }]}>
                        {quote.services_global.name_fr}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.quoteFooter}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push(`/(tabs)/admin-quote-details?id=${quote.id}`)}
                  >
                    <Text style={styles.actionButtonText}>Voir détail</Text>
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
  quotesList: {
    padding: 20,
    gap: 16,
  },
  quoteCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  quoteHeader: {
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
  quoteDate: {
    fontSize: 12,
  },
  quoteContent: {
    gap: 8,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quoteText: {
    fontSize: 14,
    flex: 1,
  },
  quoteFooter: {
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
