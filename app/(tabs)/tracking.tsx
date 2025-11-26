
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/styles/commonStyles';
import { PageHeader } from '@/components/PageHeader';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/app/integrations/supabase/client';

interface TrackingEvent {
  date: string;
  location: string;
  description: string;
  notes?: string | null;
}

interface TrackingData {
  tracking_number: string;
  status: string;
  origin: {
    city: string;
    country: string;
  };
  destination: {
    city: string;
    country: string;
  };
  estimated_delivery_date: string | null;
  events: TrackingEvent[];
}

export default function TrackingScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  
  // Pre-fill tracking number if passed from confirmation screen
  const prefillTrackingNumber = params.prefill_tracking_number as string;

  const [trackingNumber, setTrackingNumber] = useState(prefillTrackingNumber || '');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  // VALIDATION: Tracking number
  const validateTrackingNumber = (): boolean => {
    setValidationError('');

    if (!trackingNumber.trim()) {
      setValidationError('Merci de saisir votre numéro de suivi.');
      return false;
    }

    if (trackingNumber.trim().length < 6) {
      setValidationError('Numéro de suivi trop court.');
      return false;
    }

    // Optional: Validate USS- format
    // if (!trackingNumber.startsWith('USS-')) {
    //   setValidationError('Numéro de suivi invalide.');
    //   return false;
    // }

    return true;
  };

  // API CALL: GET /shipments/tracking/{trackingNumber}
  const handleTrackShipment = async () => {
    console.log('[TRACKING] Track button pressed');

    // Step 1: Validate fields
    if (!validateTrackingNumber()) {
      console.log('[TRACKING] Validation failed');
      return;
    }

    // Step 2: Set loading state
    setLoading(true);
    setTrackingData(null);
    setTrackingError(null);

    try {
      console.log('[TRACKING] Calling public-tracking function with:', trackingNumber);

      // Step 3: Call API
      const { data, error: functionError } = await supabase.functions.invoke('public-tracking', {
        body: { tracking_number: trackingNumber.trim().toUpperCase() },
      });

      // Step 4: Set loading to false
      setLoading(false);

      if (functionError) {
        console.error('[TRACKING] Function error:', functionError);
        
        // Step 5: On error - set tracking_error
        setTrackingData(null);
        setTrackingError('Aucun colis trouvé pour ce numéro de suivi, ou service momentanément indisponible.');
        return;
      }

      // Step 6: On success - set tracking_data
      console.log('[TRACKING] Tracking data received:', data);
      setTrackingData(data);
      setTrackingError(null);
    } catch (error) {
      console.error('[TRACKING] Unexpected error:', error);
      setLoading(false);
      setTrackingData(null);
      setTrackingError('Aucun colis trouvé pour ce numéro de suivi, ou service momentanément indisponible.');
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'en_attente':
        return colors.warning;
      case 'in_transit':
      case 'en_transit':
        return colors.accent;
      case 'delivered':
      case 'livre':
        return colors.success;
      case 'cancelled':
      case 'annule':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'En attente';
      case 'in_transit':
        return 'En transit';
      case 'delivered':
        return 'Livré';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <ResponsiveContainer>
      <PageHeader title="Suivi de colis" showBack />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* SEARCH SECTION */}
        <View style={styles.searchSection}>
          <View style={styles.searchHeader}>
            <IconSymbol
              ios_icon_name="magnifyingglass.circle.fill"
              android_material_icon_name="search"
              size={28}
              color={colors.primary}
            />
            <Text style={[styles.searchTitle, { color: colors.text }]}>
              Rechercher votre colis
            </Text>
          </View>

          {/* INPUT: Tracking Number */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Numéro de suivi <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.card, 
                  color: colors.text, 
                  borderColor: validationError ? colors.error : colors.border,
                  borderWidth: validationError ? 2 : 1,
                }
              ]}
              value={trackingNumber}
              onChangeText={(text) => {
                setTrackingNumber(text);
                setValidationError('');
                setTrackingError(null);
              }}
              placeholder="Ex : USS-93F7X2A9"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              editable={!loading}
            />
            {validationError && (
              <View style={styles.errorContainer}>
                <IconSymbol
                  ios_icon_name="exclamationmark.circle.fill"
                  android_material_icon_name="error"
                  size={16}
                  color={colors.error}
                />
                <Text style={[styles.errorText, { color: colors.error }]}>{validationError}</Text>
              </View>
            )}
          </View>

          {/* BUTTON: Track Shipment */}
          <TouchableOpacity
            style={[
              styles.trackButton,
              { 
                backgroundColor: loading ? colors.textSecondary : colors.primary,
                opacity: loading ? 0.6 : 1,
              }
            ]}
            onPress={handleTrackShipment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <React.Fragment>
                <IconSymbol
                  ios_icon_name="location.fill"
                  android_material_icon_name="location_on"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.trackButtonText}>Suivre mon colis</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>
        </View>

        {/* ERROR DISPLAY BLOCK */}
        {trackingError && (
          <View style={[styles.errorBlock, { backgroundColor: colors.card, borderColor: colors.error }]}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="error"
              size={32}
              color={colors.error}
            />
            <Text style={[styles.errorBlockText, { color: colors.error }]}>
              {trackingError}
            </Text>
          </View>
        )}

        {/* TRACKING RESULTS - DISPLAY BLOCK (if tracking_data non null) */}
        {trackingData && (
          <View style={styles.resultsSection}>
            {/* STATUS CARD - Statut actuel */}
            <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
              <View style={styles.cardHeader}>
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Statut actuel
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Numéro de suivi */}
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Numéro de suivi :
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {trackingData.tracking_number}
                </Text>
              </View>

              {/* Statut */}
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Statut :
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trackingData.status) }]}>
                  <Text style={styles.statusBadgeText}>
                    {getStatusLabel(trackingData.status)}
                  </Text>
                </View>
              </View>

              {/* Origine */}
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Origine :
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {trackingData.origin.city}, {trackingData.origin.country}
                </Text>
              </View>

              {/* Destination */}
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Destination :
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {trackingData.destination.city}, {trackingData.destination.country}
                </Text>
              </View>

              {/* Livraison estimée */}
              {trackingData.estimated_delivery_date && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Livraison estimée :
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.accent }]}>
                    {formatDate(trackingData.estimated_delivery_date)}
                  </Text>
                </View>
              )}
            </View>

            {/* TIMELINE - Historique */}
            <View style={styles.timelineSection}>
              <View style={styles.cardHeader}>
                <IconSymbol
                  ios_icon_name="clock.fill"
                  android_material_icon_name="history"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Historique
                </Text>
              </View>

              {trackingData.events && trackingData.events.length > 0 ? (
                <View style={styles.timelineContainer}>
                  {trackingData.events.map((event, index) => (
                    <View key={index} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                        {index < trackingData.events.length - 1 && (
                          <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                        )}
                      </View>
                      <View style={[styles.timelineContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                          {formatDate(event.date)} — {event.location}
                        </Text>
                        <Text style={[styles.timelineDescription, { color: colors.text }]}>
                          {event.description}
                        </Text>
                        {event.notes && (
                          <Text style={[styles.timelineNotes, { color: colors.accent }]}>
                            {event.notes}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyTimeline, { backgroundColor: colors.card }]}>
                  <IconSymbol
                    ios_icon_name="exclamationmark.circle"
                    android_material_icon_name="info"
                    size={32}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.emptyTimelineText, { color: colors.textSecondary }]}>
                    Aucun événement de suivi disponible pour le moment.
                  </Text>
                </View>
              )}
            </View>

            {/* INFO BOX */}
            <View style={[styles.infoBox, { backgroundColor: colors.highlight }]}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Les informations de suivi sont mises à jour en temps réel. 
                Si vous avez des questions, contactez notre support.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  searchTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  errorBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 24,
    gap: 12,
  },
  errorBlockText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  resultsSection: {
    marginTop: 8,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  timelineSection: {
    marginBottom: 24,
  },
  timelineContainer: {
    paddingLeft: 8,
    marginTop: 16,
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineNotes: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyTimeline: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyTimelineText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
