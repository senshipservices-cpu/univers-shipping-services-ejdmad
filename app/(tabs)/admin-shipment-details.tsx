
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
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';

interface Shipment {
  id: string;
  tracking_number: string;
  current_status: string;
  origin_port: string;
  destination_port: string;
  cargo_type: string | null;
  container_type: string | null;
  incoterm: string | null;
  eta: string | null;
  etd: string | null;
  last_update: string | null;
  internal_notes: string | null;
  client_visible_notes: string | null;
  client: string;
  created_at: string;
  updated_at: string;
  origin_port_data?: { name: string; city: string | null; country: string | null };
  destination_port_data?: { name: string; city: string | null; country: string | null };
  client_data?: { company_name: string; email: string | null; contact_name: string | null };
}

interface ShipmentDocument {
  id: string;
  file_name: string;
  file_path: string;
  type: string;
  file_size: number | null;
  uploaded_at: string;
}

export default function AdminShipmentDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const params = useLocalSearchParams();
  const shipmentId = params.shipment_id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [documents, setDocuments] = useState<ShipmentDocument[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [notesType, setNotesType] = useState<'internal' | 'client'>('internal');
  const [notesValue, setNotesValue] = useState('');

  const loadShipmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          origin_port_data:ports!shipments_origin_port_fkey(name, city, country),
          destination_port_data:ports!shipments_destination_port_fkey(name, city, country),
          client_data:clients(company_name, email, contact_name)
        `)
        .eq('id', shipmentId)
        .single();

      if (error) {
        console.error('Error loading shipment details:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails de l\'expédition.');
        router.back();
      } else {
        setShipment(data);
      }
    } catch (error) {
      console.error('Exception loading shipment details:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [shipmentId, router]);

  const loadDocuments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('shipment_documents')
        .select('*')
        .eq('shipment', shipmentId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error loading documents:', error);
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Exception loading documents:', error);
    }
  }, [shipmentId]);

  useEffect(() => {
    if (isAdmin && shipmentId) {
      loadShipmentDetails();
      loadDocuments();
    }
  }, [isAdmin, shipmentId, loadShipmentDetails, loadDocuments]);

  const openEditModal = () => {
    if (!shipment) return;
    setEditValue(shipment.current_status);
    setEditModalVisible(true);
  };

  const saveStatusEdit = async () => {
    if (!shipment) return;

    try {
      setSaving(true);
      const updateData = {
        current_status: editValue,
        last_update: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('shipments')
        .update(updateData)
        .eq('id', shipment.id);

      if (error) {
        console.error('Error updating shipment status:', error);
        Alert.alert('Erreur', 'Impossible de mettre à jour le statut de l\'expédition.');
      } else {
        // Log event
        await supabase.from('events_log').insert({
          event_type: 'shipment_status_changed',
          user_id: user?.id,
          shipment_id: shipment.id,
          details: `Status changed from ${shipment.current_status} to ${editValue}`,
        });

        Alert.alert('Succès', 'Statut de l\'expédition mis à jour avec succès.');
        setEditModalVisible(false);
        loadShipmentDetails();
      }
    } catch (error) {
      console.error('Exception updating shipment status:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const openNotesModal = (type: 'internal' | 'client') => {
    if (!shipment) return;
    setNotesType(type);
    setNotesValue(type === 'internal' ? shipment.internal_notes || '' : shipment.client_visible_notes || '');
    setNotesModalVisible(true);
  };

  const saveNotes = async () => {
    if (!shipment) return;

    try {
      setSaving(true);
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (notesType === 'internal') {
        updateData.internal_notes = notesValue;
      } else {
        updateData.client_visible_notes = notesValue;
      }

      const { error } = await supabase
        .from('shipments')
        .update(updateData)
        .eq('id', shipment.id);

      if (error) {
        console.error('Error updating notes:', error);
        Alert.alert('Erreur', 'Impossible de mettre à jour les notes.');
      } else {
        Alert.alert('Succès', 'Notes mises à jour avec succès.');
        setNotesModalVisible(false);
        loadShipmentDetails();
      }
    } catch (error) {
      console.error('Exception updating notes:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const sendClientUpdate = async () => {
    if (!shipment) return;

    Alert.alert(
      'Envoyer mise à jour client',
      'Êtes-vous sûr de vouloir envoyer une mise à jour au client ? Un email sera envoyé automatiquement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: async () => {
            try {
              setSaving(true);

              // Create email notification
              const emailData = {
                recipient_email: shipment.client_data?.email,
                email_type: 'shipment_update',
                subject: language === 'fr' 
                  ? `Mise à jour de votre expédition ${shipment.tracking_number}` 
                  : `Update on your shipment ${shipment.tracking_number}`,
                body: language === 'fr'
                  ? `Bonjour ${shipment.client_data?.contact_name || 'Client'},\n\nVotre expédition ${shipment.tracking_number} a été mise à jour.\n\nStatut actuel: ${formatStatus(shipment.current_status)}\n\n${shipment.client_visible_notes ? `Notes: ${shipment.client_visible_notes}\n\n` : ''}Cordialement,\nL'équipe UNIVERSAL SHIPPING SERVICES`
                  : `Hello ${shipment.client_data?.contact_name || 'Client'},\n\nYour shipment ${shipment.tracking_number} has been updated.\n\nCurrent status: ${formatStatus(shipment.current_status)}\n\n${shipment.client_visible_notes ? `Notes: ${shipment.client_visible_notes}\n\n` : ''}Best regards,\nThe UNIVERSAL SHIPPING SERVICES team`,
                metadata: {
                  shipment_id: shipment.id,
                  tracking_number: shipment.tracking_number,
                  current_status: shipment.current_status,
                },
                status: 'pending',
              };

              const { error: emailError } = await supabase
                .from('email_notifications')
                .insert(emailData);

              if (emailError) {
                console.error('Error creating email notification:', emailError);
                Alert.alert('Erreur', 'Impossible d\'envoyer l\'email de mise à jour.');
              } else {
                // Update last_update timestamp
                await supabase
                  .from('shipments')
                  .update({ last_update: new Date().toISOString() })
                  .eq('id', shipment.id);

                Alert.alert('Succès', 'La mise à jour a été envoyée au client avec succès.');
                loadShipmentDetails();
              }
            } catch (error) {
              console.error('Exception sending client update:', error);
              Alert.alert('Erreur', 'Une erreur est survenue.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const addDocument = () => {
    Alert.alert(
      'Ajouter un document',
      'La fonctionnalité d\'ajout de documents sera disponible dans une prochaine version. Pour l\'instant, vous pouvez gérer les documents via l\'interface Supabase Storage.',
      [{ text: 'OK' }]
    );
  };

  const forceDelivery = async () => {
    if (!shipment) return;

    Alert.alert(
      'Forcer la livraison',
      'Êtes-vous sûr de vouloir marquer cette expédition comme livrée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setSaving(true);

              const { error } = await supabase
                .from('shipments')
                .update({
                  current_status: 'delivered',
                  last_update: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', shipment.id);

              if (error) {
                console.error('Error forcing delivery:', error);
                Alert.alert('Erreur', 'Impossible de forcer la livraison.');
              } else {
                // Log event
                await supabase.from('events_log').insert({
                  event_type: 'shipment_delivered',
                  user_id: user?.id,
                  shipment_id: shipment.id,
                  details: 'Delivery forced by admin',
                });

                Alert.alert('Succès', 'L\'expédition a été marquée comme livrée.');
                loadShipmentDetails();
              }
            } catch (error) {
              console.error('Exception forcing delivery:', error);
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

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'draft': colors.textSecondary,
      'quote_pending': '#f59e0b',
      'confirmed': colors.primary,
      'in_transit': colors.primary,
      'at_port': '#f59e0b',
      'delivered': '#10b981',
      'on_hold': '#ef4444',
      'cancelled': '#ef4444',
    };
    return statusColors[status] || colors.textSecondary;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  if (!shipmentId) {
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails de l&apos;expédition</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!shipment) {
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails de l&apos;expédition</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>Expédition introuvable</Text>
        </View>
      </View>
    );
  }

  const shipmentStatuses = [
    'draft',
    'quote_pending',
    'confirmed',
    'in_transit',
    'at_port',
    'delivered',
    'on_hold',
    'cancelled'
  ];

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails de l&apos;expédition</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Tracking Number */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Numéro de suivi</Text>
          <Text style={[styles.trackingNumber, { color: colors.primary }]}>{shipment.tracking_number}</Text>
        </View>

        {/* Status Section - Editable */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Statut actuel</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipment.current_status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(shipment.current_status) }]}>
                {formatStatus(shipment.current_status)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={openEditModal}
            >
              <IconSymbol
                ios_icon_name="pencil"
                android_material_icon_name="edit"
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Client Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informations client</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Société:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {shipment.client_data?.company_name || 'N/A'}
            </Text>
          </View>
          {shipment.client_data?.contact_name && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Contact:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {shipment.client_data.contact_name}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {shipment.client_data?.email || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Shipment Details */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Détails de l&apos;expédition</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Port d&apos;origine:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {shipment.origin_port_data?.name || 'N/A'}
              {shipment.origin_port_data?.country && ` (${shipment.origin_port_data.country})`}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Port de destination:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {shipment.destination_port_data?.name || 'N/A'}
              {shipment.destination_port_data?.country && ` (${shipment.destination_port_data.country})`}
            </Text>
          </View>
          {shipment.cargo_type && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type de cargo:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {shipment.cargo_type}
              </Text>
            </View>
          )}
          {shipment.container_type && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type de conteneur:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {shipment.container_type}
              </Text>
            </View>
          )}
          {shipment.incoterm && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Incoterm:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {shipment.incoterm}
              </Text>
            </View>
          )}
          {shipment.etd && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>ETD:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatDate(shipment.etd)}
              </Text>
            </View>
          )}
          {shipment.eta && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>ETA:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatDate(shipment.eta)}
              </Text>
            </View>
          )}
          {shipment.last_update && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Dernière mise à jour:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatDate(shipment.last_update)}
              </Text>
            </View>
          )}
        </View>

        {/* Internal Notes */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>Notes internes</Text>
            <TouchableOpacity
              style={[styles.smallEditButton, { backgroundColor: colors.primary }]}
              onPress={() => openNotesModal('internal')}
            >
              <IconSymbol
                ios_icon_name="pencil"
                android_material_icon_name="edit"
                size={14}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.notesText, { color: theme.colors.text }]}>
            {shipment.internal_notes || 'Aucune note interne'}
          </Text>
        </View>

        {/* Client Visible Notes */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>Notes visibles client</Text>
            <TouchableOpacity
              style={[styles.smallEditButton, { backgroundColor: colors.primary }]}
              onPress={() => openNotesModal('client')}
            >
              <IconSymbol
                ios_icon_name="pencil"
                android_material_icon_name="edit"
                size={14}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.notesText, { color: theme.colors.text }]}>
            {shipment.client_visible_notes || 'Aucune note visible pour le client'}
          </Text>
        </View>

        {/* Documents */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Documents ({documents.length})</Text>
          {documents.length === 0 ? (
            <Text style={[styles.emptyDocumentsText, { color: colors.textSecondary }]}>
              Aucun document attaché
            </Text>
          ) : (
            documents.map((doc, index) => (
              <View key={index} style={[styles.documentItem, { borderColor: colors.border }]}>
                <View style={styles.documentInfo}>
                  <IconSymbol
                    ios_icon_name="doc.fill"
                    android_material_icon_name="description"
                    size={20}
                    color={colors.primary}
                  />
                  <View style={styles.documentDetails}>
                    <Text style={[styles.documentName, { color: theme.colors.text }]}>{doc.file_name}</Text>
                    <Text style={[styles.documentMeta, { color: colors.textSecondary }]}>
                      {doc.type} • {formatFileSize(doc.file_size)} • {formatDate(doc.uploaded_at)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Timestamps */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dates</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Créé le:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {formatDate(shipment.created_at)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Mis à jour le:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {formatDate(shipment.updated_at)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
            onPress={sendClientUpdate}
            disabled={saving}
          >
            <IconSymbol
              ios_icon_name="paperplane.fill"
              android_material_icon_name="send"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>Envoyer mise à jour client</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={addDocument}
            disabled={saving}
          >
            <IconSymbol
              ios_icon_name="doc.badge.plus"
              android_material_icon_name="add_circle"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>Ajouter document</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={forceDelivery}
            disabled={saving || shipment.current_status === 'delivered'}
          >
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check_circle"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>
              {shipment.current_status === 'delivered' ? 'Déjà livré' : 'Forcer livraison'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Status Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Modifier le statut
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
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                Sélectionnez un nouveau statut:
              </Text>
              
              {shipmentStatuses.map((status, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.statusOption,
                    { 
                      backgroundColor: editValue === status ? colors.primary + '20' : theme.colors.background,
                      borderColor: editValue === status ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => setEditValue(status)}
                >
                  <View style={[styles.statusOptionBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
                    <Text style={[styles.statusOptionText, { color: getStatusColor(status) }]}>
                      {formatStatus(status)}
                    </Text>
                  </View>
                  {editValue === status && (
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check_circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={saveStatusEdit}
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

      {/* Edit Notes Modal */}
      <Modal visible={notesModalVisible} transparent animationType="slide" onRequestClose={() => setNotesModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {notesType === 'internal' ? 'Notes internes' : 'Notes visibles client'}
              </Text>
              <TouchableOpacity onPress={() => setNotesModalVisible(false)}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: colors.border }]}
                value={notesValue}
                onChangeText={setNotesValue}
                placeholder={notesType === 'internal' ? 'Entrez les notes internes...' : 'Entrez les notes visibles pour le client...'}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setNotesModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={saveNotes}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackingNumber: {
    fontSize: 20,
    fontWeight: '700',
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  smallEditButton: {
    padding: 6,
    borderRadius: 6,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyDocumentsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  documentDetails: {
    flex: 1,
    gap: 4,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
  },
  documentMeta: {
    fontSize: 12,
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
    fontSize: 22,
    fontWeight: '700',
  },
  modalBody: {
    gap: 12,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  statusOptionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 120,
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
