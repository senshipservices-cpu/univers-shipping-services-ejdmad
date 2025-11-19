
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
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';

interface FreightQuote {
  id: string;
  client: string | null;
  client_email: string | null;
  client_name: string | null;
  origin_port: string;
  destination_port: string;
  cargo_type: string | null;
  volume_details: string | null;
  incoterm: string | null;
  desired_eta: string | null;
  status: string;
  quote_amount: number | null;
  quote_currency: string;
  payment_status: string;
  client_decision: string | null;
  can_pay_online: boolean;
  ordered_as_shipment: string | null;
  service_id: string | null;
  created_at: string;
  updated_at: string;
  origin_port_data?: { name: string; country: string };
  destination_port_data?: { name: string; country: string };
  service_data?: { name_fr: string; name_en: string };
  client_data?: { company_name: string; email: string };
}

export default function AdminQuoteDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const params = useLocalSearchParams();
  const quoteId = params.quote_id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState<FreightQuote | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');

  const loadQuoteDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('freight_quotes')
        .select(`
          *,
          origin_port_data:ports!freight_quotes_origin_port_fkey(name, country),
          destination_port_data:ports!freight_quotes_destination_port_fkey(name, country),
          service_data:services_global(name_fr, name_en),
          client_data:clients(company_name, email)
        `)
        .eq('id', quoteId)
        .single();

      if (error) {
        console.error('Error loading quote details:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails du devis.');
        router.back();
      } else {
        setQuote(data);
      }
    } catch (error) {
      console.error('Exception loading quote details:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [quoteId, router]);

  useEffect(() => {
    if (isAdmin && quoteId) {
      loadQuoteDetails();
    }
  }, [isAdmin, quoteId, loadQuoteDetails]);

  const openEditModal = (field: string, currentValue: string | number | null) => {
    setEditField(field);
    setEditValue(currentValue?.toString() || '');
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!quote) return;

    try {
      setSaving(true);
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Convert value based on field type
      if (editField === 'quote_amount') {
        updateData[editField] = parseFloat(editValue) || null;
      } else {
        updateData[editField] = editValue;
      }

      const { error } = await supabase
        .from('freight_quotes')
        .update(updateData)
        .eq('id', quote.id);

      if (error) {
        console.error('Error updating quote:', error);
        Alert.alert('Erreur', 'Impossible de mettre à jour le devis.');
      } else {
        Alert.alert('Succès', 'Devis mis à jour avec succès.');
        setEditModalVisible(false);
        loadQuoteDetails();
      }
    } catch (error) {
      console.error('Exception updating quote:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const sendToClient = async () => {
    if (!quote) return;

    Alert.alert(
      'Envoyer au client',
      'Êtes-vous sûr de vouloir envoyer ce devis au client ? Un email sera envoyé automatiquement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: async () => {
            try {
              setSaving(true);

              // Update status to sent_to_client
              const { error: updateError } = await supabase
                .from('freight_quotes')
                .update({
                  status: 'sent_to_client',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', quote.id);

              if (updateError) {
                console.error('Error updating quote status:', updateError);
                Alert.alert('Erreur', 'Impossible de mettre à jour le statut du devis.');
                return;
              }

              // Create email notification
              const emailData = {
                recipient_email: quote.client_email || quote.client_data?.email,
                email_type: 'quote_sent',
                subject: language === 'fr' ? 'Votre devis UNIVERSAL SHIPPING SERVICES' : 'Your UNIVERSAL SHIPPING SERVICES Quote',
                body: language === 'fr'
                  ? `Bonjour ${quote.client_name || 'Client'},\n\nVotre devis est prêt.\n\nMontant: ${quote.quote_amount} ${quote.quote_currency}\n\nCordialement,\nL'équipe UNIVERSAL SHIPPING SERVICES`
                  : `Hello ${quote.client_name || 'Client'},\n\nYour quote is ready.\n\nAmount: ${quote.quote_amount} ${quote.quote_currency}\n\nBest regards,\nThe UNIVERSAL SHIPPING SERVICES team`,
                metadata: {
                  quote_id: quote.id,
                  quote_amount: quote.quote_amount,
                  quote_currency: quote.quote_currency,
                },
                status: 'pending',
              };

              const { error: emailError } = await supabase
                .from('email_notifications')
                .insert(emailData);

              if (emailError) {
                console.error('Error creating email notification:', emailError);
                Alert.alert('Avertissement', 'Le statut a été mis à jour mais l\'email n\'a pas pu être envoyé.');
              } else {
                Alert.alert('Succès', 'Le devis a été envoyé au client avec succès.');
              }

              loadQuoteDetails();
            } catch (error) {
              console.error('Exception sending quote to client:', error);
              Alert.alert('Erreur', 'Une erreur est survenue.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const forceAcceptance = async () => {
    if (!quote) return;

    Alert.alert(
      'Forcer l\'acceptation',
      'Êtes-vous sûr de vouloir forcer l\'acceptation de ce devis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setSaving(true);

              const { error } = await supabase
                .from('freight_quotes')
                .update({
                  client_decision: 'accepted',
                  status: 'accepted',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', quote.id);

              if (error) {
                console.error('Error forcing acceptance:', error);
                Alert.alert('Erreur', 'Impossible de forcer l\'acceptation.');
              } else {
                Alert.alert('Succès', 'Le devis a été marqué comme accepté.');
                loadQuoteDetails();
              }
            } catch (error) {
              console.error('Exception forcing acceptance:', error);
              Alert.alert('Erreur', 'Une erreur est survenue.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const createShipment = async () => {
    if (!quote) return;

    Alert.alert(
      'Créer une expédition',
      'Êtes-vous sûr de vouloir créer une expédition à partir de ce devis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Créer',
          onPress: async () => {
            try {
              setSaving(true);

              // Generate tracking number
              const trackingNumber = `USS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

              // Create shipment
              const shipmentData = {
                tracking_number: trackingNumber,
                client: quote.client,
                origin_port: quote.origin_port,
                destination_port: quote.destination_port,
                cargo_type: quote.cargo_type,
                incoterm: quote.incoterm,
                current_status: 'confirmed',
                eta: quote.desired_eta,
                client_visible_notes: `Créé à partir du devis #${quote.id.substring(0, 8)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };

              const { data: shipmentResult, error: shipmentError } = await supabase
                .from('shipments')
                .insert(shipmentData)
                .select()
                .single();

              if (shipmentError) {
                console.error('Error creating shipment:', shipmentError);
                Alert.alert('Erreur', 'Impossible de créer l\'expédition.');
                return;
              }

              // Update quote with shipment reference
              const { error: updateError } = await supabase
                .from('freight_quotes')
                .update({
                  ordered_as_shipment: shipmentResult.id,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', quote.id);

              if (updateError) {
                console.error('Error updating quote with shipment reference:', updateError);
              }

              Alert.alert(
                'Succès',
                `Expédition créée avec succès.\n\nNuméro de suivi: ${trackingNumber}`,
                [
                  {
                    text: 'OK',
                    onPress: () => loadQuoteDetails(),
                  },
                ]
              );
            } catch (error) {
              console.error('Exception creating shipment:', error);
              Alert.alert('Erreur', 'Une erreur est survenue.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      received: colors.textSecondary,
      in_progress: colors.primary,
      sent_to_client: '#f59e0b',
      accepted: '#10b981',
      refused: '#ef4444',
      pending: colors.textSecondary,
      paid: '#10b981',
      failed: '#ef4444',
    };
    return statusColors[status] || colors.textSecondary;
  };

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  if (!quoteId) {
    return <Redirect href="/(tabs)/admin-dashboard" />;
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow_back"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails du devis</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!quote) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow_back"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails du devis</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>Devis introuvable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails du devis</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Quote ID */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Identifiant</Text>
          <Text style={[styles.quoteId, { color: colors.textSecondary }]}>#{quote.id.substring(0, 8)}</Text>
        </View>

        {/* Status Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Statut</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                {formatStatus(quote.status)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => openEditModal('status', quote.status)}
            >
              <IconSymbol
                ios_icon_name="pencil.circle"
                android_material_icon_name="edit"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Client Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informations client</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nom:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {quote.client_name || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {quote.client_email || quote.client_data?.email || 'N/A'}
            </Text>
          </View>
          {quote.client_data && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Société:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {quote.client_data.company_name}
              </Text>
            </View>
          )}
        </View>

        {/* Service Information */}
        {quote.service_data && (
          <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Service</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {language === 'fr' ? quote.service_data.name_fr : quote.service_data.name_en || quote.service_data.name_fr}
            </Text>
          </View>
        )}

        {/* Shipment Details */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Détails de l&apos;expédition</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Port d&apos;origine:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {quote.origin_port_data?.name || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Port de destination:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {quote.destination_port_data?.name || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type de cargo:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {quote.cargo_type || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Volume:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {quote.volume_details || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Incoterm:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {quote.incoterm || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>ETA souhaitée:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {formatDate(quote.desired_eta)}
            </Text>
          </View>
        </View>

        {/* Quote Amount - Editable */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Montant du devis</Text>
          <View style={styles.editableRow}>
            <View style={styles.editableContent}>
              <Text style={[styles.amountText, { color: theme.colors.text }]}>
                {quote.quote_amount ? `${quote.quote_amount} ${quote.quote_currency}` : 'Non défini'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => openEditModal('quote_amount', quote.quote_amount)}
            >
              <IconSymbol
                ios_icon_name="pencil.circle"
                android_material_icon_name="edit"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quote Currency - Editable */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Devise</Text>
          <View style={styles.editableRow}>
            <View style={styles.editableContent}>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {quote.quote_currency}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => openEditModal('quote_currency', quote.quote_currency)}
            >
              <IconSymbol
                ios_icon_name="pencil.circle"
                android_material_icon_name="edit"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Client Decision - Editable */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Décision client</Text>
          <View style={styles.editableRow}>
            <View style={styles.editableContent}>
              {quote.client_decision ? (
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.client_decision) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(quote.client_decision) }]}>
                    {formatStatus(quote.client_decision)}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.infoValue, { color: colors.textSecondary }]}>En attente</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => openEditModal('client_decision', quote.client_decision)}
            >
              <IconSymbol
                ios_icon_name="pencil.circle"
                android_material_icon_name="edit"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Status - Editable */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Statut de paiement</Text>
          <View style={styles.editableRow}>
            <View style={styles.editableContent}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.payment_status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(quote.payment_status) }]}>
                  {formatStatus(quote.payment_status)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => openEditModal('payment_status', quote.payment_status)}
            >
              <IconSymbol
                ios_icon_name="pencil.circle"
                android_material_icon_name="edit"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Shipment Reference */}
        {quote.ordered_as_shipment && (
          <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Expédition créée</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              #{quote.ordered_as_shipment.substring(0, 8)}
            </Text>
          </View>
        )}

        {/* Timestamps */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dates</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Créé le:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {formatDate(quote.created_at)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Mis à jour le:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {formatDate(quote.updated_at)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
            onPress={sendToClient}
            disabled={saving || quote.status === 'sent_to_client'}
          >
            <IconSymbol
              ios_icon_name="paperplane.fill"
              android_material_icon_name="send"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>
              {quote.status === 'sent_to_client' ? 'Déjà envoyé' : 'Envoyer au client'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={forceAcceptance}
            disabled={saving || quote.client_decision === 'accepted'}
          >
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check_circle"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>
              {quote.client_decision === 'accepted' ? 'Déjà accepté' : 'Forcer acceptation'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={createShipment}
            disabled={saving || !!quote.ordered_as_shipment}
          >
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="inventory_2"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>
              {quote.ordered_as_shipment ? 'Expédition créée' : 'Créer Shipment'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Modifier {editField === 'quote_amount' ? 'le montant' : editField === 'quote_currency' ? 'la devise' : editField === 'status' ? 'le statut' : editField === 'client_decision' ? 'la décision' : 'le statut de paiement'}
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {editField === 'status' ? (
                <View style={styles.optionsContainer}>
                  {['received', 'in_progress', 'sent_to_client', 'accepted', 'refused'].map((status, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: editValue === status ? colors.primary + '20' : theme.colors.background,
                          borderColor: editValue === status ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setEditValue(status)}
                    >
                      <Text style={[styles.optionText, { color: editValue === status ? colors.primary : theme.colors.text }]}>
                        {formatStatus(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : editField === 'client_decision' ? (
                <View style={styles.optionsContainer}>
                  {['pending', 'accepted', 'refused'].map((decision, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: editValue === decision ? colors.primary + '20' : theme.colors.background,
                          borderColor: editValue === decision ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setEditValue(decision)}
                    >
                      <Text style={[styles.optionText, { color: editValue === decision ? colors.primary : theme.colors.text }]}>
                        {formatStatus(decision)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : editField === 'payment_status' ? (
                <View style={styles.optionsContainer}>
                  {['pending', 'paid', 'failed', 'refunded'].map((status, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: editValue === status ? colors.primary + '20' : theme.colors.background,
                          borderColor: editValue === status ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setEditValue(status)}
                    >
                      <Text style={[styles.optionText, { color: editValue === status ? colors.primary : theme.colors.text }]}>
                        {formatStatus(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : editField === 'quote_currency' ? (
                <View style={styles.optionsContainer}>
                  {['EUR', 'USD', 'GBP', 'XOF', 'MAD'].map((currency, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: editValue === currency ? colors.primary + '20' : theme.colors.background,
                          borderColor: editValue === currency ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setEditValue(currency)}
                    >
                      <Text style={[styles.optionText, { color: editValue === currency ? colors.primary : theme.colors.text }]}>
                        {currency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: colors.border }]}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder={editField === 'quote_amount' ? 'Entrez le montant' : 'Entrez la valeur'}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType={editField === 'quote_amount' ? 'numeric' : 'default'}
                />
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={saveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
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
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  quoteId: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editIconButton: {
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editableContent: {
    flex: 1,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
