
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, Modal, Platform } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import { supabase } from '@/app/integrations/supabase/client';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Subscription {
  id: string;
  client: {
    id: string;
    company_name: string;
    email: string;
  } | null;
  plan_type: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  source: string | null;
  created_at: string;
}

export default function AdminSubscriptionsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [newEndDate, setNewEndDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isAdmin = appConfig.isAdmin(user?.email);

  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          plan_type,
          start_date,
          end_date,
          is_active,
          source,
          created_at,
          client:clients(id, company_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading subscriptions:', error);
        Alert.alert('Erreur', 'Impossible de charger les abonnements.');
        return;
      }

      setSubscriptions(data || []);
      setFilteredSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement des abonnements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadSubscriptions();
    }
  }, [user, isAdmin, loadSubscriptions]);

  useEffect(() => {
    let filtered = subscriptions;

    if (filterPlan !== 'all') {
      filtered = filtered.filter(sub => sub.plan_type === filterPlan);
    }

    if (filterActive === 'active') {
      filtered = filtered.filter(sub => sub.is_active);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(sub => !sub.is_active);
    }

    setFilteredSubscriptions(filtered);
  }, [filterPlan, filterActive, subscriptions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSubscriptions();
  }, [loadSubscriptions]);

  const toggleActiveStatus = async (subscription: Subscription) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ is_active: !subscription.is_active })
        .eq('id', subscription.id);

      if (error) {
        console.error('Error updating subscription:', error);
        Alert.alert('Erreur', 'Impossible de modifier le statut de l\'abonnement.');
        return;
      }

      Alert.alert(
        'Succès',
        `Abonnement ${!subscription.is_active ? 'activé' : 'désactivé'} avec succès.`
      );
      loadSubscriptions();
    } catch (error) {
      console.error('Error toggling subscription status:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const openEditModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setNewEndDate(subscription.end_date ? new Date(subscription.end_date) : new Date());
    setEditModalVisible(true);
  };

  const updateEndDate = async () => {
    if (!selectedSubscription) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ end_date: newEndDate.toISOString().split('T')[0] })
        .eq('id', selectedSubscription.id);

      if (error) {
        console.error('Error updating end date:', error);
        Alert.alert('Erreur', 'Impossible de modifier la date de fin.');
        return;
      }

      Alert.alert('Succès', 'Date de fin modifiée avec succès.');
      setEditModalVisible(false);
      loadSubscriptions();
    } catch (error) {
      console.error('Error updating end date:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

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
            Chargement des abonnements...
          </Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Abonnements
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterPlan === 'all' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilterPlan('all')}
          >
            <Text style={[styles.filterChipText, filterPlan === 'all' && { color: '#FFFFFF' }]}>
              Tous les plans
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterPlan === 'basic' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilterPlan('basic')}
          >
            <Text style={[styles.filterChipText, filterPlan === 'basic' && { color: '#FFFFFF' }]}>
              Basic
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterPlan === 'premium_tracking' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilterPlan('premium_tracking')}
          >
            <Text style={[styles.filterChipText, filterPlan === 'premium_tracking' && { color: '#FFFFFF' }]}>
              Premium
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterPlan === 'enterprise_logistics' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilterPlan('enterprise_logistics')}
          >
            <Text style={[styles.filterChipText, filterPlan === 'enterprise_logistics' && { color: '#FFFFFF' }]}>
              Enterprise
            </Text>
          </TouchableOpacity>

          <View style={styles.filterDivider} />

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterActive === 'all' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilterActive('all')}
          >
            <Text style={[styles.filterChipText, filterActive === 'all' && { color: '#FFFFFF' }]}>
              Tous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterActive === 'active' && { backgroundColor: '#10b981' },
            ]}
            onPress={() => setFilterActive('active')}
          >
            <Text style={[styles.filterChipText, filterActive === 'active' && { color: '#FFFFFF' }]}>
              Actifs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filterActive === 'inactive' && { backgroundColor: colors.error },
            ]}
            onPress={() => setFilterActive('inactive')}
          >
            <Text style={[styles.filterChipText, filterActive === 'inactive' && { color: '#FFFFFF' }]}>
              Inactifs
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Subscriptions List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {filteredSubscriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="star.slash"
              android_material_icon_name="star_border"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucun abonnement trouvé
            </Text>
          </View>
        ) : (
          filteredSubscriptions.map((subscription) => (
            <View
              key={subscription.id}
              style={[styles.subscriptionCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
            >
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionHeaderLeft}>
                  <Text style={[styles.clientName, { color: theme.colors.text }]}>
                    {subscription.client?.company_name || 'Client inconnu'}
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
              </View>

              <View style={styles.subscriptionDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Plan:</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {formatPlanType(subscription.plan_type)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email:</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {subscription.client?.email || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Début:</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {formatDate(subscription.start_date)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fin:</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {formatDate(subscription.end_date)}
                  </Text>
                </View>

                {subscription.source && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Source:</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {subscription.source}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.subscriptionActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: subscription.is_active ? colors.error + '20' : '#10b981' + '20' }]}
                  onPress={() => toggleActiveStatus(subscription)}
                >
                  <IconSymbol
                    ios_icon_name={subscription.is_active ? 'pause.circle' : 'play.circle'}
                    android_material_icon_name={subscription.is_active ? 'pause_circle' : 'play_circle'}
                    size={20}
                    color={subscription.is_active ? colors.error : '#10b981'}
                  />
                  <Text style={[styles.actionButtonText, { color: subscription.is_active ? colors.error : '#10b981' }]}>
                    {subscription.is_active ? 'Désactiver' : 'Activer'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={() => openEditModal(subscription)}
                >
                  <IconSymbol
                    ios_icon_name="calendar"
                    android_material_icon_name="event"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                    Modifier date
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.secondary + '20' }]}
                  onPress={() => router.push(`/(tabs)/admin-subscription-details?id=${subscription.id}` as any)}
                >
                  <IconSymbol
                    ios_icon_name="info.circle"
                    android_material_icon_name="info"
                    size={20}
                    color={colors.secondary}
                  />
                  <Text style={[styles.actionButtonText, { color: colors.secondary }]}>
                    Détails
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit End Date Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Modifier la date de fin
            </Text>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {selectedSubscription?.client?.company_name}
            </Text>

            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: theme.colors.background }]}
              onPress={() => setShowDatePicker(true)}
            >
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="event"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                {newEndDate.toLocaleDateString('fr-FR')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newEndDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setNewEndDate(selectedDate);
                  }
                }}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.textSecondary + '20' }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={updateEndDate}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Enregistrer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  filtersContainer: {
    paddingVertical: 12,
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
    backgroundColor: colors.border,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  subscriptionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subscriptionHeaderLeft: {
    flex: 1,
    gap: 8,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  subscriptionActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
