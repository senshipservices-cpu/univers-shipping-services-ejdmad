
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import { supabase } from '@/app/integrations/supabase/client';

interface Agent {
  id: string;
  company_name: string;
  status: string;
  activities: string[];
  years_experience: number | null;
  whatsapp: string | null;
  email: string | null;
  created_at: string;
  port: { id: string; name: string; country: string } | null;
}

interface Port {
  id: string;
  name: string;
  country: string;
  region: string | null;
  is_hub: boolean;
  is_active: boolean;
  city: string | null;
}

type TabType = 'pending' | 'validated' | 'ports';

export default function AdminAgentsPortsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);
  const [validatedAgents, setValidatedAgents] = useState<Agent[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = appConfig.isAdmin(user?.email);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load pending agents
      const { data: pendingData, error: pendingError } = await supabase
        .from('global_agents')
        .select(`
          id,
          company_name,
          status,
          activities,
          years_experience,
          whatsapp,
          email,
          created_at,
          port:ports(id, name, country)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error('Error loading pending agents:', pendingError);
      } else {
        setPendingAgents(pendingData || []);
      }

      // Load validated agents
      const { data: validatedData, error: validatedError } = await supabase
        .from('global_agents')
        .select(`
          id,
          company_name,
          status,
          activities,
          years_experience,
          whatsapp,
          email,
          created_at,
          port:ports(id, name, country)
        `)
        .in('status', ['validated', 'suspended'])
        .order('created_at', { ascending: false });

      if (validatedError) {
        console.error('Error loading validated agents:', validatedError);
      } else {
        setValidatedAgents(validatedData || []);
      }

      // Load ports
      const { data: portsData, error: portsError } = await supabase
        .from('ports')
        .select('id, name, country, region, is_hub, is_active, city')
        .order('name', { ascending: true });

      if (portsError) {
        console.error('Error loading ports:', portsError);
      } else {
        setPorts(portsData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin, loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleValidateAgent = async (agentId: string) => {
    Alert.alert(
      'Valider l\'agent',
      'Êtes-vous sûr de vouloir valider cet agent ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: async () => {
            const { error } = await supabase
              .from('global_agents')
              .update({ status: 'validated' })
              .eq('id', agentId);

            if (error) {
              console.error('Error validating agent:', error);
              Alert.alert('Erreur', 'Impossible de valider l\'agent.');
            } else {
              Alert.alert('Succès', 'Agent validé avec succès.');
              loadData();
            }
          },
        },
      ]
    );
  };

  const handleRejectAgent = async (agentId: string) => {
    Alert.alert(
      'Rejeter l\'agent',
      'Êtes-vous sûr de vouloir rejeter cet agent ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('global_agents')
              .update({ status: 'rejected' })
              .eq('id', agentId);

            if (error) {
              console.error('Error rejecting agent:', error);
              Alert.alert('Erreur', 'Impossible de rejeter l\'agent.');
            } else {
              Alert.alert('Succès', 'Agent rejeté.');
              loadData();
            }
          },
        },
      ]
    );
  };

  const handleSuspendAgent = async (agentId: string) => {
    Alert.alert(
      'Suspendre l\'agent',
      'Êtes-vous sûr de vouloir suspendre cet agent ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Suspendre',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('global_agents')
              .update({ status: 'suspended' })
              .eq('id', agentId);

            if (error) {
              console.error('Error suspending agent:', error);
              Alert.alert('Erreur', 'Impossible de suspendre l\'agent.');
            } else {
              Alert.alert('Succès', 'Agent suspendu.');
              loadData();
            }
          },
        },
      ]
    );
  };

  const handleTogglePortActive = async (portId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('ports')
      .update({ is_active: !currentStatus })
      .eq('id', portId);

    if (error) {
      console.error('Error toggling port status:', error);
      Alert.alert('Erreur', 'Impossible de modifier le statut du port.');
    } else {
      Alert.alert('Succès', `Port ${!currentStatus ? 'activé' : 'désactivé'}.`);
      loadData();
    }
  };

  const handleTogglePortHub = async (portId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('ports')
      .update({ is_hub: !currentStatus })
      .eq('id', portId);

    if (error) {
      console.error('Error toggling port hub status:', error);
      Alert.alert('Erreur', 'Impossible de modifier le statut hub du port.');
    } else {
      Alert.alert('Succès', `Port ${!currentStatus ? 'marqué' : 'démarqué'} comme hub.`);
      loadData();
    }
  };

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

  const formatActivities = (activities: string[]) => {
    if (!activities || activities.length === 0) return 'N/A';
    return activities.join(', ');
  };

  const getFilteredAgents = (agents: Agent[]) => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter(a => 
      a.company_name?.toLowerCase().includes(query) ||
      a.email?.toLowerCase().includes(query) ||
      a.port?.name.toLowerCase().includes(query) ||
      a.port?.country.toLowerCase().includes(query)
    );
  };

  const getFilteredPorts = () => {
    if (!searchQuery.trim()) return ports;
    const query = searchQuery.toLowerCase();
    return ports.filter(p => 
      p.name?.toLowerCase().includes(query) ||
      p.country?.toLowerCase().includes(query) ||
      p.city?.toLowerCase().includes(query)
    );
  };

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
            Agents & Ports
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.mapButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/admin-agents-ports-map')}
        >
          <IconSymbol
            ios_icon_name="map.fill"
            android_material_icon_name="map"
            size={20}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: activeTab === 'pending' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'pending' ? '#FFFFFF' : theme.colors.text }]}>
              Candidatures ({pendingAgents.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: activeTab === 'validated' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setActiveTab('validated')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'validated' ? '#FFFFFF' : theme.colors.text }]}>
              Agents validés ({validatedAgents.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: activeTab === 'ports' ? colors.primary : theme.colors.card, borderColor: colors.border },
            ]}
            onPress={() => setActiveTab('ports')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'ports' ? '#FFFFFF' : theme.colors.text }]}>
              Ports ({ports.length})
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
            placeholder={activeTab === 'ports' ? 'Rechercher un port...' : 'Rechercher un agent...'}
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

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Pending Agents Tab */}
        {activeTab === 'pending' && (
          <View style={styles.contentSection}>
            {getFilteredAgents(pendingAgents).length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  ios_icon_name="person.3"
                  android_material_icon_name="groups"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  Aucune candidature en attente
                </Text>
              </View>
            ) : (
              getFilteredAgents(pendingAgents).map((agent) => (
                <View
                  key={agent.id}
                  style={[styles.agentCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.agentHeader}>
                    <Text style={[styles.agentName, { color: theme.colors.text }]}>
                      {agent.company_name}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#f59e0b' + '20' }]}>
                      <Text style={[styles.statusText, { color: '#f59e0b' }]}>
                        En attente
                      </Text>
                    </View>
                  </View>

                  <View style={styles.agentContent}>
                    <View style={styles.agentRow}>
                      <IconSymbol
                        ios_icon_name="location.fill"
                        android_material_icon_name="place"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.agentText, { color: colors.textSecondary }]}>
                        {agent.port?.name || 'N/A'}, {agent.port?.country || 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.agentRow}>
                      <IconSymbol
                        ios_icon_name="briefcase.fill"
                        android_material_icon_name="work"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.agentText, { color: colors.textSecondary }]}>
                        {formatActivities(agent.activities)}
                      </Text>
                    </View>

                    <View style={styles.agentRow}>
                      <IconSymbol
                        ios_icon_name="clock.fill"
                        android_material_icon_name="schedule"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.agentText, { color: colors.textSecondary }]}>
                        {agent.years_experience || 0} ans d&apos;expérience
                      </Text>
                    </View>

                    {agent.whatsapp && (
                      <View style={styles.agentRow}>
                        <IconSymbol
                          ios_icon_name="phone.fill"
                          android_material_icon_name="phone"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text style={[styles.agentText, { color: colors.textSecondary }]}>
                          {agent.whatsapp}
                        </Text>
                      </View>
                    )}

                    {agent.email && (
                      <View style={styles.agentRow}>
                        <IconSymbol
                          ios_icon_name="envelope.fill"
                          android_material_icon_name="email"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text style={[styles.agentText, { color: colors.textSecondary }]}>
                          {agent.email}
                        </Text>
                      </View>
                    )}

                    <View style={styles.agentRow}>
                      <IconSymbol
                        ios_icon_name="calendar"
                        android_material_icon_name="event"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.agentText, { color: colors.textSecondary }]}>
                        Candidature: {formatDate(agent.created_at)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.agentActions}>
                    <TouchableOpacity
                      style={[styles.actionButtonSecondary, { borderColor: colors.border }]}
                      onPress={() => router.push(`/(tabs)/admin-agent-details?id=${agent.id}`)}
                    >
                      <Text style={[styles.actionButtonSecondaryText, { color: colors.primary }]}>
                        Voir détails
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButtonPrimary, { backgroundColor: '#10b981' }]}
                      onPress={() => handleValidateAgent(agent.id)}
                    >
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={16}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionButtonPrimaryText}>Valider</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButtonPrimary, { backgroundColor: '#ef4444' }]}
                      onPress={() => handleRejectAgent(agent.id)}
                    >
                      <IconSymbol
                        ios_icon_name="xmark"
                        android_material_icon_name="close"
                        size={16}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionButtonPrimaryText}>Rejeter</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Validated Agents Tab */}
        {activeTab === 'validated' && (
          <View style={styles.contentSection}>
            {getFilteredAgents(validatedAgents).length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  ios_icon_name="person.3"
                  android_material_icon_name="groups"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  Aucun agent validé
                </Text>
              </View>
            ) : (
              getFilteredAgents(validatedAgents).map((agent) => (
                <View
                  key={agent.id}
                  style={[styles.agentCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.agentHeader}>
                    <Text style={[styles.agentName, { color: theme.colors.text }]}>
                      {agent.company_name}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: agent.status === 'validated' ? '#10b981' + '20' : '#ef4444' + '20' }]}>
                      <Text style={[styles.statusText, { color: agent.status === 'validated' ? '#10b981' : '#ef4444' }]}>
                        {agent.status === 'validated' ? 'Validé' : 'Suspendu'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.agentContent}>
                    <View style={styles.agentRow}>
                      <IconSymbol
                        ios_icon_name="location.fill"
                        android_material_icon_name="place"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.agentText, { color: colors.textSecondary }]}>
                        {agent.port?.name || 'N/A'}, {agent.port?.country || 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.agentRow}>
                      <IconSymbol
                        ios_icon_name="briefcase.fill"
                        android_material_icon_name="work"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.agentText, { color: colors.textSecondary }]}>
                        {formatActivities(agent.activities)}
                      </Text>
                    </View>

                    {agent.email && (
                      <View style={styles.agentRow}>
                        <IconSymbol
                          ios_icon_name="envelope.fill"
                          android_material_icon_name="email"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text style={[styles.agentText, { color: colors.textSecondary }]}>
                          {agent.email}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.agentActions}>
                    <TouchableOpacity
                      style={[styles.actionButtonSecondary, { borderColor: colors.border }]}
                      onPress={() => router.push(`/(tabs)/admin-agent-details?id=${agent.id}`)}
                    >
                      <Text style={[styles.actionButtonSecondaryText, { color: colors.primary }]}>
                        Modifier
                      </Text>
                    </TouchableOpacity>

                    {agent.status === 'validated' && (
                      <TouchableOpacity
                        style={[styles.actionButtonPrimary, { backgroundColor: '#ef4444' }]}
                        onPress={() => handleSuspendAgent(agent.id)}
                      >
                        <Text style={styles.actionButtonPrimaryText}>Suspendre</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Ports Tab */}
        {activeTab === 'ports' && (
          <View style={styles.contentSection}>
            {getFilteredPorts().length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  ios_icon_name="map"
                  android_material_icon_name="map"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  Aucun port trouvé
                </Text>
              </View>
            ) : (
              getFilteredPorts().map((port) => (
                <View
                  key={port.id}
                  style={[styles.portCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.portHeader}>
                    <View style={styles.portHeaderLeft}>
                      <Text style={[styles.portName, { color: theme.colors.text }]}>
                        {port.name}
                      </Text>
                      <Text style={[styles.portCountry, { color: colors.textSecondary }]}>
                        {port.city ? `${port.city}, ` : ''}{port.country}
                      </Text>
                    </View>
                    <View style={styles.portBadges}>
                      {port.is_hub && (
                        <View style={[styles.hubBadge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.hubBadgeText, { color: colors.primary }]}>
                            Hub
                          </Text>
                        </View>
                      )}
                      <View style={[styles.statusBadge, { backgroundColor: port.is_active ? '#10b981' + '20' : '#ef4444' + '20' }]}>
                        <Text style={[styles.statusText, { color: port.is_active ? '#10b981' : '#ef4444' }]}>
                          {port.is_active ? 'Actif' : 'Inactif'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {port.region && (
                    <View style={styles.portRow}>
                      <IconSymbol
                        ios_icon_name="globe"
                        android_material_icon_name="public"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.portText, { color: colors.textSecondary }]}>
                        Région: {port.region}
                      </Text>
                    </View>
                  )}

                  <View style={styles.portActions}>
                    <TouchableOpacity
                      style={[styles.actionButtonSecondary, { borderColor: colors.border }]}
                      onPress={() => handleTogglePortActive(port.id, port.is_active)}
                    >
                      <Text style={[styles.actionButtonSecondaryText, { color: colors.primary }]}>
                        {port.is_active ? 'Désactiver' : 'Activer'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButtonSecondary, { borderColor: colors.border }]}
                      onPress={() => handleTogglePortHub(port.id, port.is_hub)}
                    >
                      <Text style={[styles.actionButtonSecondaryText, { color: colors.primary }]}>
                        {port.is_hub ? 'Retirer Hub' : 'Marquer Hub'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
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
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsSection: {
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
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
  contentSection: {
    padding: 20,
    gap: 16,
  },
  agentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agentName: {
    fontSize: 18,
    fontWeight: '700',
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
  agentContent: {
    gap: 8,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  agentText: {
    fontSize: 14,
    flex: 1,
  },
  agentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButtonSecondary: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  portCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  portHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  portHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  portName: {
    fontSize: 18,
    fontWeight: '700',
  },
  portCountry: {
    fontSize: 14,
  },
  portBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  hubBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hubBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  portRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portText: {
    fontSize: 14,
  },
  portActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
