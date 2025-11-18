
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams, Redirect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/app/integrations/supabase/client";
import { colors } from "@/styles/commonStyles";

interface Port {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
}

interface ShipmentDetail {
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
}

export default function ShipmentDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { id, shipment_id, tracking_number } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/client-space" />;
  }

  useEffect(() => {
    if (user && (id || shipment_id)) {
      loadShipmentDetail();
    }
  }, [user, id, shipment_id]);

  const loadShipmentDetail = async () => {
    try {
      setLoading(true);
      setUnauthorized(false);

      // First, get the client ID for the current user
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (clientError) {
        console.error('Error loading client:', clientError);
        Alert.alert(
          'Erreur',
          'Impossible de charger votre profil client. Veuillez réessayer.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        setLoading(false);
        return;
      }

      setClientId(clientData.id);

      // Determine which parameter to use for filtering
      const shipmentIdParam = id || shipment_id;

      // Load shipment detail with port information
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select(`
          *,
          origin_port:ports!shipments_origin_port_fkey(id, name, city, country),
          destination_port:ports!shipments_destination_port_fkey(id, name, city, country)
        `)
        .eq('id', shipmentIdParam)
        .single();

      if (shipmentError) {
        console.error('Error loading shipment:', shipmentError);
        Alert.alert(
          'Erreur',
          'Dossier introuvable.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        setLoading(false);
        return;
      }

      // Security check: Verify that the shipment belongs to the user's client
      if (shipmentData.client !== clientData.id) {
        console.warn('Unauthorized access attempt to shipment:', shipmentIdParam);
        setUnauthorized(true);
        setLoading(false);
        
        // Show error and redirect after a delay
        Alert.alert(
          'Accès refusé',
          'Vous n\'êtes pas autorisé à consulter ce dossier.',
          [
            { 
              text: 'OK', 
              onPress: () => router.replace('/(tabs)/client-dashboard') 
            }
          ]
        );
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.replace('/(tabs)/client-dashboard');
        }, 3000);
        
        return;
      }

      console.log('Shipment loaded successfully:', shipmentData);
      setShipment(shipmentData);
    } catch (error) {
      console.error('Error loading shipment detail:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du chargement du dossier.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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
  };

  const formatStatus = (status: string) => {
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
  };

  const getStatusIcon = (status: string) => {
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détail du dossier</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Chargement du dossier...</Text>
        </View>
      </View>
    );
  }

  // Unauthorized access state
  if (unauthorized) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/client-dashboard')}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détail du dossier</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.shield.fill"
            android_material_icon_name="block"
            size={64}
            color={colors.error}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Accès refusé</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Vous n&apos;êtes pas autorisé à consulter ce dossier.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/(tabs)/client-dashboard')}
          >
            <Text style={styles.primaryButtonText}>Retour au tableau de bord</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Shipment not found state
  if (!shipment) {
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détail du dossier</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="error"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Dossier introuvable</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Le dossier demandé n&apos;existe pas ou a été supprimé.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusIcon = getStatusIcon(shipment.current_status);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/client-dashboard')}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détail du dossier</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.pageTitleContainer}>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
            Dossier logistique – {shipment.tracking_number}
          </Text>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: getStatusColor(shipment.current_status) }]}>
          <IconSymbol
            ios_icon_name={statusIcon.ios}
            android_material_icon_name={statusIcon.android}
            size={48}
            color="#ffffff"
          />
          <Text style={styles.statusTitle}>{formatStatus(shipment.current_status)}</Text>
          <Text style={styles.trackingNumber}>N° de suivi : {shipment.tracking_number}</Text>
        </View>

        {/* Route Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Itinéraire</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routeStep}>
              <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
              <View style={styles.routeInfo}>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>Port d&apos;origine</Text>
                <Text style={[styles.routeValue, { color: theme.colors.text }]}>
                  {shipment.origin_port?.name || 'Non spécifié'}
                </Text>
                {shipment.origin_port?.city && shipment.origin_port?.country && (
                  <Text style={styles.routeSubvalue}>
                    {shipment.origin_port.city}, {shipment.origin_port.country}
                  </Text>
                )}
                {shipment.etd && (
                  <Text style={styles.dateText}>
                    ETD : {formatDateShort(shipment.etd)}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.routeConnector} />
            <View style={styles.routeStep}>
              <View style={[styles.routeDot, { backgroundColor: colors.secondary }]} />
              <View style={styles.routeInfo}>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>Port de destination</Text>
                <Text style={[styles.routeValue, { color: theme.colors.text }]}>
                  {shipment.destination_port?.name || 'Non spécifié'}
                </Text>
                {shipment.destination_port?.city && shipment.destination_port?.country && (
                  <Text style={styles.routeSubvalue}>
                    {shipment.destination_port.city}, {shipment.destination_port.country}
                  </Text>
                )}
                {shipment.eta && (
                  <Text style={styles.dateText}>
                    ETA : {formatDateShort(shipment.eta)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Shipment Details */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informations principales</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>N° de suivi</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {shipment.tracking_number}
              </Text>
            </View>

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

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Statut actuel</Text>
              <View style={[styles.inlineStatusBadge, { backgroundColor: getStatusColor(shipment.current_status) + '20' }]}>
                <Text style={[styles.inlineStatusText, { color: getStatusColor(shipment.current_status) }]}>
                  {formatStatus(shipment.current_status)}
                </Text>
              </View>
            </View>

            {shipment.etd && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date de départ estimée (ETD)</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {formatDate(shipment.etd)}
                </Text>
              </View>
            )}

            {shipment.eta && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date d&apos;arrivée estimée (ETA)</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {formatDate(shipment.eta)}
                </Text>
              </View>
            )}

            {shipment.last_update && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Dernière mise à jour</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {formatDate(shipment.last_update)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Client Visible Notes Section */}
        {shipment.client_visible_notes && (
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeaderWithIcon}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>
                Informations complémentaires
              </Text>
            </View>
            <Text style={[styles.notesText, { color: theme.colors.text }]}>
              {shipment.client_visible_notes}
            </Text>
          </View>
        )}

        {/* Shipment History Placeholder */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeaderWithIcon}>
            <IconSymbol
              ios_icon_name="clock.arrow.circlepath"
              android_material_icon_name="history"
              size={24}
              color={colors.textSecondary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>
              Historique / suivi avancé
            </Text>
          </View>
          <View style={styles.placeholderContainer}>
            <IconSymbol
              ios_icon_name="calendar.badge.clock"
              android_material_icon_name="event_note"
              size={40}
              color={colors.textSecondary}
            />
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              L&apos;historique détaillé des événements de ce dossier sera disponible dans une prochaine version.
            </Text>
          </View>
        </View>

        {/* Back to Dashboard Button */}
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity
            style={[styles.backToDashboardButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/client-dashboard')}
          >
            <IconSymbol
              ios_icon_name="arrow.left.circle.fill"
              android_material_icon_name="arrow_back"
              size={20}
              color="#ffffff"
            />
            <Text style={styles.backToDashboardText}>Retour au tableau de bord</Text>
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
    paddingBottom: 140,
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
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pageTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  trackingNumber: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
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
    backgroundColor: colors.border,
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
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  detailsGrid: {
    gap: 16,
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
  },
  inlineStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  inlineStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 24,
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  placeholderText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actionButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  backToDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  backToDashboardText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
