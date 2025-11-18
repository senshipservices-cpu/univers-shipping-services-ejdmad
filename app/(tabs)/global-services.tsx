
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors, commonStyles } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";
import { Database } from "@/app/integrations/supabase/types";

type ServiceCategory = Database["public"]["Enums"]["service_category"];
type Service = Database["public"]["Tables"]["services_global"]["Row"];

interface CategoryFilter {
  id: string;
  label: string;
  value: ServiceCategory | "all";
}

export default function GlobalServicesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useLanguage();

  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories: CategoryFilter[] = [
    { id: "all", label: t.globalServices.allCategories, value: "all" },
    { id: "maritime_shipping", label: t.globalServices.maritimeShipping, value: "maritime_shipping" },
    { id: "logistics_port_handling", label: t.globalServices.logisticsPortHandling, value: "logistics_port_handling" },
    { id: "trade_consulting", label: t.globalServices.tradeConsulting, value: "trade_consulting" },
    { id: "digital_services", label: t.globalServices.digitalServices, value: "digital_services" },
  ];

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching services from Supabase...');
      
      const { data, error } = await supabase
        .from('services_global')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      console.log('Services fetched:', data?.length || 0);
      setServices(data || []);
    } catch (error) {
      console.error('Exception fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterServices = useCallback(() => {
    if (selectedCategory === "all") {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service => service.category === selectedCategory);
      setFilteredServices(filtered);
    }
  }, [selectedCategory, services]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    filterServices();
  }, [filterServices]);

  const getCategoryLabel = (category: ServiceCategory): string => {
    const categoryMap: Record<ServiceCategory, string> = {
      maritime_shipping: t.globalServices.maritimeShipping,
      logistics_port_handling: t.globalServices.logisticsPortHandling,
      trade_consulting: t.globalServices.tradeConsulting,
      digital_services: t.globalServices.digitalServices,
    };
    return categoryMap[category] || category;
  };

  const openServiceDetail = (service: Service) => {
    setSelectedService(service);
    setIsModalVisible(true);
  };

  const closeServiceDetail = () => {
    setIsModalVisible(false);
    setSelectedService(null);
  };

  const handleRequestOffer = () => {
    closeServiceDetail();
    console.log('Navigate to freight quote or contact page');
    // TODO: Navigate to freight_quote page when implemented
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
          {t.globalServices.title}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <IconSymbol
            ios_icon_name="globe"
            android_material_icon_name="public"
            size={64}
            color={colors.primary}
          />
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            {t.globalServices.subtitle}
          </Text>
        </View>

        <View style={styles.filtersSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {categories.map((category, index) => (
              <React.Fragment key={category.id}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    selectedCategory === category.value && styles.filterButtonActive,
                    { backgroundColor: selectedCategory === category.value ? colors.primary : theme.colors.card }
                  ]}
                  onPress={() => setSelectedCategory(category.value)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedCategory === category.value && styles.filterButtonTextActive,
                      { color: selectedCategory === category.value ? '#ffffff' : theme.colors.text }
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              {t.globalServices.loading}
            </Text>
          </View>
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle"
              android_material_icon_name="warning"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t.globalServices.noServices}
            </Text>
          </View>
        ) : (
          <View style={styles.servicesContainer}>
            {filteredServices.map((service, index) => (
              <React.Fragment key={service.id}>
                <TouchableOpacity
                  style={[styles.serviceCard, { backgroundColor: theme.colors.card }]}
                  onPress={() => openServiceDetail(service)}
                  activeOpacity={0.7}
                >
                  <View style={styles.serviceCardHeader}>
                    <Text style={[styles.serviceTitle, { color: theme.colors.text }]}>
                      {language === 'fr' ? service.name_fr : (service.name_en || service.name_fr)}
                    </Text>
                    {service.is_premium && (
                      <View style={[styles.premiumBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={styles.premiumBadgeText}>{t.globalServices.premium}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                    {language === 'fr' ? service.short_desc_fr : (service.short_desc_en || service.short_desc_fr)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.detailsButton, { borderColor: colors.primary }]}
                    onPress={() => openServiceDetail(service)}
                  >
                    <Text style={[styles.detailsButtonText, { color: colors.primary }]}>
                      {t.globalServices.details}
                    </Text>
                    <IconSymbol
                      ios_icon_name="arrow.right"
                      android_material_icon_name="arrow_forward"
                      size={16}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeServiceDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {selectedService && (language === 'fr' ? selectedService.name_fr : (selectedService.name_en || selectedService.name_fr))}
              </Text>
              <TouchableOpacity onPress={closeServiceDetail} style={styles.closeButton}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedService && (
                <React.Fragment>
                  <View style={styles.modalSection}>
                    <View style={styles.categoryBadgeContainer}>
                      <IconSymbol
                        ios_icon_name="tag"
                        android_material_icon_name="label"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>
                        {getCategoryLabel(selectedService.category)}
                      </Text>
                    </View>
                    {selectedService.is_premium && (
                      <View style={[styles.premiumBadge, { backgroundColor: colors.secondary }]}>
                        <Text style={styles.premiumBadgeText}>{t.globalServices.premium}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalDescription, { color: theme.colors.text }]}>
                      {language === 'fr' 
                        ? (selectedService.full_desc_fr || selectedService.short_desc_fr)
                        : (selectedService.full_desc_en || selectedService.short_desc_en || selectedService.full_desc_fr || selectedService.short_desc_fr)
                      }
                    </Text>
                  </View>
                </React.Fragment>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.requestOfferButton, { backgroundColor: colors.primary }]}
                onPress={handleRequestOffer}
              >
                <Text style={styles.requestOfferButtonText}>
                  {t.globalServices.requestOffer}
                </Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow_forward"
                  size={20}
                  color="#ffffff"
                />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 26,
  },
  filtersSection: {
    marginBottom: 24,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  servicesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  serviceCard: {
    padding: 20,
    borderRadius: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  premiumBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    paddingRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  categoryBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  requestOfferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  requestOfferButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
