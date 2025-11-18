
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { PageHeader } from "@/components/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";

interface Port {
  id: string;
  name: string;
  country: string;
  region: string;
  is_hub: boolean;
  services: string[];
}

type RegionFilter = 'all' | 'Africa' | 'Europe' | 'Asia' | 'Americas' | 'Middle East' | 'Oceania';

export default function PortCoverageScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('all');

  useEffect(() => {
    loadPorts();
  }, []);

  const loadPorts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .eq('is_active', true)
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
    const matchesRegion = selectedRegion === 'all' || port.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const regions: { id: RegionFilter; label: string }[] = [
    { id: 'all', label: t.portCoverage.allRegions },
    { id: 'Africa', label: t.regions.africa },
    { id: 'Europe', label: t.regions.europe },
    { id: 'Asia', label: t.regions.asia },
    { id: 'Americas', label: t.regions.americas },
    { id: 'Middle East', label: t.regions.middleEast },
    { id: 'Oceania', label: t.regions.oceania },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title={t.portCoverage.title} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <IconSymbol
            ios_icon_name="anchor.fill"
            android_material_icon_name="anchor"
            size={80}
            color={colors.primary}
          />
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            {t.portCoverage.subtitle}
          </Text>
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

        {/* Region Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.regionScroll}
          contentContainerStyle={styles.regionScrollContent}
        >
          {regions.map((region, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.regionButton,
                {
                  backgroundColor: selectedRegion === region.id ? colors.primary : theme.colors.card,
                  borderColor: selectedRegion === region.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedRegion(region.id)}
            >
              <Text
                style={[
                  styles.regionButtonText,
                  { color: selectedRegion === region.id ? '#ffffff' : theme.colors.text },
                ]}
              >
                {region.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              {t.portCoverage.loading}
            </Text>
          </View>
        ) : filteredPorts.length === 0 ? (
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
        ) : (
          <View style={styles.portsContainer}>
            {filteredPorts.map((port, index) => (
              <React.Fragment key={index}>
                <View style={[styles.portCard, { backgroundColor: theme.colors.card }]}>
                  {port.is_hub && (
                    <View style={[styles.hubBadge, { backgroundColor: colors.accent }]}>
                      <IconSymbol
                        ios_icon_name="star.fill"
                        android_material_icon_name="star"
                        size={12}
                        color="#ffffff"
                      />
                      <Text style={styles.hubBadgeText}>{t.portCoverage.hub}</Text>
                    </View>
                  )}

                  <Text style={[styles.portName, { color: theme.colors.text }]}>
                    {port.name}
                  </Text>

                  <View style={styles.portInfo}>
                    <IconSymbol
                      ios_icon_name="location.fill"
                      android_material_icon_name="location_on"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.portCountry, { color: colors.textSecondary }]}>
                      {port.country} • {port.region}
                    </Text>
                  </View>

                  {port.services && port.services.length > 0 && (
                    <View style={styles.servicesContainer}>
                      <Text style={[styles.servicesLabel, { color: theme.colors.text }]}>
                        {t.portCoverage.services}:
                      </Text>
                      <View style={styles.servicesList}>
                        {port.services.slice(0, 3).map((service, serviceIndex) => (
                          <View key={serviceIndex} style={[styles.serviceTag, { backgroundColor: colors.highlight }]}>
                            <Text style={[styles.serviceTagText, { color: colors.primary }]}>
                              {service}
                            </Text>
                          </View>
                        ))}
                        {port.services.length > 3 && (
                          <Text style={[styles.moreServices, { color: colors.textSecondary }]}>
                            +{port.services.length - 3}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.viewButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push(`/port-detail?id=${port.id}`)}
                  >
                    <Text style={styles.viewButtonText}>{t.portCoverage.viewDetails}</Text>
                    <IconSymbol
                      ios_icon_name="arrow.right"
                      android_material_icon_name="arrow_forward"
                      size={16}
                      color="#ffffff"
                    />
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        {/* CTA Section */}
        <View style={[styles.ctaSection, { backgroundColor: colors.highlight }]}>
          <Text style={[styles.ctaText, { color: theme.colors.text }]}>
            {t.portCoverage.ctaText}
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/become-agent')}
          >
            <Text style={styles.ctaButtonText}>{t.portCoverage.ctaButton}</Text>
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
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 26,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  regionScroll: {
    marginBottom: 24,
  },
  regionScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  regionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  regionButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  portsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  portCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  hubBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  hubBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  portName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    paddingRight: 60,
  },
  portInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  portCountry: {
    fontSize: 14,
  },
  servicesContainer: {
    marginBottom: 16,
  },
  servicesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  serviceTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreServices: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  viewButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  ctaSection: {
    marginHorizontal: 20,
    marginTop: 32,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
