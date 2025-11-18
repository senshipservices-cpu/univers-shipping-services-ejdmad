
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';

interface Service {
  id: string;
  name_fr: string;
  name_en: string | null;
  short_desc_fr: string;
  short_desc_en: string | null;
  full_desc_fr: string | null;
  full_desc_en: string | null;
  cta_type: string | null;
  is_premium: boolean;
}

export function FeaturedServices() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { hasDigitalPortalAccess } = useSubscriptionAccess();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedServices();
  }, []);

  const fetchFeaturedServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services_global')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching featured services:', error);
      } else {
        console.log('Featured services loaded:', data?.length);
        setServices(data || []);
      }
    } catch (error) {
      console.error('Exception fetching featured services:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractBulletPoints = (description: string | null): string[] => {
    if (!description) return [];
    
    // Split by period and filter out empty strings
    const sentences = description
      .split('.')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // Return first 3 sentences
    return sentences.slice(0, 3);
  };

  const getCTALabel = (ctaType: string | null): string => {
    switch (ctaType) {
      case 'quote':
        return t.home.requestQuoteBtn;
      case 'pricing':
        return t.home.viewPricingBtn;
      case 'expert':
        return t.home.consultExpertBtn;
      case 'portal':
        return t.home.accessPortalBtn;
      default:
        return t.home.requestQuoteBtn;
    }
  };

  const handleCTAPress = (service: Service) => {
    const ctaType = service.cta_type || 'quote';
    const serviceName = language === 'fr' ? service.name_fr : (service.name_en || service.name_fr);

    console.log('CTA pressed:', ctaType, 'for service:', serviceName);

    switch (ctaType) {
      case 'quote':
        router.push({
          pathname: '/(tabs)/freight-quote',
          params: { service_id: service.id }
        });
        break;
      
      case 'pricing':
        router.push('/(tabs)/pricing');
        break;
      
      case 'expert':
        router.push({
          pathname: '/(tabs)/contact',
          params: { subject: `Consulting – ${serviceName}` }
        });
        break;
      
      case 'portal':
        if (hasDigitalPortalAccess) {
          // Navigate to digital portal (to be implemented)
          console.log('Navigate to digital portal');
          router.push('/(tabs)/client-dashboard');
        } else {
          router.push({
            pathname: '/(tabs)/pricing',
            params: { highlight: 'digital_portal' }
          });
        }
        break;
      
      default:
        router.push({
          pathname: '/(tabs)/freight-quote',
          params: { service_id: service.id }
        });
    }
  };

  if (loading) {
    return (
      <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t.home.featuredServicesTitle}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {t.home.featuredServicesSubtitle}
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t.home.featuredServicesTitle}
      </Text>
      <Text style={styles.sectionSubtitle}>
        {t.home.featuredServicesSubtitle}
      </Text>

      <View style={styles.servicesContainer}>
        {services.map((service, index) => {
          const serviceName = language === 'fr' ? service.name_fr : (service.name_en || service.name_fr);
          const serviceDesc = language === 'fr' ? service.short_desc_fr : (service.short_desc_en || service.short_desc_fr);
          const fullDesc = language === 'fr' ? service.full_desc_fr : (service.full_desc_en || service.full_desc_fr);
          const bulletPoints = extractBulletPoints(fullDesc);

          return (
            <React.Fragment key={index}>
              <View style={[styles.serviceCard, { backgroundColor: theme.colors.card }]}>
                {/* Service Icon */}
                <View style={[styles.serviceIconContainer, { backgroundColor: colors.primary }]}>
                  <IconSymbol
                    ios_icon_name="star.fill"
                    android_material_icon_name="star"
                    size={32}
                    color="#ffffff"
                  />
                </View>

                {/* Premium Badge */}
                {service.is_premium && (
                  <View style={styles.premiumBadge}>
                    <IconSymbol
                      ios_icon_name="crown.fill"
                      android_material_icon_name="workspace_premium"
                      size={14}
                      color={colors.warning}
                    />
                    <Text style={styles.premiumText}>Premium</Text>
                  </View>
                )}

                {/* Service Title */}
                <Text style={[styles.serviceTitle, { color: theme.colors.text }]}>
                  {serviceName}
                </Text>

                {/* Service Subtitle */}
                <Text style={styles.serviceSubtitle}>
                  {serviceDesc}
                </Text>

                {/* Bullet Points */}
                {bulletPoints.length > 0 && (
                  <View style={styles.bulletPointsContainer}>
                    {bulletPoints.map((point, idx) => (
                      <React.Fragment key={idx}>
                        <View style={styles.bulletPointRow}>
                          <View style={styles.bulletDot} />
                          <Text style={styles.bulletPointText}>{point}</Text>
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                )}

                {/* CTA Button */}
                <TouchableOpacity
                  style={[styles.ctaButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleCTAPress(service)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ctaButtonText}>
                    {getCTALabel(service.cta_type)}
                  </Text>
                  <IconSymbol
                    ios_icon_name="arrow.right"
                    android_material_icon_name="arrow_forward"
                    size={18}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicesContainer: {
    gap: 20,
  },
  serviceCard: {
    padding: 24,
    borderRadius: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  serviceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  premiumBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warning,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 28,
  },
  serviceSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
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
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  bulletPointText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
