
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { PageHeader } from "@/components/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";

interface Port {
  id: string;
  name: string;
  city: string | null;
  country: string;
  region: string;
  description_fr: string | null;
  description_en: string | null;
  is_hub: boolean;
  services_available: string[];
}

interface PortService {
  id: string;
  service: {
    id: string;
    name_fr: string;
    name_en: string;
    short_desc_fr: string;
    short_desc_en: string;
    slug: string;
    category: string;
    is_premium: boolean;
  };
  is_available: boolean;
  notes: string | null;
}

interface Agent {
  id: string;
  company_name: string;
  activities: string[];
  years_experience: number | null;
  logo: string | null;
  is_premium_listing: boolean;
  email: string | null;
  whatsapp: string | null;
  website: string | null;
}

export default function PortDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { port_id } = useLocalSearchParams<{ port_id: string }>();

  const [port, setPort] = useState<Port | null>(null);
  const [portServices, setPortServices] = useState<PortService[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPortDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Load port details
      const { data: portData, error: portError } = await supabase
        .from('ports')
        .select('*')
        .eq('id', port_id)
        .single();

      if (portError) {
        console.error('Error loading port:', portError);
        Alert.alert(t.common.error, t.portDetails.notFound);
        router.back();
        return;
      }

      setPort(portData);

      // Load services available in this port from port_services table
      const { data: servicesData, error: servicesError } = await supabase
        .from('port_services')
        .select(`
          id,
          is_available,
          notes,
          service:services_global (
            id,
            name_fr,
            name_en,
            short_desc_fr,
            short_desc_en,
            slug,
            category,
            is_premium
          )
        `)
        .eq('port', port_id)
        .eq('is_available', true)
        .order('service(name_en)', { ascending: true });

      if (servicesError) {
        console.error('Error loading services:', servicesError);
      } else {
        setPortServices(servicesData || []);
      }

      // Load premium agents in this port
      const { data: agentsData, error: agentsError } = await supabase
        .from('global_agents')
        .select('*')
        .eq('port', port_id)
        .eq('status', 'validated')
        .order('is_premium_listing', { ascending: false });

      if (agentsError) {
        console.error('Error loading agents:', agentsError);
      } else {
        setAgents(agentsData || []);
      }
    } catch (error) {
      console.error('Exception loading port details:', error);
    } finally {
      setLoading(false);
    }
  }, [port_id, router, t.common.error, t.portDetails.notFound]);

  useEffect(() => {
    if (port_id) {
      loadPortDetails();
    }
  }, [port_id, loadPortDetails]);

  const getServiceName = (service: PortService['service']) => {
    return language === 'en' && service.name_en ? service.name_en : service.name_fr;
  };

  const getServiceDescription = (service: PortService['service']) => {
    return language === 'en' && service.short_desc_en ? service.short_desc_en : service.short_desc_fr;
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, { fr: string; en: string }> = {
      maritime_shipping: { fr: 'Maritime & Shipping', en: 'Maritime & Shipping' },
      logistics_port_handling: { fr: 'Logistique & Manutention', en: 'Logistics & Port Handling' },
      trade_consulting: { fr: 'Commerce & Consulting', en: 'Trade & Consulting' },
      digital_services: { fr: 'Services Digitaux', en: 'Digital Services' },
    };

    const label = categoryLabels[category];
    return label ? (language === 'en' ? label.en : label.fr) : category;
  };

  const getPortDescription = () => {
    if (!port) return '';
    return language === 'en' && port.description_en ? port.description_en : port.description_fr || '';
  };

  const getActivityLabel = (activity: string) => {
    const activityLabels: Record<string, { fr: string; en: string }> = {
      consignation: { fr: 'Consignation', en: 'Ship Agency' },
      customs: { fr: 'Douanes', en: 'Customs' },
      freight_forwarding: { fr: 'Transit', en: 'Freight Forwarding' },
      ship_supply: { fr: 'Avitaillement', en: 'Ship Supply' },
      warehousing: { fr: 'Entreposage', en: 'Warehousing' },
      trucking: { fr: 'Transport routier', en: 'Trucking' },
      consulting: { fr: 'Consulting', en: 'Consulting' },
    };

    const label = activityLabels[activity];
    return label ? (language === 'en' ? label.en : label.fr) : activity;
  };

  const handleRequestQuote = () => {
    router.push(`/freight-quote?port_id=${port_id}`);
  };

  const handleContactAgent = (agent: Agent) => {
    if (agent.email) {
      Alert.alert(
        t.portDetails.contactAgent,
        `Email: ${agent.email}${agent.whatsapp ? `\nWhatsApp: ${agent.whatsapp}` : ''}${agent.website ? `\nWebsite: ${agent.website}` : ''}`,
        [
          { text: t.common.close, style: 'cancel' },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <PageHeader title={t.portDetails.loading} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t.portDetails.loading}
          </Text>
        </View>
      </View>
    );
  }

  if (!port) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <PageHeader title={t.portDetails.notFound} />
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="error"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {t.portDetails.notFound}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title={port.name} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Port Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerTitleRow}>
            <IconSymbol
              ios_icon_name="anchor.fill"
              android_material_icon_name="anchor"
              size={32}
              color={colors.primary}
            />
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.portName, { color: theme.colors.text }]}>
                {port.name}
              </Text>
              <Text style={[styles.portLocation, { color: colors.textSecondary }]}>
                {port.city ? `${port.city}, ${port.country}` : port.country}
              </Text>
            </View>
          </View>

          {port.is_hub && (
            <View style={[styles.hubBadge, { backgroundColor: colors.accent }]}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={16}
                color="#ffffff"
              />
              <Text style={styles.hubBadgeText}>{t.portCoverage.hub}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {getPortDescription() && (
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t.portDetails.description}
            </Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              {getPortDescription()}
            </Text>
          </View>
        )}

        {/* Available Services */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.portDetails.availableServices}
          </Text>

          {portServices.length === 0 ? (
            <View style={styles.emptyServicesContainer}>
              <Text style={[styles.emptyServicesText, { color: colors.textSecondary }]}>
                {language === 'fr' 
                  ? 'Les services pour ce port seront ajoutés prochainement.' 
                  : 'Services for this port will be added soon.'}
              </Text>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {portServices.map((portService, index) => (
                <React.Fragment key={index}>
                  <View style={[styles.serviceCard, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.serviceHeader}>
                      <IconSymbol
                        ios_icon_name="cube.box.fill"
                        android_material_icon_name="inventory_2"
                        size={24}
                        color={colors.primary}
                      />
                      {portService.service.is_premium && (
                        <View style={[styles.premiumBadge, { backgroundColor: colors.accent }]}>
                          <Text style={styles.premiumBadgeText}>{t.portCoverage.premium}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.serviceName, { color: theme.colors.text }]}>
                      {getServiceName(portService.service)}
                    </Text>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.highlight }]}>
                      <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>
                        {getCategoryLabel(portService.service.category)}
                      </Text>
                    </View>
                    <Text style={[styles.serviceDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                      {getServiceDescription(portService.service)}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Premium Agents */}
        {agents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t.portDetails.premiumAgents}
            </Text>

            <View style={styles.agentsContainer}>
              {agents.map((agent, index) => (
                <React.Fragment key={index}>
                  <View style={[styles.agentCard, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.agentHeader}>
                      <View style={[styles.agentLogo, { backgroundColor: colors.highlight }]}>
                        <IconSymbol
                          ios_icon_name="building.2.fill"
                          android_material_icon_name="business"
                          size={32}
                          color={colors.primary}
                        />
                      </View>
                      {agent.is_premium_listing && (
                        <View style={[styles.premiumAgentBadge, { backgroundColor: colors.accent }]}>
                          <IconSymbol
                            ios_icon_name="star.fill"
                            android_material_icon_name="star"
                            size={12}
                            color="#ffffff"
                          />
                          <Text style={styles.premiumAgentBadgeText}>{t.portCoverage.premium}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={[styles.agentName, { color: theme.colors.text }]}>
                      {agent.company_name}
                    </Text>

                    <View style={styles.agentActivities}>
                      {agent.activities.slice(0, 3).map((activity, actIndex) => (
                        <React.Fragment key={actIndex}>
                          <View style={[styles.activityTag, { backgroundColor: colors.highlight }]}>
                            <Text style={[styles.activityTagText, { color: colors.primary }]}>
                              {getActivityLabel(activity)}
                            </Text>
                          </View>
                        </React.Fragment>
                      ))}
                    </View>

                    {agent.years_experience && (
                      <Text style={[styles.agentExperience, { color: colors.textSecondary }]}>
                        {agent.years_experience} {t.portCoverage.years} {t.portCoverage.experience.toLowerCase()}
                      </Text>
                    )}

                    <TouchableOpacity
                      style={[styles.contactAgentButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleContactAgent(agent)}
                    >
                      <Text style={styles.contactAgentButtonText}>
                        {t.portDetails.contactAgent}
                      </Text>
                      <IconSymbol
                        ios_icon_name="envelope.fill"
                        android_material_icon_name="email"
                        size={16}
                        color="#ffffff"
                      />
                    </TouchableOpacity>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Request Service Button */}
        <View style={styles.requestServiceSection}>
          <TouchableOpacity
            style={[styles.requestServiceButton, { backgroundColor: colors.primary }]}
            onPress={handleRequestQuote}
          >
            <IconSymbol
              ios_icon_name="doc.text.fill"
              android_material_icon_name="description"
              size={20}
              color="#ffffff"
            />
            <Text style={styles.requestServiceButtonText}>
              {language === 'fr' 
                ? 'Demander un service dans ce port' 
                : 'Request a service in this port'}
            </Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow_forward"
              size={18}
              color="#ffffff"
            />
          </TouchableOpacity>
          <Text style={[styles.requestServiceHint, { color: colors.textSecondary }]}>
            {language === 'fr'
              ? 'Remplissez une demande de devis pour ce port'
              : 'Fill out a quote request for this port'}
          </Text>
        </View>

        {/* Final CTA */}
        <View style={[styles.finalCtaSection, { backgroundColor: colors.primary }]}>
          <Text style={styles.finalCtaTitle}>
            {t.portDetails.finalCta}
          </Text>
          <TouchableOpacity
            style={[styles.finalCtaButton, { backgroundColor: '#ffffff' }]}
            onPress={handleRequestQuote}
          >
            <Text style={[styles.finalCtaButtonText, { color: colors.primary }]}>
              {t.portDetails.requestQuoteForPort}
            </Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow_forward"
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  portName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  portLocation: {
    fontSize: 16,
  },
  hubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  hubBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
  },
  emptyServicesContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyServicesText: {
    fontSize: 15,
    textAlign: 'center',
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  premiumBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  agentsContainer: {
    gap: 16,
  },
  agentCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  agentLogo: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumAgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  premiumAgentBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  agentName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  agentActivities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  activityTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activityTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  agentExperience: {
    fontSize: 14,
    marginBottom: 16,
  },
  contactAgentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactAgentButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  requestServiceSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  requestServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    width: '100%',
    marginBottom: 8,
  },
  requestServiceButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  requestServiceHint: {
    fontSize: 13,
    textAlign: 'center',
  },
  finalCtaSection: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 24,
  },
  finalCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  finalCtaButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
