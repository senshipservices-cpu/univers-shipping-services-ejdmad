
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { colors, commonStyles } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";
import { Database } from "@/app/integrations/supabase/types";

type Service = Database["public"]["Tables"]["services_global"]["Row"];

interface ServicesByCategory {
  maritime: Service[];
  logistics: Service[];
  trade: Service[];
}

export default function GlobalServicesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { user, client } = useAuth();

  const [servicesByCategory, setServicesByCategory] = useState<ServicesByCategory>({
    maritime: [],
    logistics: [],
    trade: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState<any>(null);

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
      
      const categorized: ServicesByCategory = {
        maritime: [],
        logistics: [],
        trade: [],
      };

      data?.forEach(service => {
        if (service.menu_group === 'maritime') {
          categorized.maritime.push(service);
        } else if (service.menu_group === 'logistics') {
          categorized.logistics.push(service);
        } else if (service.menu_group === 'trade') {
          categorized.trade.push(service);
        }
      });

      setServicesByCategory(categorized);
    } catch (error) {
      console.error('Exception fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserSubscription = useCallback(async () => {
    if (!client?.id) {
      setUserSubscription(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('client', client.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.log('No active subscription found');
        setUserSubscription(null);
        return;
      }

      console.log('User subscription:', data);
      setUserSubscription(data);
    } catch (error) {
      console.error('Exception fetching subscription:', error);
      setUserSubscription(null);
    }
  }, [client]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchUserSubscription();
  }, [fetchUserSubscription]);

  const extractBulletPoints = (fullDesc: string | null): string[] => {
    if (!fullDesc) return [];
    
    const sentences = fullDesc.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 4).map(s => s.trim());
  };

  const getCtaLabel = (ctaType: string | null): string => {
    switch (ctaType) {
      case 'request_quote':
        return t.globalServices.requestQuote;
      case 'pricing':
        return t.globalServices.viewPricing;
      case 'contact':
        return t.globalServices.consultExpert;
      case 'subscribe':
        return t.globalServices.accessPortal;
      case 'register':
        return t.globalServices.accessPortal;
      default:
        return t.globalServices.requestQuote;
    }
  };

  const handleCtaPress = (service: Service) => {
    console.log('CTA pressed for service:', service.name_fr, 'CTA type:', service.cta_type);
    
    const ctaType = service.cta_type;
    const serviceName = language === 'fr' ? service.name_fr : (service.name_en || service.name_fr);

    switch (ctaType) {
      case 'request_quote':
        // Navigate to freight_quote with service_id parameter
        router.push({
          pathname: '/freight-quote',
          params: { service_id: service.id },
        });
        break;

      case 'pricing':
        // Navigate to pricing page
        router.push('/pricing');
        // TODO: In the future, you could add a parameter to scroll to a specific section
        // or highlight a specific plan
        break;

      case 'contact':
        // Navigate to contact page with pre-filled subject
        router.push({
          pathname: '/contact',
          params: { subject: `Consulting - ${serviceName}` },
        });
        break;

      case 'subscribe':
      case 'register':
        // For portal access (Digital Maritime Solutions)
        handlePortalAccess(service);
        break;

      default:
        // Default to quote request
        router.push({
          pathname: '/freight-quote',
          params: { service_id: service.id },
        });
        break;
    }
  };

  const handlePortalAccess = (service: Service) => {
    // Check if user is logged in
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour accéder au portail. Souhaitez-vous vous connecter ou créer un compte ?",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Se connecter",
            onPress: () => router.push('/client-space'),
          },
        ]
      );
      return;
    }

    // Check if user has an active subscription that gives access to the portal
    // Premium Tracking or Enterprise Logistics plans should give access
    const hasPortalAccess = userSubscription && (
      userSubscription.plan_type === 'premium_tracking' ||
      userSubscription.plan_type === 'enterprise_logistics'
    );

    if (hasPortalAccess) {
      // User has access, navigate to client dashboard
      router.push('/client-dashboard');
    } else {
      // User doesn't have access, redirect to pricing with a message
      Alert.alert(
        "Abonnement requis",
        "L'accès au portail digital nécessite un abonnement Premium Tracking ou Enterprise Logistics. Souhaitez-vous découvrir nos offres ?",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Voir les offres",
            onPress: () => router.push('/pricing'),
          },
        ]
      );
    }
  };

  const renderServiceCard = (service: Service, index: number) => {
    const bulletPoints = extractBulletPoints(
      language === 'fr' ? service.full_desc_fr : (service.full_desc_en || service.full_desc_fr)
    );

    return (
      <View key={service.id} style={[styles.serviceCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.serviceCardHeader}>
          <Text style={[styles.serviceTitle, { color: theme.colors.text }]}>
            {language === 'fr' ? service.name_fr : (service.name_en || service.name_fr)}
          </Text>
        </View>
        
        <Text style={[styles.serviceSubtitle, { color: colors.textSecondary }]}>
          {language === 'fr' ? service.short_desc_fr : (service.short_desc_en || service.short_desc_fr)}
        </Text>

        {bulletPoints.length > 0 && (
          <View style={styles.bulletPointsContainer}>
            {bulletPoints.map((point, idx) => (
              <View key={idx} style={styles.bulletPointRow}>
                <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletPointText, { color: theme.colors.text }]}>
                  {point}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: colors.primary }]}
          onPress={() => handleCtaPress(service)}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>
            {getCtaLabel(service.cta_type)}
          </Text>
          <IconSymbol
            ios_icon_name="arrow.right"
            android_material_icon_name="arrow_forward"
            size={18}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCategory = (
    categoryKey: keyof ServicesByCategory,
    categoryTitle: string,
    services: Service[]
  ) => {
    if (services.length === 0) return null;

    return (
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol
              ios_icon_name={
                categoryKey === 'maritime' ? 'ferry' :
                categoryKey === 'logistics' ? 'shippingbox' :
                'briefcase'
              }
              android_material_icon_name={
                categoryKey === 'maritime' ? 'directions_boat' :
                categoryKey === 'logistics' ? 'inventory_2' :
                'business_center'
              }
              size={28}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
            {categoryTitle}
          </Text>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service, index) => renderServiceCard(service, index))}
        </View>
      </View>
    );
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
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            {t.globalServices.heroTitle}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            {t.globalServices.subtitle}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              {t.globalServices.loading}
            </Text>
          </View>
        ) : (
          <React.Fragment>
            {renderCategory('maritime', t.globalServices.maritimeShipping, servicesByCategory.maritime)}
            {renderCategory('logistics', t.globalServices.logisticsPortHandling, servicesByCategory.logistics)}
            {renderCategory('trade', t.globalServices.tradeConsulting, servicesByCategory.trade)}
          </React.Fragment>
        )}
      </ScrollView>
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
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
  },
  categorySection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  servicesGrid: {
    gap: 20,
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
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  serviceSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  bulletPointsContainer: {
    marginBottom: 20,
    gap: 10,
  },
  bulletPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bulletPointText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
