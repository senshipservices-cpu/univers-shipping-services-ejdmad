
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
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
  status: string;
  location: string;
  date: string;
  notes?: string | null;
}

interface TrackingData {
  tracking_number: string;
  status: string;
  origin: string;
  destination: string;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  created_at: string;
  timeline: TrackingEvent[];
}

export default function TrackingScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  
  // Pre-fill tracking number if passed from confirmation screen
  const prefillTrackingNumber = params.prefill_tracking_number as string;

  const [trackingNumber, setTrackingNumber] = useState(prefillTrackingNumber || '');
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string>('');

  // VALIDATION: Tracking number
  const validateTrackingNumber = (): boolean => {
    setError('');

    if (!trackingNumber.trim()) {
      setError('Merci de saisir votre numéro de suivi.');
      return false;
    }

    if (trackingNumber.trim().length < 6) {
      setError('Numéro de suivi trop court.');
      return false;
    }

    // Optional: Validate USS- format
    // if (!trackingNumber.startsWith('USS-')) {
    //   setError('Numéro de suivi invalide.');
    //   return false;
    // }

    return true;
  };

  // API CALL: GET /shipments/tracking/{trackingNumber}
  const handleTrackShipment = async () => {
    console.log('[TRACKING] Track button pressed');

    // Validate form
    if (!validateTrackingNumber()) {
      return;
    }

    // Disable button during API call
    setLoading(true);
    setButtonDisabled(true);
    setTrackingData(null);

    try {
      console.log('[TRACKING] Calling public-tracking function with:', trackingNumber);

      // Call Supabase Edge Function for public tracking
      const { data, error: functionError } = await supabase.functions.invoke('public-tracking', {
        body: { tracking_number: trackingNumber.trim().toUpperCase() },
      });

      if (functionError) {
        console.error('[TRACKING] Function error:', functionError);
        
        if (functionError.message?.includes('404') || functionError.message?.includes('introuvable')) {
          Alert.alert('Erreur', 'Expédition introuvable. Vérifiez votre numéro de suivi.');
        } else if (functionError.message?.includes('400') || functionError.message?.includes('invalide')) {
          Alert.alert('Erreur', 'Format de numéro de suivi invalide.');
        } else {
          Alert.alert('Erreur', 'Service indisponible. Veuillez réessayer plus tard.');
        }
        return;
      }

      console.log('[TRACKING] Tracking data received:', data);
      setTrackingData(data);
    } catch (error) {
      console.error('[TRACKING] Unexpected error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite.');
    } finally {
      setLoading(false);
      setButtonDisabled(false);
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
                  borderColor: error ? colors.error : colors.border,
                  borderWidth: error ? 2 : 1,
                }
              ]}
              value={trackingNumber}
              onChangeText={(text) => {
                setTrackingNumber(text);
                setError('');
              }}
              placeholder="Ex : USS-93F7X2A9"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              editable={!loading}
            />
            {error && (
              <View style={styles.errorContainer}>
                <IconSymbol
                  ios_icon_name="exclamationmark.circle.fill"
                  android_material_icon_name="error"
                  size={16}
                  color={colors.error}
                />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}
          </View>

          {/* BUTTON: Track Shipment */}
          <TouchableOpacity
            style={[
              styles.trackButton,
              { 
                backgroundColor: buttonDisabled ? colors.textSecondary : colors.primary,
                opacity: buttonDisabled ? 0.6 : 1,
              }
            ]}
            onPress={handleTrackShipment}
            disabled={buttonDisabled}
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

        {/* TRACKING RESULTS */}
        {trackingData && (
          <View style={styles.resultsSection}>
            {/* STATUS CARD */}
            <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trackingData.status) }]}>
                  <IconSymbol
                    ios_icon_name={trackingData.status === 'delivered' ? 'checkmark.circle.fill' : 'shippingbox.fill'}
                    android_material_icon_name={trackingData.status === 'delivered' ? 'check_circle' : 'local_shipping'}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.statusInfo}>
                  <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                    Statut actuel
                  </Text>
                  <Text style={[styles.statusValue, { color: getStatusColor(trackingData.status) }]}>
                    {getStatusLabel(trackingData.status)}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* TRACKING NUMBER */}
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <IconSymbol
                    ios_icon_name="number.circle.fill"
                    android_material_icon_name="tag"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Numéro de suivi
                  </Text>
                </View>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {trackingData.tracking_number}
                </Text>
              </View>

              {/* ORIGIN */}
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <IconSymbol
                    ios_icon_name="location.circle.fill"
                    android_material_icon_name="place"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Origine
                  </Text>
                </View>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {trackingData.origin}
                </Text>
              </View>

              {/* DESTINATION */}
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <IconSymbol
                    ios_icon_name="flag.circle.fill"
                    android_material_icon_name="flag"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Destination
                  </Text>
                </View>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {trackingData.destination}
                </Text>
              </View>

              {/* ESTIMATED ARRIVAL */}
              {trackingData.estimated_arrival && (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelContainer}>
                    <IconSymbol
                      ios_icon_name="calendar.circle.fill"
                      android_material_icon_name="event"
                      size={18}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Livraison estimée
                    </Text>
                  </View>
                  <Text style={[styles.detailValue, { color: colors.accent }]}>
                    {formatDate(trackingData.estimated_arrival)}
                  </Text>
                </View>
              )}

              {/* ACTUAL ARRIVAL */}
              {trackingData.actual_arrival && (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelContainer}>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check_circle"
                      size={18}
                      color={colors.success}
                    />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Livré le
                    </Text>
                  </View>
                  <Text style={[styles.detailValue, { color: colors.success }]}>
                    {formatDate(trackingData.actual_arrival)}
                  </Text>
                </View>
              )}
            </View>

            {/* TIMELINE */}
            <View style={styles.timelineSection}>
              <View style={styles.timelineHeader}>
                <IconSymbol
                  ios_icon_name="clock.fill"
                  android_material_icon_name="history"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.timelineTitle, { color: colors.text }]}>
                  Historique de suivi
                </Text>
              </View>

              {trackingData.timeline && trackingData.timeline.length > 0 ? (
                <View style={styles.timelineContainer}>
                  {trackingData.timeline.map((event, index) => (
                    <View key={index} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                        {index < trackingData.timeline.length - 1 && (
                          <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                        )}
                      </View>
                      <View style={[styles.timelineContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                          {formatDate(event.date)}
                        </Text>
                        <Text style={[styles.timelineLocation, { color: colors.text }]}>
                          {event.location}
                        </Text>
                        <Text style={[styles.timelineDescription, { color: colors.textSecondary }]}>
                          {event.status}
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
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  statusBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 22,
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
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  timelineSection: {
    marginBottom: 24,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  timelineTitle: {
    fontSize: 20,
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
    marginBottom: 4,
  },
  timelineLocation: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
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
