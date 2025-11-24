
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { supabase } from '@/app/integrations/supabase/client';

interface FreightQuote {
  id: string;
  client_email: string | null;
  client_name: string | null;
  cargo_type: string | null;
  volume_details: string | null;
  incoterm: string | null;
  desired_eta: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  internal_notes: string | null;
  service_id: string | null;
  ordered_as_shipment: string | null;
  origin_port: { id: string; name: string; country: string } | null;
  destination_port: { id: string; name: string; country: string } | null;
  services_global: { name_fr: string; name_en: string | null } | null;
  clients: { company_name: string; contact_name: string | null } | null;
}

export default function AdminQuoteDetailsContent() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<FreightQuote | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const loadQuote = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('freight_quotes')
        .select(`
          id,
          client_email,
          client_name,
          cargo_type,
          volume_details,
          incoterm,
          desired_eta,
          status,
          created_at,
          updated_at,
          internal_notes,
          service_id,
          ordered_as_shipment,
          origin_port:ports!freight_quotes_origin_port_fkey(id, name, country),
          destination_port:ports!freight_quotes_destination_port_fkey(id, name, country),
          services_global(name_fr, name_en),
          clients(company_name, contact_name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading quote:', error);
        Alert.alert('Erreur', 'Impossible de charger le devis.');
        router.back();
      } else {
        setQuote(data);
        setInternalNotes(data.internal_notes || '');
      }
    } catch (error) {
      console.error('Error loading quote:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  const handleSaveNotes = async () => {
    if (!quote) return;

    try {
      setSavingNotes(true);

      const { error } = await supabase
        .from('freight_quotes')
        .update({ internal_notes: internalNotes })
        .eq('id', quote.id);

      if (error) {
        console.error('Error saving notes:', error);
        Alert.alert('Erreur', 'Impossible de sauvegarder les notes.');
      } else {
        Alert.alert('Succès', 'Notes internes sauvegardées.');
        loadQuote();
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!quote) return;

    try {
      const { error } = await supabase
        .from('freight_quotes')
        .update({ status: newStatus })
        .eq('id', quote.id);

      if (error) {
        console.error('Error updating status:', error);
        Alert.alert('Erreur', 'Impossible de modifier le statut.');
      } else {
        Alert.alert('Succès', 'Statut mis à jour.');
        setShowStatusMenu(false);
        loadQuote();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const handleConvertToShipment = async () => {
    if (!quote) return;

    if (quote.ordered_as_shipment) {
      Alert.alert('Information', 'Ce devis a déjà été converti en shipment.');
      return;
    }

    Alert.alert(
      'Convertir en shipment',
      'Êtes-vous sûr de vouloir convertir ce devis en dossier logistique ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Convertir',
          onPress: async () => {
            try {
              // Create shipment
              const { data: shipmentData, error: shipmentError } = await supabase
                .from('shipments')
                .insert({
                  client: quote.clients ? undefined : null,
                  origin_port: quote.origin_port?.id,
                  destination_port: quote.destination_port?.id,
                  cargo_type: quote.cargo_type,
                  current_status: 'confirmed',
                  tracking_number: `SHP-${Date.now()}`,
                })
                .select()
                .single();

              if (shipmentError) {
                console.error('Error creating shipment:', shipmentError);
                Alert.alert('Erreur', 'Impossible de créer le shipment.');
                return;
              }

              // Update quote
              const { error: quoteError } = await supabase
                .from('freight_quotes')
                .update({
                  status: 'converted',
                  ordered_as_shipment: shipmentData.id,
                })
                .eq('id', quote.id);

              if (quoteError) {
                console.error('Error updating quote:', quoteError);
                Alert.alert('Erreur', 'Impossible de mettre à jour le devis.');
                return;
              }

              Alert.alert('Succès', 'Devis converti en shipment avec succès.', [
                {
                  text: 'Voir le shipment',
                  onPress: () => router.push(`/(tabs)/admin-shipment-details?id=${shipmentData.id}`),
                },
                {
                  text: 'OK',
                  onPress: () => loadQuote(),
                },
              ]);
            } catch (error) {
              console.error('Error converting to shipment:', error);
              Alert.alert('Erreur', 'Une erreur est survenue.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      received: 'Reçu',
      in_progress: 'En cours',
      sent_to_client: 'Envoyé',
      accepted: 'Accepté',
      refused: 'Refusé',
      pending: 'En attente',
      in_review: 'En révision',
      quoted: 'Devisé',
      converted: 'Converti',
      rejected: 'Rejeté',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'converted':
        return '#10b981';
      case 'in_progress':
      case 'in_review':
        return colors.primary;
      case 'sent_to_client':
      case 'quoted':
        return '#f59e0b';
      case 'refused':
      case 'rejected':
        return '#ef4444';
      case 'received':
      case 'pending':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement du devis...
          </Text>
        </View>
      </View>
    );
  }

  if (!quote) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Devis introuvable
          </Text>
        </View>
      </View>
    );
  }

  const statusOptions = [
    { value: 'pending', label: 'En attente' },
    { value: 'in_review', label: 'En révision' },
    { value: 'quoted', label: 'Devisé' },
    { value: 'converted', label: 'Converti' },
    { value: 'rejected', label: 'Rejeté' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow_back"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Détails du Devis
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Section */}
        <View style={styles.section}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                {formatStatus(quote.status)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.changeStatusButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowStatusMenu(!showStatusMenu)}
            >
              <Text style={styles.changeStatusButtonText}>Modifier statut</Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="expand_more"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {showStatusMenu && (
            <View style={[styles.statusMenu, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusMenuItem,
                    quote.status === option.value && { backgroundColor: colors.primary + '10' },
                  ]}
                  onPress={() => handleChangeStatus(option.value)}
                >
                  <Text
                    style={[
                      styles.statusMenuItemText,
                      { color: quote.status === option.value ? colors.primary : theme.colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {quote.status === option.value && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Client Information */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Informations Client
          </Text>

          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Nom
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {quote.client_name || quote.clients?.contact_name || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="building.2.fill"
              android_material_icon_name="business"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Société
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {quote.clients?.company_name || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Email
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {quote.client_email || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Shipment Details */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Détails de l&apos;Expédition
          </Text>

          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="place"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Port d&apos;origine
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {quote.origin_port?.name || 'N/A'}, {quote.origin_port?.country || ''}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="place"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Port de destination
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {quote.destination_port?.name || 'N/A'}, {quote.destination_port?.country || ''}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="inventory_2"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Type de cargo
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {quote.cargo_type || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="cube.box.fill"
              android_material_icon_name="inventory"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Détails du volume
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {quote.volume_details || 'N/A'}
              </Text>
            </View>
          </View>

          {quote.incoterm && (
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="doc.text.fill"
                android_material_icon_name="description"
                size={20}
                color={colors.textSecondary}
              />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Incoterm
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {quote.incoterm}
                </Text>
              </View>
            </View>
          )}

          {quote.desired_eta && (
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="event"
                size={20}
                color={colors.textSecondary}
              />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  ETA souhaitée
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {formatDate(quote.desired_eta)}
                </Text>
              </View>
            </View>
          )}

          {quote.services_global && (
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="wrench.and.screwdriver.fill"
                android_material_icon_name="build"
                size={20}
                color={colors.textSecondary}
              />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Service
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {quote.services_global.name_fr}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Internal Notes */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Notes Internes
          </Text>

          <TextInput
            style={[styles.notesInput, { color: theme.colors.text, borderColor: colors.border }]}
            placeholder="Ajouter des notes internes..."
            placeholderTextColor={colors.textSecondary}
            value={internalNotes}
            onChangeText={setInternalNotes}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSaveNotes}
            disabled={savingNotes}
          >
            {savingNotes ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="checkmark"
                  android_material_icon_name="check"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.saveButtonText}>Sauvegarder les notes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleConvertToShipment}
            disabled={quote.status === 'converted'}
          >
            <IconSymbol
              ios_icon_name="arrow.right.circle.fill"
              android_material_icon_name="arrow_forward"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>
              {quote.status === 'converted' ? 'Déjà converti' : 'Convertir en shipment'}
            </Text>
          </TouchableOpacity>

          {quote.ordered_as_shipment && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => router.push(`/(tabs)/admin-shipment-details?id=${quote.ordered_as_shipment}`)}
            >
              <IconSymbol
                ios_icon_name="shippingbox.fill"
                android_material_icon_name="inventory_2"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>Voir le shipment</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Metadata */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Métadonnées
          </Text>

          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="event"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Créé le
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatDate(quote.created_at)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="schedule"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Mis à jour le
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatDate(quote.updated_at)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  changeStatusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusMenu: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statusMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusMenuItemText: {
    fontSize: 16,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionsSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
