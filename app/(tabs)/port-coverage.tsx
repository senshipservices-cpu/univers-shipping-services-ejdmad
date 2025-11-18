
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform, Linking } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";
import type { Tables } from "@/app/integrations/supabase/types";

type Port = Tables<"ports">;
type GlobalAgent = Tables<"global_agents">;

type RegionFilter = "Tous" | "Afrique" | "Europe" | "Asie" | "Amériques" | "Moyen-Orient" | "Océanie";

export default function PortCoverageScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>("Tous");
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [portAgents, setPortAgents] = useState<GlobalAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const regions: RegionFilter[] = ["Tous", "Afrique", "Europe", "Asie", "Amériques", "Moyen-Orient", "Océanie"];

  const fetchPorts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching ports for region:', selectedRegion);
      
      let query = supabase
        .from('ports')
        .select('*')
        .eq('status', 'actif')
        .order('name', { ascending: true });

      if (selectedRegion !== "Tous") {
        query = query.eq('region', selectedRegion);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching ports:', error);
        return;
      }

      console.log('Fetched ports:', data?.length || 0);
      setPorts(data || []);
    } catch (error) {
      console.error('Error in fetchPorts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    fetchPorts();
  }, [selectedRegion]);

  const fetchPortAgents = async (portId: string) => {
    try {
      setLoadingAgents(true);
      console.log('Fetching agents for port:', portId);
      
      const { data, error } = await supabase
        .from('global_agents')
        .select('*')
        .eq('port', portId)
        .eq('status', 'validated')
        .order('is_premium_listing', { ascending: false });

      if (error) {
        console.error('Error fetching agents:', error);
        return;
      }

      console.log('Fetched agents:', data?.length || 0);
      setPortAgents(data || []);
    } catch (error) {
      console.error('Error in fetchPortAgents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handlePortPress = (port: Port) => {
    setSelectedPort(port);
    fetchPortAgents(port.id);
  };

  const handleCloseModal = () => {
    setSelectedPort(null);
    setPortAgents([]);
  };

  const handleContactWhatsApp = (phone: string) => {
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
    Linking.openURL(url).catch(err => console.error('Error opening WhatsApp:', err));
  };

  const handleContactEmail = (email: string) => {
    const url = `mailto:${email}`;
    Linking.openURL(url).catch(err => console.error('Error opening email:', err));
  };

  const translateServiceName = (service: string): string => {
    const serviceTranslations: Record<string, string> = {
      consignation: 'Consignation',
      chartering: 'Affrètement',
      customs: 'Douane',
      logistics: 'Logistique',
      ship_supply: 'Avitaillement',
      crew_support: 'Support équipage',
      warehousing: 'Entreposage',
      door_to_door: 'Porte à porte',
    };
    return serviceTranslations[service] || service;
  };

  const translateActivityName = (activity: string): string => {
    const activityTranslations: Record<string, string> = {
      consignation: 'Consignation',
      customs: 'Douane',
      freight_forwarding: 'Transit',
      ship_supply: 'Avitaillement',
      warehousing: 'Entreposage',
      trucking: 'Transport routier',
      consulting: 'Consulting',
    };
    return activityTranslations[activity] || activity;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t.portCoverage.title}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.subtitleContainer}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t.portCoverage.subtitle}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
      >
        {regions.map((region, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedRegion === region && { backgroundColor: colors.primary },
              ]}
              onPress={() => setSelectedRegion(region)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedRegion === region
                    ? { color: '#ffffff', fontWeight: '700' }
                    : { color: colors.text },
                ]}
              >
                {region === "Tous" ? t.portCoverage.allRegions : region}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t.portCoverage.loading}
            </Text>
          </View>
        ) : ports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle"
              android_material_icon_name="warning"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t.portCoverage.noPorts}
            </Text>
          </View>
        ) : (
          <View style={styles.portsContainer}>
            {ports.map((port, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[styles.portCard, { backgroundColor: theme.colors.card }]}
                  onPress={() => handlePortPress(port)}
                >
                  <View style={styles.portHeader}>
                    <View style={styles.portIconContainer}>
                      <IconSymbol
                        ios_icon_name="anchor"
                        android_material_icon_name="anchor"
                        size={28}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.portMainInfo}>
                      <Text style={[styles.portName, { color: theme.colors.text }]}>
                        {port.name}
                      </Text>
                      <Text style={styles.portLocation}>
                        {port.city && port.country ? `${port.city}, ${port.country}` : port.country || port.city || ''}
                      </Text>
                    </View>
                    {port.is_hub && (
                      <View style={styles.hubBadge}>
                        <Text style={styles.hubText}>{t.portCoverage.hub}</Text>
                      </View>
                    )}
                  </View>

                  {port.services_available && port.services_available.length > 0 && (
                    <View style={styles.servicesContainer}>
                      {port.services_available.slice(0, 4).map((service, serviceIndex) => (
                        <React.Fragment key={serviceIndex}>
                          <View style={styles.serviceBadge}>
                            <Text style={styles.serviceText}>
                              {translateServiceName(service)}
                            </Text>
                          </View>
                        </React.Fragment>
                      ))}
                    </View>
                  )}

                  <View style={styles.viewDetailsButton}>
                    <Text style={styles.viewDetailsText}>{t.portCoverage.viewDetails}</Text>
                    <IconSymbol
                      ios_icon_name="chevron.right"
                      android_material_icon_name="chevron_right"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        )}

        <View style={styles.ctaContainer}>
          <Text style={[styles.ctaText, { color: theme.colors.text }]}>
            {t.portCoverage.ctaText}
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/become-agent')}
          >
            <Text style={styles.ctaButtonText}>{t.portCoverage.ctaButton}</Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow_forward"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={selectedPort !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, Platform.OS === 'android' && { paddingTop: 48 }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={28}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {selectedPort?.name}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {selectedPort && (
              <React.Fragment>
                <View style={styles.modalSection}>
                  <View style={styles.portDetailHeader}>
                    <IconSymbol
                      ios_icon_name="location.fill"
                      android_material_icon_name="location_on"
                      size={24}
                      color={colors.primary}
                    />
                    <View style={styles.portDetailInfo}>
                      <Text style={[styles.portDetailLocation, { color: theme.colors.text }]}>
                        {selectedPort.city && selectedPort.country
                          ? `${selectedPort.city}, ${selectedPort.country}`
                          : selectedPort.country || selectedPort.city || ''}
                      </Text>
                      <Text style={styles.portDetailRegion}>
                        {selectedPort.region}
                      </Text>
                    </View>
                    {selectedPort.is_hub && (
                      <View style={styles.hubBadgeLarge}>
                        <Text style={styles.hubTextLarge}>{t.portCoverage.hub}</Text>
                      </View>
                    )}
                  </View>

                  {selectedPort.description_fr && (
                    <Text style={[styles.portDescription, { color: colors.text }]}>
                      {selectedPort.description_fr}
                    </Text>
                  )}
                </View>

                {selectedPort.services_available && selectedPort.services_available.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      {t.portCoverage.services}
                    </Text>
                    <View style={styles.servicesGrid}>
                      {selectedPort.services_available.map((service, serviceIndex) => (
                        <React.Fragment key={serviceIndex}>
                          <View style={[styles.serviceCard, { backgroundColor: theme.colors.card }]}>
                            <IconSymbol
                              ios_icon_name="checkmark.circle.fill"
                              android_material_icon_name="check_circle"
                              size={20}
                              color={colors.success}
                            />
                            <Text style={[styles.serviceCardText, { color: theme.colors.text }]}>
                              {translateServiceName(service)}
                            </Text>
                          </View>
                        </React.Fragment>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.modalSection}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {t.portCoverage.agentsInPort}
                  </Text>

                  {loadingAgents ? (
                    <View style={styles.loadingContainer}>
                      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        {t.common.loading}
                      </Text>
                    </View>
                  ) : portAgents.length === 0 ? (
                    <View style={styles.emptyAgentsContainer}>
                      <Text style={[styles.emptyAgentsText, { color: colors.textSecondary }]}>
                        {t.portCoverage.noAgents}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.agentsContainer}>
                      {portAgents.map((agent, agentIndex) => (
                        <React.Fragment key={agentIndex}>
                          <View style={[styles.agentCard, { backgroundColor: theme.colors.card }]}>
                            <View style={styles.agentHeader}>
                              <View style={styles.agentMainInfo}>
                                <Text style={[styles.agentName, { color: theme.colors.text }]}>
                                  {agent.company_name}
                                </Text>
                                {agent.is_premium_listing && (
                                  <View style={styles.premiumBadge}>
                                    <IconSymbol
                                      ios_icon_name="star.fill"
                                      android_material_icon_name="star"
                                      size={12}
                                      color="#ffffff"
                                    />
                                    <Text style={styles.premiumText}>{t.portCoverage.premium}</Text>
                                  </View>
                                )}
                              </View>
                            </View>

                            {agent.activities && agent.activities.length > 0 && (
                              <View style={styles.agentActivities}>
                                <Text style={[styles.agentLabel, { color: colors.textSecondary }]}>
                                  {t.portCoverage.activities}:
                                </Text>
                                <View style={styles.activitiesContainer}>
                                  {agent.activities.map((activity, activityIndex) => (
                                    <React.Fragment key={activityIndex}>
                                      <View style={styles.activityBadge}>
                                        <Text style={styles.activityText}>
                                          {translateActivityName(activity)}
                                        </Text>
                                      </View>
                                    </React.Fragment>
                                  ))}
                                </View>
                              </View>
                            )}

                            {agent.years_experience && (
                              <View style={styles.agentExperience}>
                                <IconSymbol
                                  ios_icon_name="briefcase.fill"
                                  android_material_icon_name="work"
                                  size={16}
                                  color={colors.textSecondary}
                                />
                                <Text style={[styles.experienceText, { color: colors.textSecondary }]}>
                                  {agent.years_experience} {t.portCoverage.years} {t.portCoverage.experience.toLowerCase()}
                                </Text>
                              </View>
                            )}

                            <View style={styles.agentContact}>
                              {agent.whatsapp && (
                                <TouchableOpacity
                                  style={styles.contactButton}
                                  onPress={() => handleContactWhatsApp(agent.whatsapp!)}
                                >
                                  <IconSymbol
                                    ios_icon_name="phone.fill"
                                    android_material_icon_name="phone"
                                    size={18}
                                    color="#ffffff"
                                  />
                                  <Text style={styles.contactButtonText}>WhatsApp</Text>
                                </TouchableOpacity>
                              )}
                              {agent.email && (
                                <TouchableOpacity
                                  style={[styles.contactButton, styles.contactButtonSecondary]}
                                  onPress={() => handleContactEmail(agent.email!)}
                                >
                                  <IconSymbol
                                    ios_icon_name="envelope.fill"
                                    android_material_icon_name="email"
                                    size={18}
                                    color={colors.primary}
                                  />
                                  <Text style={[styles.contactButtonText, { color: colors.primary }]}>
                                    Email
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </React.Fragment>
                      ))}
                    </View>
                  )}
                </View>
              </React.Fragment>
            )}
          </ScrollView>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  filterScrollView: {
    maxHeight: 60,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  portsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  portCard: {
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  portHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  portIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portMainInfo: {
    flex: 1,
  },
  portName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  portLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  hubBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.warning,
    borderRadius: 12,
  },
  hubText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  serviceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  ctaContainer: {
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 20,
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(3, 169, 244, 0.3)',
    elevation: 3,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  portDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  portDetailInfo: {
    flex: 1,
  },
  portDetailLocation: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  portDetailRegion: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  hubBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.warning,
    borderRadius: 12,
  },
  hubTextLarge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  portDescription: {
    fontSize: 15,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceCardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  agentsContainer: {
    gap: 16,
  },
  agentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  agentHeader: {
    marginBottom: 12,
  },
  agentMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  agentName: {
    fontSize: 17,
    fontWeight: '700',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.warning,
    borderRadius: 10,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  agentActivities: {
    marginBottom: 12,
  },
  agentLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  activitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  activityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  agentExperience: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  experienceText: {
    fontSize: 13,
  },
  agentContact: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.success,
    paddingVertical: 10,
    borderRadius: 10,
  },
  contactButtonSecondary: {
    backgroundColor: colors.highlight,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyAgentsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyAgentsText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
