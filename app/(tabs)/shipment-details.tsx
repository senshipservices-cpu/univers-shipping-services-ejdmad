
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/formatters';

// PARTIE 2/4 – Modèle de données + Blocs Résumé / Expéditeur / Destinataire
// PARTIE 3/4 – Colis + Prix + Timeline + Boutons + Loading/Erreur
// SCREEN_ID: ShipmentDetails
// TITLE: "Détails de l'envoi"
// ROUTE: "/shipment-details"

// New data structure aligned with API response
interface OriginDestination {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface Parcel {
  type: string;
  weight_kg: number;
  declared_value: number;
  options: string[];
}

interface ShipmentEvent {
  date: string;
  location: string;
  description: string;
}

interface ShipmentData {
  id: string;
  tracking_number: string;
  status: string;
  created_at: string;
  origin: OriginDestination;
  destination: OriginDestination;
  parcel: Parcel;
  price_total: number;
  currency: string;
  events: ShipmentEvent[];
  estimated_delivery_date: string;
}

// SCREEN_STATE (ShipmentDetails):
interface ScreenState {
  shipment_id: string | null;
  tracking_number: string | null;
  shipment_loading: boolean;
  shipment_error: string | null;
  shipment_data: ShipmentData | null;
}

export default function ShipmentDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, client, isEmailVerified } = useAuth();
  const params = useLocalSearchParams();

  // SCREEN_STATE initialization
  const [state, setState] = useState<ScreenState>({
    shipment_id: (params.shipment_id as string) || null,
    tracking_number: (params.tracking_number as string) || null,
    shipment_loading: false,
    shipment_error: null,
    shipment_data: null,
  });

  // Load shipment details
  const loadShipmentDetails = useCallback(async () => {
    if (!state.shipment_id || !client?.id) {
      console.log('[SHIPMENT_DETAILS] Missing shipment_id or client_id');
      return;
    }

    try {
      console.log('[SHIPMENT_DETAILS] Loading shipment:', state.shipment_id);

      setState(prev => ({
        ...prev,
        shipment_loading: true,
        shipment_error: null,
      }));

      // Load shipment with port information
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select(`
          *,
          origin_port:ports!shipments_origin_port_fkey(id, name, city, country),
          destination_port:ports!shipments_destination_port_fkey(id, name, city, country)
        `)
        .eq('id', state.shipment_id)
        .single();

      if (shipmentError) {
        console.error('[SHIPMENT_DETAILS] Error loading shipment:', shipmentError);
        setState(prev => ({
          ...prev,
          shipment_loading: false,
          shipment_error: 'Impossible de charger les détails de l\'envoi.',
        }));
        return;
      }

      // Security check: Verify that the shipment belongs to the user's client
      if (shipmentData.client !== client.id) {
        console.warn('[SHIPMENT_DETAILS] Unauthorized access attempt');
        setState(prev => ({
          ...prev,
          shipment_loading: false,
          shipment_error: 'Vous n\'êtes pas autorisé à consulter cet envoi.',
        }));

        Alert.alert(
          'Accès refusé',
          'Vous n\'êtes pas autorisé à consulter cet envoi.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      // Load status history (timeline)
      const { data: historyData, error: historyError } = await supabase
        .from('shipment_status_history')
        .select('*')
        .eq('shipment_id', state.shipment_id)
        .order('timestamp', { ascending: false });

      if (historyError) {
        console.error('[SHIPMENT_DETAILS] Error loading history:', historyError);
      }

      // Load related freight quote for additional details (sender/receiver, price)
      const { data: quoteData, error: quoteError } = await supabase
        .from('freight_quotes')
        .select('*')
        .eq('ordered_as_shipment', state.shipment_id)
        .maybeSingle();

      if (quoteError) {
        console.error('[SHIPMENT_DETAILS] Error loading quote:', quoteError);
      }

      // Transform data to match new structure
      const transformedData: ShipmentData = {
        id: shipmentData.id,
        tracking_number: shipmentData.tracking_number,
        status: shipmentData.current_status,
        created_at: shipmentData.created_at,
        origin: {
          name: quoteData?.client_name || 'Non spécifié',
          phone: quoteData?.client_phone || quoteData?.client_email || 'Non spécifié',
          address: shipmentData.origin_port?.name || 'Non spécifié',
          city: shipmentData.origin_port?.city || 'Non spécifié',
          country: shipmentData.origin_port?.country || 'Non spécifié',
        },
        destination: {
          name: quoteData?.receiver_name || 'Non spécifié',
          phone: quoteData?.receiver_phone || quoteData?.receiver_email || 'Non spécifié',
          address: shipmentData.destination_port?.name || 'Non spécifié',
          city: shipmentData.destination_port?.city || 'Non spécifié',
          country: shipmentData.destination_port?.country || 'Non spécifié',
        },
        parcel: {
          type: shipmentData.cargo_type || 'standard',
          weight_kg: quoteData?.weight_kg || 0,
          declared_value: quoteData?.declared_value || 0,
          options: shipmentData.container_type ? [shipmentData.container_type] : [],
        },
        price_total: quoteData?.quote_amount || quoteData?.quoted_price || 0,
        currency: quoteData?.quote_currency || quoteData?.currency || 'MAD',
        events: (historyData || []).map(event => ({
          date: event.timestamp,
          location: event.location || 'Non spécifié',
          description: event.notes || formatStatus(event.status),
        })),
        estimated_delivery_date: shipmentData.eta || 'Non spécifié',
      };

      console.log('[SHIPMENT_DETAILS] Shipment loaded successfully');

      setState(prev => ({
        ...prev,
        shipment_loading: false,
        shipment_data: transformedData,
      }));
    } catch (error) {
      console.error('[SHIPMENT_DETAILS] Exception loading shipment:', error);
      setState(prev => ({
        ...prev,
        shipment_loading: false,
        shipment_error: 'Une erreur est survenue lors du chargement.',
      }));
    }
  }, [state.shipment_id, client, router]);

  // Load on mount
  useEffect(() => {
    if (user && client && state.shipment_id) {
      loadShipmentDetails();
    }
  }, [user, client, state.shipment_id]);

  // Helper functions
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'in_transit':
        return colors.primary;
      case 'confirmed':
        return '#3b82f6';
      case 'at_port':
        return '#8b5cf6';
      case 'quote_pending':
      case 'registered':
        return '#f59e0b';
      case 'draft':
        return colors.textSecondary;
      case 'on_hold':
        return '#f97316';
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  }, []);

  const formatStatus = useCallback((status: string) => {
    const statusMap: { [key: string]: string } = {
      'draft': 'Brouillon',
      'quote_pending': 'Devis en attente',
      'registered': 'Enregistré',
      'confirmed': 'Confirmé',
      'in_transit': 'En transit',
      'at_port': 'Au port',
      'delivered': 'Livré',
      'on_hold': 'En attente',
      'cancelled': 'Annulé',
    };
    return statusMap[status] || status;
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'delivered':
        return { ios: 'checkmark.circle.fill', android: 'check_circle' };
      case 'in_transit':
      case 'confirmed':
      case 'registered':
        return { ios: 'shippingbox.fill', android: 'local_shipping' };
      case 'at_port':
        return { ios: 'location.fill', android: 'location_on' };
      case 'on_hold':
        return { ios: 'pause.circle.fill', android: 'pause_circle' };
      case 'cancelled':
        return { ios: 'xmark.circle.fill', android: 'cancel' };
      case 'draft':
      case 'quote_pending':
        return { ios: 'doc.text', android: 'description' };
      default:
        return { ios: 'circle.fill', android: 'circle' };
    }
  }, []);

  // Action button handlers
  const handleTrackShipment = useCallback(() => {
    console.log('[SHIPMENT_DETAILS] Navigate to tracking');
    if (state.tracking_number) {
      router.push({
        pathname: '/(tabs)/tracking',
        params: { tracking_number: state.tracking_number }
      });
    } else {
      Alert.alert(
        'Information',
        'Le numéro de suivi n\'est pas disponible pour cet envoi.'
      );
    }
  }, [state.tracking_number, router]);

  const handleContactSupport = useCallback(() => {
    console.log('[SHIPMENT_DETAILS] Contact support');
    Alert.alert(
      'Contacter le support',
      'Comment souhaitez-vous nous contacter ?',
      [
        {
          text: 'Email',
          onPress: () => {
            const subject = `Support - Envoi ${state.tracking_number || state.shipment_id}`;
            const body = `Bonjour,\n\nJ'ai besoin d'aide concernant mon envoi:\n\nNuméro de suivi: ${state.tracking_number || 'N/A'}\nID: ${state.shipment_id}\n\nDescription du problème:\n\n`;
            Linking.openURL(`mailto:support@3sglobal.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
          }
        },
        {
          text: 'Téléphone',
          onPress: () => {
            Linking.openURL('tel:+212522000000');
          }
        },
        {
          text: 'Annuler',
          style: 'cancel'
        }
      ]
    );
  }, [state.tracking_number, state.shipment_id]);

  const handleBackToDashboard = useCallback(() => {
    console.log('[SHIPMENT_DETAILS] Navigate back to dashboard');
    router.push('/(tabs)/dashboard');
  }, [router]);

  // Redirect if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/login" />;
  }

  // Redirect if email is not verified
  if (!isEmailVerified()) {
    return <Redirect href="/(tabs)/verify-email" />;
  }

  // Loading state
  if (state.shipment_loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Détails de l&apos;envoi
          </Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement des détails de l&apos;envoi...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (state.shipment_error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Détails de l&apos;envoi
          </Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="error"
            size={64}
            color={colors.error}
          />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Erreur
          </Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {state.shipment_error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadShipmentDetails}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // No data state
  if (!state.shipment_data) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Détails de l&apos;envoi
          </Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.circle"
            android_material_icon_name="info"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Envoi introuvable
          </Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            L&apos;envoi demandé n&apos;existe pas ou a été supprimé.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const shipment = state.shipment_data;
  const statusIcon = getStatusIcon(shipment.status);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Détails de l&apos;envoi
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BLOC 1 – Résumé (Header) */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryColumn}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                N° de suivi
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {shipment.tracking_number}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipment.status) }]}>
              <IconSymbol
                ios_icon_name={statusIcon.ios}
                android_material_icon_name={statusIcon.android}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.statusBadgeText}>
                {formatStatus(shipment.status)}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryColumn}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Créé le
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {formatDate(shipment.created_at)}
              </Text>
            </View>
            <View style={styles.summaryColumn}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Livraison estimée
              </Text>
              <Text style={[styles.summaryValue, { color: colors.accent }]}>
                {shipment.estimated_delivery_date !== 'Non spécifié' 
                  ? formatDate(shipment.estimated_delivery_date)
                  : shipment.estimated_delivery_date}
              </Text>
            </View>
          </View>
        </View>

        {/* BLOC 2 – Expéditeur */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Expéditeur
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nom</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {shipment.origin.name}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Téléphone</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {shipment.origin.phone}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Adresse</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {shipment.origin.address}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ville</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {shipment.origin.city}, {shipment.origin.country}
              </Text>
            </View>
          </View>
        </View>

        {/* BLOC 3 – Destinataire */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={24}
              color={colors.secondary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Destinataire
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nom</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {shipment.destination.name}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Téléphone</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {shipment.destination.phone}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Adresse</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {shipment.destination.address}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ville</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {shipment.destination.city}, {shipment.destination.country}
              </Text>
            </View>
          </View>
        </View>

        {/* BLOC 4 – Colis */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="inventory_2"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Colis
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {shipment.parcel.type}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Poids</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {shipment.parcel.weight_kg} kg
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Valeur déclarée</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {formatCurrency(shipment.parcel.declared_value, shipment.currency)}
              </Text>
            </View>

            {shipment.parcel.options.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Options</Text>
                <View style={styles.optionsContainer}>
                  {shipment.parcel.options.map((option, index) => (
                    <View 
                      key={index} 
                      style={[styles.optionBadge, { backgroundColor: colors.accent + '20' }]}
                    >
                      <Text style={[styles.optionText, { color: colors.accent }]}>
                        {option}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* BLOC 5 – Prix */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="dollarsign.circle.fill"
              android_material_icon_name="payments"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Tarif
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              Montant total
            </Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>
              {formatCurrency(shipment.price_total, shipment.currency)}
            </Text>
          </View>
        </View>

        {/* BLOC 6 – Timeline (Historique) */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="history"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Historique de suivi
            </Text>
          </View>

          {shipment.events && shipment.events.length > 0 ? (
            <View style={styles.timelineContainer}>
              {shipment.events.map((event, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                    {index < shipment.events.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                  <View style={[styles.timelineContent, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                      {formatDateTime(event.date)}
                      {event.location && ` — ${event.location}`}
                    </Text>
                    <Text style={[styles.timelineDescription, { color: theme.colors.text }]}>
                      {event.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyTimeline}>
              <IconSymbol
                ios_icon_name="exclamationmark.circle"
                android_material_icon_name="info"
                size={32}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyTimelineText, { color: colors.textSecondary }]}>
                Aucun événement d&apos;historique disponible pour le moment.
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Primary Button - Voir le suivi */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleTrackShipment}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="my_location"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.primaryButtonText}>Voir le suivi</Text>
          </TouchableOpacity>

          {/* Secondary Button - Contacter le support */}
          <TouchableOpacity
            style={[styles.secondaryButton, { 
              backgroundColor: theme.colors.card,
              borderColor: colors.primary,
            }]}
            onPress={handleContactSupport}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Contacter le support
            </Text>
          </TouchableOpacity>

          {/* Ghost Button - Retour à mes envois */}
          <TouchableOpacity
            style={styles.ghostButton}
            onPress={handleBackToDashboard}
            activeOpacity={0.6}
          >
            <IconSymbol
              ios_icon_name="arrow.left"
              android_material_icon_name="arrow_back"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.ghostButtonText, { color: colors.textSecondary }]}>
              Retour à mes envois
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 120 }} />
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
    paddingBottom: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // BLOC 1 – Résumé (Header)
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  summaryColumn: {
    flex: 1,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  // BLOC 2 & 3 – Expéditeur / Destinataire
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailsGrid: {
    gap: 14,
  },
  detailRow: {
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  // Parcel options
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  optionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Price section
  priceContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  // Timeline section
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineDate: {
    fontSize: 12,
    marginBottom: 6,
  },
  timelineDescription: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  emptyTimeline: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTimelineText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Action Buttons
  actionsContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  ghostButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
