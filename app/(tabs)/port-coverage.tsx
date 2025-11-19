
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, ActivityIndicator, Alert, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { PageHeader } from "@/components/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";
import { PortsMap } from "@/components/PortsMap";

interface Port {
  id: string;
  name: string;
  city: string | null;
  country: string;
  region: string;
  is_hub: boolean;
  services_available: string[];
  description_fr: string | null;
  description_en: string | null;
  lat: number | null;
  lng: number | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PortCoverageScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useLanguage();
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPorts();
  }, []);

  const loadPorts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .eq('status', 'actif')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading ports:', error);
        Alert.alert('Erreur', 'Impossible de charger les ports.');
      } else {
        setPorts(data || []);
        console.log('Ports loaded:', data?.length);
      }
    } catch (error) {
      console.error('Exception loading ports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPorts = ports.filter(port => {
    const matchesSearch = port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         port.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Group ports by region
  const portsByRegion = {
    africa: filteredPorts.filter(p => p.region === 'Afrique'),
    europe: filteredPorts.filter(p => p.region === 'Europe'),
    asia: filteredPorts.filter(p => p.region === 'Asie' || p.region === 'Moyen-Orient'),
    americas: filteredPorts.filter(p => p.region === 'Amériques'),
  };

  const getRegionTitle = (region: string) => {
    switch (region) {
      case 'africa':
        return language === 'en' ? `Africa (${portsByRegion.africa.length}+ ports)` : `Afrique (${portsByRegion.africa.length}+ ports)`;
      case 'europe':
        return language === 'en' ? `Europe (${portsByRegion.europe.length}+ ports)` : `Europe (${portsByRegion.europe.length}+ ports)`;
      case 'asia':
        return language === 'en' ? `Asia & Middle East (${portsByRegion.asia.length}+ ports)` : `Asie & Moyen-Orient (${portsByRegion.asia.length}+ ports)`;
      case 'americas':
        return language === 'en' ? `Americas (${portsByRegion.americas.length}+ ports)` : `Amériques (${portsByRegion.americas.length}+ ports)`;
      default:
        return '';
    }
  };

  const getRegionIcon = (region: string) => {
    switch (region) {
      case 'africa':
        return '🌍';
      case 'europe':
        return '🇪🇺';
      case 'asia':
        return '🌏';
      case 'americas':
        return '🌎';
      default:
        return '🌐';
    }
  };

  const handlePortPress = (portId: string) => {
    router.push(`/port-details?port_id=${portId}`);
  };

  // Get ports with valid coordinates for the map
  const portsWithCoordinates = ports.filter(p => p.lat !== null && p.lng !== null).map(p => ({
    id: p.id,
    name: p.name,
    lat: p.lat!,
    lng: p.lng!,
    is_hub: p.is_hub,
    country: p.country,
  }));

  const renderPortsByRegion = (region: 'africa' | 'europe' | 'asia' | 'americas') => {
    const regionPorts = portsByRegion[region];
    
    if (regionPorts.length === 0) {
      return null;
    }

    return (
      <View key={region} style={styles.regionSection}>
        <View style={styles.regionHeader}>
          <Text style={styles.regionIcon}>{getRegionIcon(region)}</Text>
          <Text style={[styles.regionTitle, { color: theme.colors.text }]}>
            {getRegionTitle(region)}
          </Text>
        </View>

        <View style={styles.portsGrid}>
          {regionPorts.map((port, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[styles.portMiniCard, { backgroundColor: theme.colors.card }]}
                onPress={() => router.push(`/port-details?port_id=${port.id}`)}
              >
                {port.is_hub && (
                  <View style={[styles.hubBadgeMini, { backgroundColor: colors.accent }]}>
                    <IconSymbol
                      ios_icon_name="star.fill"
                      android_material_icon_name="star"
                      size={10}
                      color="#ffffff"
                    />
                  </View>
                )}
                <Text style={[styles.portMiniName, { color: theme.colors.text }]} numberOfLines={1}>
                  {port.name}
                </Text>
                <Text style={[styles.portMiniCountry, { color: colors.textSecondary }]} numberOfLines={1}>
                  {port.country}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title={t.portCoverage.title} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            {language === 'en' ? '100+ Ports Across 5 Continents' : '100+ Ports sur 5 Continents'}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            {language === 'en' 
              ? 'Strategic presence across major global maritime hubs.' 
              : 'Une présence stratégique dans les principaux hubs maritimes mondiaux.'}
          </Text>
        </View>

        {/* Interactive Map Section */}
        <View style={styles.mapSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {language === 'en' ? 'Global Port Network' : 'Réseau Portuaire Mondial'}
          </Text>
          
          {loading ? (
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.highlight }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.mapPlaceholderText, { color: colors.textSecondary }]}>
                {t.portCoverage.loading}
              </Text>
            </View>
          ) : (
            <>
              <PortsMap ports={portsWithCoordinates} onPortPress={handlePortPress} />
              
              <View style={styles.mapLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'Active Port' : 'Port Actif'}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                    {language === 'en' ? 'Hub Port' : 'Port Hub'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
            <IconSymbol
              ios_icon_name="magnifyingglass"
              android_material_icon_name="search"
              size={20}
              color={colors.textSecondary}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder={t.portCoverage.searchPlaceholder}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              {t.portCoverage.loading}
            </Text>
          </View>
        ) : (
          <>
            {/* Ports by Region */}
            <View style={styles.regionsContainer}>
              {renderPortsByRegion('africa')}
              {renderPortsByRegion('europe')}
              {renderPortsByRegion('asia')}
              {renderPortsByRegion('americas')}
            </View>

            {filteredPorts.length === 0 && (
              <View style={styles.emptyContainer}>
                <IconSymbol
                  ios_icon_name="tray"
                  android_material_icon_name="inbox"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                  {t.portCoverage.noPorts}
                </Text>
              </View>
            )}
          </>
        )}

        {/* CTA: Port Not Listed - Dark Blue Block */}
        <View style={[styles.portNotListedSection, { backgroundColor: '#1e3a5f' }]}>
          <Text style={styles.portNotListedTitle}>
            {t.portCoverage.portNotListedTitle}
          </Text>
          <Text style={styles.portNotListedText}>
            {t.portCoverage.portNotListedText}
          </Text>
          <TouchableOpacity
            style={[styles.portNotListedButton, { backgroundColor: '#ffffff' }]}
            onPress={() => router.push('/contact?subject=port_request')}
          >
            <Text style={[styles.portNotListedButtonText, { color: '#1e3a5f' }]}>
              {t.portCoverage.portNotListedButton}
            </Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow_forward"
              size={18}
              color="#1e3a5f"
            />
          </TouchableOpacity>
        </View>

        {/* Agents Premium / Global Network Section */}
        <View style={[styles.premiumSection, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.premiumTitle, { color: theme.colors.text }]}>
            {language === 'en' 
              ? 'Premium Agents & Global Network' 
              : 'Agents Premium & Réseau Global'}
          </Text>
          <Text style={[styles.premiumSubtitle, { color: colors.textSecondary }]}>
            {language === 'en'
              ? 'Join our network of certified maritime agents and logistics partners across the world.'
              : 'Rejoignez notre réseau d\'agents maritimes certifiés et de partenaires logistiques à travers le monde.'}
          </Text>

          <View style={styles.premiumFeatures}>
            <View style={styles.premiumFeature}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.premiumFeatureText, { color: theme.colors.text }]}>
                {language === 'en' 
                  ? 'Verified & certified agents' 
                  : 'Agents vérifiés et certifiés'}
              </Text>
            </View>
            <View style={styles.premiumFeature}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.premiumFeatureText, { color: theme.colors.text }]}>
                {language === 'en' 
                  ? 'Global visibility on our platform' 
                  : 'Visibilité mondiale sur notre plateforme'}
              </Text>
            </View>
            <View style={styles.premiumFeature}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.premiumFeatureText, { color: theme.colors.text }]}>
                {language === 'en' 
                  ? 'Priority B2B client referrals' 
                  : 'Recommandations clients B2B prioritaires'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.premiumButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/become-agent')}
          >
            <Text style={styles.premiumButtonText}>
              {language === 'en' ? 'Become a Premium Agent' : 'Devenir Agent Premium'}
            </Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow_forward"
              size={18}
              color="#ffffff"
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
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  mapSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 400,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  mapPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  regionsContainer: {
    paddingHorizontal: 20,
    gap: 32,
  },
  regionSection: {
    marginBottom: 8,
  },
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  regionIcon: {
    fontSize: 32,
  },
  regionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  portsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  portMiniCard: {
    width: (SCREEN_WIDTH - 64) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  hubBadgeMini: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portMiniName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  portMiniCountry: {
    fontSize: 13,
  },
  portNotListedSection: {
    marginHorizontal: 20,
    marginTop: 32,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  portNotListedTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 16,
  },
  portNotListedText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 24,
    lineHeight: 24,
    opacity: 0.9,
  },
  portNotListedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  portNotListedButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  premiumSection: {
    marginHorizontal: 20,
    marginTop: 32,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  premiumSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  premiumFeatures: {
    gap: 16,
    marginBottom: 24,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumFeatureText: {
    fontSize: 15,
    flex: 1,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
