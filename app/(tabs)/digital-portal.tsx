
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { PageHeader } from "@/components/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import { supabase } from "@/app/integrations/supabase/client";
import { colors } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";

interface Port {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
}

interface Shipment {
  id: string;
  tracking_number: string;
  current_status: string;
  origin_port: Port | null;
  destination_port: Port | null;
  cargo_type: string | null;
  last_update: string | null;
  created_at: string;
}

export default function DigitalPortalScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, client } = useAuth();
  const { hasDigitalPortalAccess, loading: subscriptionLoading, subscription } = useSubscriptionAccess();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('Digital Portal - Access Check:', {
      user: !!user,
      client: !!client,
      hasDigitalPortalAccess,
      subscriptionLoading,
      subscription: subscription?.plan_type,
    });

    // Wait for subscription data to load
    if (!subscriptionLoading) {
      setIsCheckingAccess(false);

      // Redirect to pricing if no access
      if (user && client && !hasDigitalPortalAccess) {
        console.log('Digital Portal - Redirecting to pricing (no valid subscription)');
        router.replace('/(tabs)/pricing?highlight=digital_portal');
      }
    }
  }, [user, client, hasDigitalPortalAccess, subscriptionLoading, subscription, router]);

  // Load shipments for the logged-in client
  const loadShipments = useCallback(async () => {
    if (!client?.id) {
      console.log('No client ID available');
      return;
    }

    try {
      setLoadingShipments(true);

      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select(`
          id,
          tracking_number,
          current_status,
          cargo_type,
          last_update,
          created_at,
          origin_port:ports!shipments_origin_port_fkey(id, name, city, country),
          destination_port:ports!shipments_destination_port_fkey(id, name, city, country)
        `)
        .eq('client', client.id)
        .order('created_at', { ascending: false });

      if (shipmentsError) {
        console.error('Error loading shipments:', shipmentsError);
      } else {
        console.log('Shipments loaded:', shipmentsData?.length || 0);
        setShipments(shipmentsData || []);
      }
    } catch (error) {
      console.error('Error loading shipments:', error);
    } finally {
      setLoadingShipments(false);
      setRefreshing(false);
    }
  }, [client]);

  useEffect(() => {
    if (user && client && hasDigitalPortalAccess && !subscriptionLoading) {
      loadShipments();
    }
  }, [user, client, hasDigitalPortalAccess, subscriptionLoading, loadShipments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadShipments();
  }, [loadShipments]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'in_transit':
      case 'confirmed':
        return colors.primary;
      case 'at_port':
        return '#f59e0b';
      case 'on_hold':
      case 'cancelled':
        return '#ef4444';
      case 'draft':
      case 'quote_pending':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  }, []);

  const formatStatus = useCallback((status: string) => {
    const statusTranslations: Record<string, string> = {
      'draft': 'Brouillon',
      'quote_pending': 'Devis en attente',
      'confirmed': 'Confirmé',
      'in_transit': 'En transit',
      'at_port': 'Au port',
      'delivered': 'Livré',
      'on_hold': 'En attente',
      'cancelled': 'Annulé',
    };
    return statusTranslations[status] || status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Redirect to login if not authenticated
  if (!user) {
    console.log('Digital Portal - Redirecting to client-space (not authenticated)');
    return <Redirect href="/(tabs)/client-space" />;
  }

  // Show loading while checking access
  if (isCheckingAccess || subscriptionLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <PageHeader title={t.digitalPortal.title} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t.common.loading}
          </Text>
        </View>
      </View>
    );
  }

  // If no access after loading, the redirect will happen via useEffect
  if (!hasDigitalPortalAccess) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <PageHeader title={t.digitalPortal.title} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t.digitalPortal.redirecting}
          </Text>
        </View>
      </View>
    );
  }

  // User has access - show the portal
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title={t.digitalPortal.title} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <IconSymbol
              ios_icon_name="globe.badge.chevron.backward"
              android_material_icon_name="language"
              size={80}
              color="#FFFFFF"
            />
            <Text style={styles.heroTitle}>
              Votre Portail Maritime & Logistique
            </Text>
            <Text style={styles.heroSubtitle}>
              Tableau de bord digital complet pour suivre vos expéditions, documents, rapports et opérations en temps réel.
            </Text>

            {/* Subscription Badge */}
            {subscription && (
              <View style={styles.subscriptionBadge}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={16}
                  color={colors.primary}
                />
                <Text style={[styles.subscriptionBadgeText, { color: colors.primary }]}>
                  {subscription.plan_type === 'premium_tracking' && 'Premium Tracking'}
                  {subscription.plan_type === 'enterprise_logistics' && 'Enterprise Logistics'}
                  {subscription.plan_type === 'digital_portal' && 'Digital Portal'}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* MODULE 1 - Tracking avancé (données de shipments) */}
        <View style={styles.section}>
          <View style={styles.moduleTitleContainer}>
            <View style={[styles.moduleNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.moduleNumberText}>1</Text>
            </View>
            <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>
              Tracking avancé
            </Text>
          </View>
          <Text style={[styles.moduleSubtitle, { color: colors.textSecondary }]}>
            Suivez vos expéditions en temps réel
          </Text>

          {loadingShipments ? (
            <View style={styles.loadingShipmentsContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                Chargement des expéditions...
              </Text>
            </View>
          ) : shipments.length === 0 ? (
            <View style={[styles.emptyShipmentsCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <IconSymbol
                ios_icon_name="shippingbox"
                android_material_icon_name="inventory_2"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyShipmentsTitle, { color: theme.colors.text }]}>
                Aucune expédition en cours
              </Text>
              <Text style={[styles.emptyShipmentsText, { color: colors.textSecondary }]}>
                Vos expéditions apparaîtront ici une fois créées.
              </Text>
              <TouchableOpacity
                style={[styles.emptyActionButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/freight-quote')}
              >
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add_circle"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.emptyActionButtonText}>Demander un devis</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.shipmentsListContainer}>
              {shipments.map((shipment, index) => (
                <View
                  key={index}
                  style={[styles.shipmentItemCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
                >
                  {/* Tracking Number & Status */}
                  <View style={styles.shipmentItemHeader}>
                    <View style={styles.shipmentItemHeaderLeft}>
                      <IconSymbol
                        ios_icon_name="shippingbox.fill"
                        android_material_icon_name="local_shipping"
                        size={24}
                        color={colors.primary}
                      />
                      <View style={styles.shipmentItemHeaderInfo}>
                        <Text style={[styles.shipmentItemLabel, { color: colors.textSecondary }]}>
                          N° de suivi
                        </Text>
                        <Text style={[styles.shipmentItemTrackingNumber, { color: theme.colors.text }]}>
                          {shipment.tracking_number}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.shipmentItemStatusBadge, { backgroundColor: getStatusColor(shipment.current_status) + '20' }]}>
                      <Text style={[styles.shipmentItemStatusText, { color: getStatusColor(shipment.current_status) }]}>
                        {formatStatus(shipment.current_status)}
                      </Text>
                    </View>
                  </View>

                  {/* Route Information */}
                  <View style={styles.shipmentItemRoute}>
                    <View style={styles.shipmentItemRoutePoint}>
                      <View style={[styles.shipmentItemRouteDot, { backgroundColor: colors.primary }]} />
                      <View style={styles.shipmentItemRouteInfo}>
                        <Text style={[styles.shipmentItemRouteLabel, { color: colors.textSecondary }]}>
                          Port d&apos;origine
                        </Text>
                        <Text style={[styles.shipmentItemRouteValue, { color: theme.colors.text }]}>
                          {shipment.origin_port?.name || 'Non spécifié'}
                        </Text>
                        {shipment.origin_port?.city && shipment.origin_port?.country && (
                          <Text style={[styles.shipmentItemRouteSubvalue, { color: colors.textSecondary }]}>
                            {shipment.origin_port.city}, {shipment.origin_port.country}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.shipmentItemRouteConnector}>
                      <View style={[styles.shipmentItemRouteConnectorLine, { backgroundColor: colors.border }]} />
                      <IconSymbol
                        ios_icon_name="arrow.down"
                        android_material_icon_name="arrow_downward"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </View>

                    <View style={styles.shipmentItemRoutePoint}>
                      <View style={[styles.shipmentItemRouteDot, { backgroundColor: colors.secondary }]} />
                      <View style={styles.shipmentItemRouteInfo}>
                        <Text style={[styles.shipmentItemRouteLabel, { color: colors.textSecondary }]}>
                          Port de destination
                        </Text>
                        <Text style={[styles.shipmentItemRouteValue, { color: theme.colors.text }]}>
                          {shipment.destination_port?.name || 'Non spécifié'}
                        </Text>
                        {shipment.destination_port?.city && shipment.destination_port?.country && (
                          <Text style={[styles.shipmentItemRouteSubvalue, { color: colors.textSecondary }]}>
                            {shipment.destination_port.city}, {shipment.destination_port.country}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Cargo Type */}
                  {shipment.cargo_type && (
                    <View style={styles.shipmentItemDetail}>
                      <IconSymbol
                        ios_icon_name="cube.box.fill"
                        android_material_icon_name="inventory"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.shipmentItemDetailLabel, { color: colors.textSecondary }]}>
                        Type de cargaison :
                      </Text>
                      <Text style={[styles.shipmentItemDetailValue, { color: theme.colors.text }]}>
                        {shipment.cargo_type}
                      </Text>
                    </View>
                  )}

                  {/* Last Update */}
                  {shipment.last_update && (
                    <View style={styles.shipmentItemDetail}>
                      <IconSymbol
                        ios_icon_name="clock.fill"
                        android_material_icon_name="schedule"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.shipmentItemDetailLabel, { color: colors.textSecondary }]}>
                        Dernière mise à jour :
                      </Text>
                      <Text style={[styles.shipmentItemDetailValue, { color: theme.colors.text }]}>
                        {formatDate(shipment.last_update)}
                      </Text>
                    </View>
                  )}

                  {/* View Details Button */}
                  <TouchableOpacity
                    style={[styles.shipmentItemButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push(`/(tabs)/shipment-detail?id=${shipment.id}`)}
                  >
                    <Text style={styles.shipmentItemButtonText}>Voir détails</Text>
                    <IconSymbol
                      ios_icon_name="arrow.right"
                      android_material_icon_name="arrow_forward"
                      size={18}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Portal Features Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.digitalPortal.featuresTitle}
          </Text>

          <View style={styles.featuresGrid}>
            {/* Advanced Tracking */}
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/client-dashboard')}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="location.fill"
                  android_material_icon_name="my_location"
                  size={32}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {t.digitalPortal.advancedTracking}
              </Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {t.digitalPortal.advancedTrackingDesc}
              </Text>
            </TouchableOpacity>

            {/* Documents & Reports */}
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => console.log('Documents feature - Coming soon')}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: colors.secondary + '20' }]}>
                <IconSymbol
                  ios_icon_name="doc.text.fill"
                  android_material_icon_name="description"
                  size={32}
                  color={colors.secondary}
                />
              </View>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {t.digitalPortal.documents}
              </Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {t.digitalPortal.documentsDesc}
              </Text>
            </TouchableOpacity>

            {/* Analytics & Reporting */}
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => console.log('Analytics feature - Coming soon')}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol
                  ios_icon_name="chart.bar.fill"
                  android_material_icon_name="bar_chart"
                  size={32}
                  color={colors.accent}
                />
              </View>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {t.digitalPortal.analytics}
              </Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {t.digitalPortal.analyticsDesc}
              </Text>
            </TouchableOpacity>

            {/* API Access */}
            <TouchableOpacity
              style={[styles.featureCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => console.log('API feature - Coming soon')}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: colors.success + '20' }]}>
                <IconSymbol
                  ios_icon_name="chevron.left.forwardslash.chevron.right"
                  android_material_icon_name="code"
                  size={32}
                  color={colors.success}
                />
              </View>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {t.digitalPortal.apiAccess}
              </Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {t.digitalPortal.apiAccessDesc}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.digitalPortal.quickActions}
          </Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/freight-quote')}
            >
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add_circle"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>
                {t.digitalPortal.newQuote}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => router.push('/(tabs)/contact')}
            >
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>
                {t.digitalPortal.contactSupport}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.digitalPortal.resources}
          </Text>

          <View style={styles.resourcesContainer}>
            <TouchableOpacity
              style={[styles.resourceCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => console.log('User guide - Coming soon')}
            >
              <IconSymbol
                ios_icon_name="book.fill"
                android_material_icon_name="menu_book"
                size={24}
                color={colors.primary}
              />
              <View style={styles.resourceContent}>
                <Text style={[styles.resourceTitle, { color: theme.colors.text }]}>
                  {t.digitalPortal.userGuide}
                </Text>
                <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
                  {t.digitalPortal.userGuideDesc}
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resourceCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => console.log('API documentation - Coming soon')}
            >
              <IconSymbol
                ios_icon_name="doc.text"
                android_material_icon_name="article"
                size={24}
                color={colors.secondary}
              />
              <View style={styles.resourceContent}>
                <Text style={[styles.resourceTitle, { color: theme.colors.text }]}>
                  {t.digitalPortal.apiDocs}
                </Text>
                <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
                  {t.digitalPortal.apiDocsDesc}
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resourceCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/contact')}
            >
              <IconSymbol
                ios_icon_name="questionmark.circle.fill"
                android_material_icon_name="help"
                size={24}
                color={colors.accent}
              />
              <View style={styles.resourceContent}>
                <Text style={[styles.resourceTitle, { color: theme.colors.text }]}>
                  {t.digitalPortal.support}
                </Text>
                <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
                  {t.digitalPortal.supportDesc}
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.infoBannerText, { color: theme.colors.text }]}>
            {t.digitalPortal.infoBanner}
          </Text>
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
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 48,
    marginBottom: 32,
  },
  heroContent: {
    alignItems: 'center',
    gap: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#FFFFFF',
    marginTop: 16,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    color: '#FFFFFF',
    lineHeight: 26,
    opacity: 0.95,
    maxWidth: 600,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
  },
  subscriptionBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  moduleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  moduleNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleNumberText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  moduleSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    marginLeft: 48,
  },
  loadingShipmentsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyShipmentsCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  emptyShipmentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyShipmentsText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyActionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shipmentsListContainer: {
    gap: 16,
  },
  shipmentItemCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  shipmentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  shipmentItemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  shipmentItemHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  shipmentItemLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shipmentItemTrackingNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  shipmentItemStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  shipmentItemStatusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  shipmentItemRoute: {
    gap: 0,
  },
  shipmentItemRoutePoint: {
    flexDirection: 'row',
    gap: 12,
  },
  shipmentItemRouteDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  shipmentItemRouteInfo: {
    flex: 1,
    gap: 4,
  },
  shipmentItemRouteLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shipmentItemRouteValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  shipmentItemRouteSubvalue: {
    fontSize: 14,
  },
  shipmentItemRouteConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 6,
    marginVertical: 8,
  },
  shipmentItemRouteConnectorLine: {
    width: 2,
    height: 24,
  },
  shipmentItemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  shipmentItemDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  shipmentItemDetailValue: {
    fontSize: 14,
  },
  shipmentItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  shipmentItemButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resourcesContainer: {
    gap: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  resourceContent: {
    flex: 1,
    gap: 4,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
