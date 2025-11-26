
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
} from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/formatters';

// PARTIE 1/4 – Contexte + Screen + State
// SCREEN_ID: ShipmentDetails
// TITLE: "Détails de l'envoi"
// ROUTE: "/shipment-details"

interface Port {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
}

interface StatusHistoryEvent {
  id: string;
  status: string;
  location: string | null;
  timestamp: string;
  notes: string | null;
  created_by: string | null;
}

interface ShipmentData {
  id: string;
  tracking_number: string;
  current_status: string;
  origin_port: Port | null;
  destination_port: Port | null;
  eta: string | null;
  etd: string | null;
  cargo_type: string | null;
  container_type: string | null;
  incoterm: string | null;
  client_visible_notes: string | null;
  client: string;
  created_at: string;
  updated_at: string;
  last_update: string | null;
  // Additional fields for sender/receiver (from freight_quotes if available)
  sender_name?: string;
  sender_email?: string;
  sender_phone?: string;
  receiver_name?: string;
  receiver_email?: string;
  receiver_phone?: string;
  // Pricing information
  quoted_price?: number;
  currency?: string;
  // Status history
  status_history?: StatusHistoryEvent[];
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

      // Combine all data
      const fullShipmentData: ShipmentData = {
        ...shipmentData,
        status_history: historyData || [],
        sender_name: quoteData?.client_name || 'Non spécifié',
        sender_email: quoteData?.client_email || 'Non spécifié',
        quoted_price: quoteData?.quote_amount || quoteData?.quoted_price,
        currency: quoteData?.quote_currency || quoteData?.currency || 'EUR',
      };

      console.log('[SHIPMENT_DETAILS] Shipment loaded successfully');

      setState(prev => ({
        ...prev,
        shipment_loading: false,
        shipment_data: fullShipmentData,
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
            Chargement des détails...
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
  const statusIcon = getStatusIcon(shipment.current_status);

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
        {/* Status Card - Tracking, Statut, Dates */}
        <View style={[styles.statusCard, { backgroundColor: getStatusColor(shipment.current_status) }]}>
          <IconSymbol
            ios_icon_name={statusIcon.ios}
            android_material_icon_name={statusIcon.android}
            size={48}
            color="#FFFFFF"
          />
          <Text style={styles.statusTitle}>{formatStatus(shipment.current_status)}</Text>
          <Text style={styles.trackingNumber}>N° : {shipment.tracking_number}</Text>
          {shipment.last_update && (
            <Text style={styles.lastUpdate}>
              Mis à jour : {formatDate(shipment.last_update)}
            </Text>
          )}
        </View>

        {/* Expéditeur / Destinataire Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="person.2.fill"
              android_material_icon_name="people"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Expéditeur / Destinataire
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            {/* Expéditeur */}
            <View style={styles.detailBlock}>
              <Text style={[styles.detailBlockTitle, { color: colors.primary }]}>
                Expéditeur
              </Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nom</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {shipment.sender_name || 'Non spécifié'}
                </Text>
              </View>
              {shipment.sender_email && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {shipment.sender_email}
                  </Text>
                </View>
              )}
              {shipment.sender_phone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Téléphone</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {shipment.sender_phone}
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Destinataire */}
            <View style={styles.detailBlock}>
              <Text style={[styles.detailBlockTitle, { color: colors.secondary }]}>
                Destinataire
              </Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nom</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {shipment.receiver_name || 'Non spécifié'}
                </Text>
              </View>
              {shipment.receiver_email && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {shipment.receiver_email}
                  </Text>
                </View>
              )}
              {shipment.receiver_phone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Téléphone</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {shipment.receiver_phone}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Adresses Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location_on"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Itinéraire
            </Text>
          </View>

          <View style={styles.routeContainer}>
            {/* Origin */}
            <View style={styles.routeStep}>
              <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
              <View style={styles.routeInfo}>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>
                  ORIGINE
                </Text>
                <Text style={[styles.routeValue, { color: theme.colors.text }]}>
                  {shipment.origin_port?.name || 'Non spécifié'}
                </Text>
                {shipment.origin_port?.city && shipment.origin_port?.country && (
                  <Text style={[styles.routeSubvalue, { color: colors.textSecondary }]}>
                    {shipment.origin_port.city}, {shipment.origin_port.country}
                  </Text>
                )}
                {shipment.etd && (
                  <Text style={[styles.dateText, { color: colors.accent }]}>
                    ETD : {formatDate(shipment.etd)}
                  </Text>
                )}
              </View>
            </View>

            <View style={[styles.routeConnector, { backgroundColor: colors.border }]} />

            {/* Destination */}
            <View style={styles.routeStep}>
              <View style={[styles.routeDot, { backgroundColor: colors.secondary }]} />
              <View style={styles.routeInfo}>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>
                  DESTINATION
                </Text>
                <Text style={[styles.routeValue, { color: theme.colors.text }]}>
                  {shipment.destination_port?.name || 'Non spécifié'}
                </Text>
                {shipment.destination_port?.city && shipment.destination_port?.country && (
                  <Text style={[styles.routeSubvalue, { color: colors.textSecondary }]}>
                    {shipment.destination_port.city}, {shipment.destination_port.country}
                  </Text>
                )}
                {shipment.eta && (
                  <Text style={[styles.dateText, { color: colors.accent }]}>
                    ETA : {formatDate(shipment.eta)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Colis Section - Poids, Type, Options */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="inventory_2"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Détails du colis
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            {shipment.cargo_type && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type de cargaison</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {shipment.cargo_type}
                </Text>
              </View>
            )}

            {shipment.container_type && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type de conteneur</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {shipment.container_type}
                </Text>
              </View>
            )}

            {shipment.incoterm && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Incoterm</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {shipment.incoterm}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Prix Section */}
        {shipment.quoted_price && (
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol
                ios_icon_name="dollarsign.circle.fill"
                android_material_icon_name="payments"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Tarification
              </Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                Montant total
              </Text>
              <Text style={[styles.priceValue, { color: colors.primary }]}>
                {formatCurrency(shipment.quoted_price, shipment.currency)}
              </Text>
            </View>
          </View>
        )}

        {/* Historique (Timeline) Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="history"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Historique
            </Text>
          </View>

          {shipment.status_history && shipment.status_history.length > 0 ? (
            <View style={styles.timelineContainer}>
              {shipment.status_history.map((event, index) => (
                <View key={event.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                    {index < shipment.status_history!.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                  <View style={[styles.timelineContent, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                      {formatDateTime(event.timestamp)}
                      {event.location && ` — ${event.location}`}
                    </Text>
                    <Text style={[styles.timelineStatus, { color: theme.colors.text }]}>
                      {formatStatus(event.status)}
                    </Text>
                    {event.notes && (
                      <Text style={[styles.timelineNotes, { color: colors.textSecondary }]}>
                        {event.notes}
                      </Text>
                    )}
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

        {/* Notes Section */}
        {shipment.client_visible_notes && (
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol
                ios_icon_name="note.text"
                android_material_icon_name="note"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Notes
              </Text>
            </View>
            <Text style={[styles.notesText, { color: theme.colors.text }]}>
              {shipment.client_visible_notes}
            </Text>
          </View>
        )}

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
  statusCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  trackingNumber: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  lastUpdate: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 8,
  },
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
    gap: 16,
  },
  detailBlock: {
    gap: 12,
  },
  detailBlockTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailRow: {
    gap: 4,
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
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  routeContainer: {
    gap: 0,
  },
  routeStep: {
    flexDirection: 'row',
    gap: 16,
  },
  routeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  routeConnector: {
    width: 2,
    height: 32,
    marginLeft: 7,
    marginVertical: 8,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  routeSubvalue: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
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
  timelineStatus: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  timelineNotes: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
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
  notesText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
