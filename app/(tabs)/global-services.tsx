
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { PageHeader } from "@/components/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";

interface Service {
  id: string;
  slug: string;
  category: string;
  name_fr: string;
  name_en: string | null;
  short_desc_fr: string;
  short_desc_en: string | null;
  full_desc_fr: string | null;
  full_desc_en: string | null;
  is_premium: boolean;
  is_active: boolean;
  menu_group: string | null;
  cta_type: string | null;
}

type CategoryFilter = 'all' | 'Maritime & Shipping Services' | 'Logistics & Port Handling' | 'Trade & Consulting';

export default function GlobalServicesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const subscriptionAccess = useSubscriptionAccess();
  const params = useLocalSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  const serviceIdParam = params.service_id as string | undefined;
  const menuGroupParam = params.menu_group as string | undefined;

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    // Apply filter from navigation params if provided
    if (menuGroupParam) {
      const validCategories: CategoryFilter[] = [
        'Maritime & Shipping Services',
        'Logistics & Port Handling',
        'Trade & Consulting'
      ];
      
      if (validCategories.includes(menuGroupParam as CategoryFilter)) {
        setSelectedCategory(menuGroupParam as CategoryFilter);
        console.log('Applied menu_group filter:', menuGroupParam);
      }
    }
  }, [menuGroupParam]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services_global')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error loading services:', error);
        Alert.alert('Erreur', 'Impossible de charger les services.');
      } else {
        setServices(data || []);
        console.log('Services loaded:', data?.length);
      }
    } catch (error) {
      console.error('Exception loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAction = (service: Service) => {
    console.log('Service action:', service.cta_type, 'Service:', service.slug);

    switch (service.cta_type) {
      case 'quote':
        // Redirect to freight quote with service_id
        router.push(`/freight-quote?service_id=${service.id}`);
        break;

      case 'pricing':
        // Redirect to pricing page
        router.push('/pricing');
        break;

      case 'expert':
        // Redirect to contact page with pre-filled subject
        router.push(`/contact?subject=Consulting – ${service.name_fr}`);
        break;

      case 'portal':
        // Check if user has digital portal access
        if (!user) {
          Alert.alert(
            'Connexion requise',
            'Vous devez être connecté pour accéder au portail digital.',
            [
              {
                text: 'Se connecter',
                onPress: () => router.push('/client-space'),
              },
              {
                text: 'Annuler',
                style: 'cancel',
              },
            ]
          );
          return;
        }

        if (!subscriptionAccess.hasDigitalPortalAccess) {
          Alert.alert(
            'Abonnement requis',
            'L\'accès au portail digital nécessite un abonnement Premium Tracking ou Enterprise Logistics.\n\nVoulez-vous découvrir nos plans ?',
            [
              {
                text: 'Voir les plans',
                onPress: () => router.push('/pricing'),
              },
              {
                text: 'Annuler',
                style: 'cancel',
              },
            ]
          );
          return;
        }

        // User has access - redirect to client dashboard (digital portal)
        router.push('/client-dashboard');
        break;

      default:
        console.log('Unknown CTA type:', service.cta_type);
        Alert.alert('Information', 'Cette fonctionnalité sera bientôt disponible.');
    }
  };

  const getButtonText = (ctaType: string | null) => {
    switch (ctaType) {
      case 'quote':
        return t.globalServices.requestQuote;
      case 'pricing':
        return t.globalServices.viewPricing;
      case 'expert':
        return t.globalServices.consultExpert;
      case 'portal':
        return t.globalServices.accessPortal;
      default:
        return t.globalServices.details;
    }
  };

  const getButtonIcon = (ctaType: string | null) => {
    switch (ctaType) {
      case 'quote':
        return { ios: 'doc.text', android: 'description' };
      case 'pricing':
        return { ios: 'dollarsign.circle', android: 'payments' };
      case 'expert':
        return { ios: 'person.circle', android: 'person' };
      case 'portal':
        return { ios: 'square.grid.2x2', android: 'dashboard' };
      default:
        return { ios: 'arrow.right', android: 'arrow_forward' };
    }
  };

  const extractBulletPoints = (fullDesc: string | null): string[] => {
    if (!fullDesc) return [];
    
    const lines = fullDesc.split('\n').filter(line => line.trim());
    return lines.slice(0, 4);
  };

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.menu_group === selectedCategory);

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: t.globalServices.allCategories },
    { id: 'Maritime & Shipping Services', label: t.globalServices.maritimeShipping },
    { id: 'Logistics & Port Handling', label: t.globalServices.logisticsPortHandling },
    { id: 'Trade & Consulting', label: t.globalServices.tradeConsulting },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title={t.globalServices.title} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <IconSymbol
            ios_icon_name="globe"
            android_material_icon_name="public"
            size={80}
            color={colors.primary}
          />
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            {t.globalServices.heroTitle}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            {t.globalServices.subtitle}
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                { 
                  backgroundColor: selectedCategory === category.id ? colors.primary : theme.colors.card,
                  borderColor: selectedCategory === category.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  { color: selectedCategory === category.id ? '#ffffff' : theme.colors.text },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              {t.globalServices.loading}
            </Text>
          </View>
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="tray"
              android_material_icon_name="inbox"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              {t.globalServices.noServices}
            </Text>
          </View>
        ) : (
          <View style={styles.servicesContainer}>
            {filteredServices.map((service, index) => {
              const bulletPoints = extractBulletPoints(service.full_desc_fr);
              const buttonIcon = getButtonIcon(service.cta_type);
              
              return (
                <React.Fragment key={index}>
                  <View
                    style={[
                      styles.serviceCard,
                      { backgroundColor: theme.colors.card, borderColor: colors.border },
                    ]}
                  >
                    {service.is_premium && (
                      <View style={[styles.premiumBadge, { backgroundColor: colors.accent }]}>
                        <IconSymbol
                          ios_icon_name="star.fill"
                          android_material_icon_name="star"
                          size={12}
                          color="#ffffff"
                        />
                        <Text style={styles.premiumBadgeText}>Premium</Text>
                      </View>
                    )}

                    <Text style={[styles.serviceName, { color: theme.colors.text }]}>
                      {service.name_fr}
                    </Text>

                    <Text style={[styles.serviceShortDesc, { color: colors.textSecondary }]}>
                      {service.short_desc_fr}
                    </Text>

                    {bulletPoints.length > 0 && (
                      <View style={styles.bulletPointsContainer}>
                        {bulletPoints.map((point, pointIndex) => (
                          <View key={pointIndex} style={styles.bulletPoint}>
                            <IconSymbol
                              ios_icon_name="checkmark.circle.fill"
                              android_material_icon_name="check_circle"
                              size={16}
                              color={colors.success}
                            />
                            <Text style={[styles.bulletPointText, { color: theme.colors.text }]}>
                              {point}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleServiceAction(service)}
                    >
                      <IconSymbol
                        ios_icon_name={buttonIcon.ios}
                        android_material_icon_name={buttonIcon.android}
                        size={18}
                        color="#ffffff"
                      />
                      <Text style={styles.actionButtonText}>
                        {getButtonText(service.cta_type)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </React.Fragment>
              );
            })}
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
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  categoryScroll: {
    marginBottom: 24,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryButtonText: {
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
  servicesContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  serviceCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
  },
  premiumBadge: {
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
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    paddingRight: 80,
  },
  serviceShortDesc: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  bulletPointsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletPointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
