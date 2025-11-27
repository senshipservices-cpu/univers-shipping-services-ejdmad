
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import { supabase } from '@/app/integrations/supabase/client';
import { PortsMap } from '@/components/PortsMap';
import { useLanguage } from '@/contexts/LanguageContext';

interface Agent {
  id: string;
  company_name: string;
  status: string;
  activities: string[];
  years_experience: number | null;
  whatsapp: string | null;
  email: string | null;
  created_at: string;
  port: {
    id: string;
    name: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
}

export default function AdminAgentsPortsMapScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);

  const isAdmin = appConfig.isAdmin(user?.email);

  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);

      // Load all validated agents with their port information
      const { data: agentsData, error: agentsError } = await supabase
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
          port:ports(id, name, country, latitude, longitude)
        `)
        .eq('status', 'validated')
        .order('created_at', { ascending: false });

      if (agentsError) {
        console.error('Error loading agents:', agentsError);
        Alert.alert('Erreur', 'Impossible de charger les agents.');
      } else {
        setAgents(agentsData || []);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadAgents();
    }
  }, [user, isAdmin, loadAgents]);

  if (!authLoading && !user) {
    Alert.alert('Accès refusé', 'Accès réservé à l\'équipe Universal Shipping Services.');
    return <Redirect href="/(tabs)/login" />;
  }

  if (!authLoading && user && !isAdmin) {
    Alert.alert('Accès refusé', 'Accès réservé à l\'équipe Universal Shipping Services.');
    return <Redirect href="/(tabs)/login" />;
  }

  const handleAgentPress = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
      setShowAgentModal(true);
    }
  };

  const handleViewAgentDetails = () => {
    if (selectedAgent) {
      setShowAgentModal(false);
      router.push(`/(tabs)/admin-agent-details?id=${selectedAgent.id}`);
    }
  };

  // Get agents with valid port coordinates for the map
  const agentsWithCoordinates = agents
    .filter(a => a.port && a.port.latitude !== null && a.port.longitude !== null)
    .map(a => ({
      id: a.port!.id,
      name: a.port!.name,
      lat: Number(a.port!.latitude),
      lng: Number(a.port!.longitude),
      is_hub: false,
      country: a.port!.country,
    }));

  // Remove duplicate ports (multiple agents in same port)
  const uniquePorts = agentsWithCoordinates.reduce((acc, port) => {
    if (!acc.find(p => p.id === port.id)) {
      acc.push(port);
    }
    return acc;
  }, [] as typeof agentsWithCoordinates);

  const formatActivities = (activities: string[]) => {
    if (!activities || activities.length === 0) return 'N/A';
    return activities.join(', ');
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {language === 'en' ? 'Loading agents...' : 'Chargement des agents...'}
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
            {language === 'en' ? 'Agents Map' : 'Carte des Agents'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Section */}
        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <Text style={[styles.mapTitle, { color: theme.colors.text }]}>
              {language === 'en' 
                ? `${agents.length} Validated Agents` 
                : `${agents.length} Agents Validés`}
            </Text>
            <Text style={[styles.mapSubtitle, { color: colors.textSecondary }]}>
              {language === 'en'
                ? `Showing ${uniquePorts.length} port locations`
                : `Affichage de ${uniquePorts.length} emplacements portuaires`}
            </Text>
          </View>

          {uniquePorts.length === 0 ? (
            <View style={[styles.emptyMapContainer, { backgroundColor: colors.highlight }]}>
              <IconSymbol
                ios_icon_name="map"
                android_material_icon_name="map"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyMapText, { color: theme.colors.text }]}>
                {language === 'en'
                  ? 'No agents with location data available'
                  : 'Aucun agent avec données de localisation disponible'}
              </Text>
            </View>
          ) : (
            <View style={styles.mapContainer}>
              <PortsMap 
                ports={uniquePorts} 
                onPortPress={(portId) => {
                  // Find first agent in this port
                  const agent = agents.find(a => a.port?.id === portId);
                  if (agent) {
                    handleAgentPress(agent.id);
                  }
                }} 
              />
            </View>
          )}
        </View>

        {/* Agents List */}
        <View style={styles.agentsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {language === 'en' ? 'All Agents' : 'Tous les Agents'}
          </Text>

          {agents.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="person.3"
                android_material_icon_name="groups"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {language === 'en' ? 'No validated agents' : 'Aucun agent validé'}
              </Text>
            </View>
          ) : (
            <View style={styles.agentsList}>
              {agents.map((agent, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[styles.agentCard, { backgroundColor: theme.colors.card }]}
                    onPress={() => handleAgentPress(agent.id)}
                  >
                    <View style={styles.agentCardHeader}>
                      <View style={[styles.agentIcon, { backgroundColor: colors.highlight }]}>
                        <IconSymbol
                          ios_icon_name="building.2.fill"
                          android_material_icon_name="business"
                          size={24}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.agentCardInfo}>
                        <Text style={[styles.agentCardName, { color: theme.colors.text }]}>
                          {agent.company_name}
                        </Text>
                        <View style={styles.agentCardLocation}>
                          <IconSymbol
                            ios_icon_name="location.fill"
                            android_material_icon_name="place"
                            size={14}
                            color={colors.textSecondary}
                          />
                          <Text style={[styles.agentCardLocationText, { color: colors.textSecondary }]}>
                            {agent.port?.name || 'N/A'}, {agent.port?.country || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <IconSymbol
                        ios_icon_name="chevron.right"
                        android_material_icon_name="chevron_right"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </View>

                    <View style={styles.agentCardActivities}>
                      {agent.activities.slice(0, 2).map((activity, actIndex) => (
                        <React.Fragment key={actIndex}>
                          <View style={[styles.activityBadge, { backgroundColor: colors.highlight }]}>
                            <Text style={[styles.activityBadgeText, { color: colors.primary }]}>
                              {activity}
                            </Text>
                          </View>
                        </React.Fragment>
                      ))}
                      {agent.activities.length > 2 && (
                        <Text style={[styles.moreActivities, { color: colors.textSecondary }]}>
                          +{agent.activities.length - 2}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Agent Details Modal */}
      <Modal
        visible={showAgentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAgentModal(false)}
      >
        {selectedAgent && (
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAgentModal(false)}
              >
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="close"
                  size={32}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {language === 'en' ? 'Agent Details' : 'Détails de l\'Agent'}
              </Text>
              <View style={{ width: 32 }} />
            </View>

            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentInner}>
              <View style={[styles.modalAgentIcon, { backgroundColor: colors.highlight }]}>
                <IconSymbol
                  ios_icon_name="building.2.fill"
                  android_material_icon_name="business"
                  size={48}
                  color={colors.primary}
                />
              </View>

              <Text style={[styles.modalAgentName, { color: theme.colors.text }]}>
                {selectedAgent.company_name}
              </Text>

              <View style={styles.modalInfoSection}>
                <View style={styles.modalInfoRow}>
                  <IconSymbol
                    ios_icon_name="location.fill"
                    android_material_icon_name="place"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.modalInfoText, { color: theme.colors.text }]}>
                    {selectedAgent.port?.name || 'N/A'}, {selectedAgent.port?.country || 'N/A'}
                  </Text>
                </View>

                {selectedAgent.email && (
                  <View style={styles.modalInfoRow}>
                    <IconSymbol
                      ios_icon_name="envelope.fill"
                      android_material_icon_name="email"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.modalInfoText, { color: theme.colors.text }]}>
                      {selectedAgent.email}
                    </Text>
                  </View>
                )}

                {selectedAgent.whatsapp && (
                  <View style={styles.modalInfoRow}>
                    <IconSymbol
                      ios_icon_name="phone.fill"
                      android_material_icon_name="phone"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.modalInfoText, { color: theme.colors.text }]}>
                      {selectedAgent.whatsapp}
                    </Text>
                  </View>
                )}

                {selectedAgent.years_experience && (
                  <View style={styles.modalInfoRow}>
                    <IconSymbol
                      ios_icon_name="clock.fill"
                      android_material_icon_name="schedule"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.modalInfoText, { color: theme.colors.text }]}>
                      {selectedAgent.years_experience} {language === 'en' ? 'years of experience' : 'ans d\'expérience'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.modalActivitiesSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  {language === 'en' ? 'Activities' : 'Activités'}
                </Text>
                <View style={styles.modalActivitiesList}>
                  {selectedAgent.activities.map((activity, actIndex) => (
                    <React.Fragment key={actIndex}>
                      <View style={[styles.modalActivityBadge, { backgroundColor: colors.highlight }]}>
                        <Text style={[styles.modalActivityBadgeText, { color: colors.primary }]}>
                          {activity}
                        </Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.viewDetailsButton, { backgroundColor: colors.primary }]}
                onPress={handleViewAgentDetails}
              >
                <Text style={styles.viewDetailsButtonText}>
                  {language === 'en' ? 'View Full Details' : 'Voir les Détails Complets'}
                </Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow_forward"
                  size={18}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
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
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mapSection: {
    padding: 20,
  },
  mapHeader: {
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 14,
  },
  emptyMapContainer: {
    height: 400,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyMapText: {
    fontSize: 16,
    textAlign: 'center',
  },
  mapContainer: {
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  agentsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
  },
  agentsList: {
    gap: 12,
  },
  agentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  agentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  agentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentCardInfo: {
    flex: 1,
  },
  agentCardName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  agentCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agentCardLocationText: {
    fontSize: 13,
  },
  agentCardActivities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  activityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreActivities: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalContentInner: {
    padding: 20,
    alignItems: 'center',
  },
  modalAgentIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAgentName: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalInfoSection: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalInfoText: {
    fontSize: 16,
    flex: 1,
  },
  modalActivitiesSection: {
    width: '100%',
    marginBottom: 32,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalActivitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalActivityBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  modalActivityBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  viewDetailsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
