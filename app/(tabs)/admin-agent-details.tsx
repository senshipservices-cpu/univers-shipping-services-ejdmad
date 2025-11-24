
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
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';

interface GlobalAgent {
  id: string;
  company_name: string;
  email: string | null;
  whatsapp: string | null;
  website: string | null;
  port: string;
  activities: string[];
  years_experience: number | null;
  certifications: string | null;
  logo: string | null;
  status: string;
  is_premium_listing: boolean;
  notes_internal: string | null;
  created_at: string;
  updated_at: string;
  port_data?: { name: string; city: string | null; country: string | null; region: string | null };
}

export default function AdminAgentDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const params = useLocalSearchParams();
  const agentId = (params.id || params.agent_id) as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agent, setAgent] = useState<GlobalAgent | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<string>('');
  const [editValue, setEditValue] = useState<string | boolean>('');

  const loadAgentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('global_agents')
        .select(`
          *,
          port_data:ports(name, city, country, region)
        `)
        .eq('id', agentId)
        .single();

      if (error) {
        console.error('Error loading agent details:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails de l\'agent.');
        router.back();
      } else {
        setAgent(data);
      }
    } catch (error) {
      console.error('Exception loading agent details:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [agentId, router]);

  useEffect(() => {
    if (isAdmin && agentId) {
      loadAgentDetails();
    }
  }, [isAdmin, agentId, loadAgentDetails]);

  const openEditModal = (field: string, currentValue: string | boolean) => {
    setEditField(field);
    setEditValue(currentValue);
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!agent) return;

    try {
      setSaving(true);
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      updateData[editField] = editValue;

      const { error } = await supabase
        .from('global_agents')
        .update(updateData)
        .eq('id', agent.id);

      if (error) {
        console.error('Error updating agent:', error);
        Alert.alert('Erreur', 'Impossible de mettre à jour l\'agent.');
      } else {
        // Log event
        await supabase.from('events_log').insert({
          event_type: 'agent_updated',
          user_id: user?.id,
          details: `Agent ${agent.company_name} - ${editField} updated`,
        });

        Alert.alert('Succès', 'Agent mis à jour avec succès.');
        setEditModalVisible(false);
        loadAgentDetails();
      }
    } catch (error) {
      console.error('Exception updating agent:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const validateAgent = async () => {
    if (!agent) return;

    Alert.alert(
      'Valider l\'agent',
      `Êtes-vous sûr de vouloir valider ${agent.company_name} ? L'agent sera visible publiquement sur la plateforme.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: async () => {
            try {
              setSaving(true);

              const { error } = await supabase
                .from('global_agents')
                .update({
                  status: 'validated',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', agent.id);

              if (error) {
                console.error('Error validating agent:', error);
                Alert.alert('Erreur', 'Impossible de valider l\'agent.');
              } else {
                // Log event
                await supabase.from('events_log').insert({
                  event_type: 'agent_validated',
                  user_id: user?.id,
                  details: `Agent ${agent.company_name} validated`,
                });

                // Send email notification to agent
                const emailData = {
                  recipient_email: agent.email,
                  email_type: 'agent_validated',
                  subject: language === 'fr' 
                    ? 'Votre candidature UNIVERSAL SHIPPING SERVICES a été validée' 
                    : 'Your UNIVERSAL SHIPPING SERVICES application has been validated',
                  body: language === 'fr'
                    ? `Bonjour,\n\nNous avons le plaisir de vous informer que votre candidature en tant qu'agent UNIVERSAL SHIPPING SERVICES a été validée.\n\nVotre profil est maintenant visible sur notre plateforme et vous pourrez recevoir des demandes de clients.\n\nCordialement,\nL'équipe UNIVERSAL SHIPPING SERVICES`
                    : `Hello,\n\nWe are pleased to inform you that your application as a UNIVERSAL SHIPPING SERVICES agent has been validated.\n\nYour profile is now visible on our platform and you will be able to receive client requests.\n\nBest regards,\nThe UNIVERSAL SHIPPING SERVICES team`,
                  metadata: {
                    agent_id: agent.id,
                    company_name: agent.company_name,
                  },
                  status: 'pending',
                };

                await supabase.from('email_notifications').insert(emailData);

                Alert.alert('Succès', 'L\'agent a été validé avec succès. Un email de confirmation a été envoyé.');
                loadAgentDetails();
              }
            } catch (error) {
              console.error('Exception validating agent:', error);
              Alert.alert('Erreur', 'Une erreur est survenue.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const rejectAgent = async () => {
    if (!agent) return;

    Alert.alert(
      'Rejeter l\'agent',
      `Êtes-vous sûr de vouloir rejeter ${agent.company_name} ? Cette action peut être annulée ultérieurement.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);

              const { error } = await supabase
                .from('global_agents')
                .update({
                  status: 'rejected',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', agent.id);

              if (error) {
                console.error('Error rejecting agent:', error);
                Alert.alert('Erreur', 'Impossible de rejeter l\'agent.');
              } else {
                // Log event
                await supabase.from('events_log').insert({
                  event_type: 'agent_rejected',
                  user_id: user?.id,
                  details: `Agent ${agent.company_name} rejected`,
                });

                // Send email notification to agent
                const emailData = {
                  recipient_email: agent.email,
                  email_type: 'agent_rejected',
                  subject: language === 'fr' 
                    ? 'Votre candidature UNIVERSAL SHIPPING SERVICES' 
                    : 'Your UNIVERSAL SHIPPING SERVICES application',
                  body: language === 'fr'
                    ? `Bonjour,\n\nNous vous remercions pour votre candidature en tant qu'agent UNIVERSAL SHIPPING SERVICES.\n\nAprès examen de votre dossier, nous ne sommes malheureusement pas en mesure de donner suite à votre candidature pour le moment.\n\nNous vous encourageons à postuler à nouveau dans le futur.\n\nCordialement,\nL'équipe UNIVERSAL SHIPPING SERVICES`
                    : `Hello,\n\nThank you for your application as a UNIVERSAL SHIPPING SERVICES agent.\n\nAfter reviewing your application, we are unfortunately unable to proceed with your application at this time.\n\nWe encourage you to apply again in the future.\n\nBest regards,\nThe UNIVERSAL SHIPPING SERVICES team`,
                  metadata: {
                    agent_id: agent.id,
                    company_name: agent.company_name,
                  },
                  status: 'pending',
                };

                await supabase.from('email_notifications').insert(emailData);

                Alert.alert('Succès', 'L\'agent a été rejeté. Un email de notification a été envoyé.');
                loadAgentDetails();
              }
            } catch (error) {
              console.error('Exception rejecting agent:', error);
              Alert.alert('Erreur', 'Une erreur est survenue.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const togglePremiumListing = async () => {
    if (!agent) return;

    const newPremiumStatus = !agent.is_premium_listing;

    Alert.alert(
      newPremiumStatus ? 'Mettre en avant (Premium)' : 'Retirer le statut Premium',
      `Êtes-vous sûr de vouloir ${newPremiumStatus ? 'activer' : 'désactiver'} le statut premium pour ${agent.company_name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setSaving(true);

              const { error } = await supabase
                .from('global_agents')
                .update({
                  is_premium_listing: newPremiumStatus,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', agent.id);

              if (error) {
                console.error('Error updating premium status:', error);
                Alert.alert('Erreur', 'Impossible de mettre à jour le statut premium.');
              } else {
                // Log event
                await supabase.from('events_log').insert({
                  event_type: 'agent_premium_updated',
                  user_id: user?.id,
                  details: `Agent ${agent.company_name} premium status: ${newPremiumStatus}`,
                });

                Alert.alert('Succès', `Le statut premium a été ${newPremiumStatus ? 'activé' : 'désactivé'} avec succès.`);
                loadAgentDetails();
              }
            } catch (error) {
              console.error('Exception updating premium status:', error);
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
      'pending': 'En attente',
      'validated': 'Validé',
      'rejected': 'Rejeté',
    };
    return statusTranslations[status] || status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatActivity = (activity: string) => {
    const activityTranslations: Record<string, string> = {
      'consignation': 'Consignation',
      'customs': 'Douanes',
      'freight_forwarding': 'Transit',
      'ship_supply': 'Avitaillement',
      'warehousing': 'Entreposage',
      'trucking': 'Transport routier',
      'consulting': 'Consulting',
    };
    return activityTranslations[activity] || activity;
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': colors.textSecondary,
      'validated': '#10b981',
      'rejected': '#ef4444',
    };
    return statusColors[status] || colors.textSecondary;
  };

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  if (!agentId) {
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails de l&apos;agent</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!agent) {
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails de l&apos;agent</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>Agent introuvable</Text>
        </View>
      </View>
    );
  }

  const agentStatuses = ['pending', 'validated', 'rejected'];

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails de l&apos;agent</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Logo & Company Name */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <View style={styles.companyHeader}>
            {agent.logo ? (
              <Image source={{ uri: agent.logo }} style={styles.logo} />
            ) : (
              <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="building.2"
                  android_material_icon_name="business"
                  size={32}
                  color={colors.primary}
                />
              </View>
            )}
            <View style={styles.companyInfo}>
              <Text style={[styles.companyName, { color: theme.colors.text }]}>{agent.company_name}</Text>
              {agent.is_premium_listing && (
                <View style={[styles.premiumBadge, { backgroundColor: '#f59e0b' + '20' }]}>
                  <IconSymbol
                    ios_icon_name="star.fill"
                    android_material_icon_name="star"
                    size={14}
                    color="#f59e0b"
                  />
                  <Text style={[styles.premiumText, { color: '#f59e0b' }]}>Premium</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Status Section - Editable */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Statut</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(agent.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(agent.status) }]}>
                {formatStatus(agent.status)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => openEditModal('status', agent.status)}
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

        {/* Contact Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informations de contact</Text>
          <View style={styles.infoRow}>
            <IconSymbol
              ios_icon_name="envelope"
              android_material_icon_name="email"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {agent.email || 'N/A'}
            </Text>
          </View>
          {agent.whatsapp && (
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={18}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {agent.whatsapp}
              </Text>
            </View>
          )}
          {agent.website && (
            <View style={styles.infoRow}>
              <IconSymbol
                ios_icon_name="globe"
                android_material_icon_name="language"
                size={18}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                {agent.website}
              </Text>
            </View>
          )}
        </View>

        {/* Port Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Port d&apos;opération</Text>
          <View style={styles.portInfo}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="place"
              size={24}
              color={colors.primary}
            />
            <View style={styles.portDetails}>
              <Text style={[styles.portName, { color: theme.colors.text }]}>
                {agent.port_data?.name || 'N/A'}
              </Text>
              {agent.port_data?.city && agent.port_data?.country && (
                <Text style={[styles.portLocation, { color: colors.textSecondary }]}>
                  {agent.port_data.city}, {agent.port_data.country}
                </Text>
              )}
              {agent.port_data?.region && (
                <Text style={[styles.portRegion, { color: colors.textSecondary }]}>
                  Région: {agent.port_data.region}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Activities */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Activités</Text>
          <View style={styles.activitiesContainer}>
            {agent.activities.map((activity, index) => (
              <View key={index} style={[styles.activityBadge, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                <Text style={[styles.activityText, { color: colors.primary }]}>
                  {formatActivity(activity)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Experience */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Expérience</Text>
          <View style={styles.experienceRow}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="event"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.experienceText, { color: theme.colors.text }]}>
              {agent.years_experience ? `${agent.years_experience} ans d'expérience` : 'Non spécifié'}
            </Text>
          </View>
        </View>

        {/* Certifications */}
        {agent.certifications && (
          <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Certifications</Text>
            <View style={styles.certificationsRow}>
              <IconSymbol
                ios_icon_name="checkmark.seal.fill"
                android_material_icon_name="verified"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.certificationsText, { color: theme.colors.text }]}>
                {agent.certifications}
              </Text>
            </View>
          </View>
        )}

        {/* Premium Listing Status - Editable */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Statut Premium</Text>
          <View style={styles.premiumRow}>
            <View style={styles.premiumInfo}>
              <IconSymbol
                ios_icon_name={agent.is_premium_listing ? "star.fill" : "star"}
                android_material_icon_name={agent.is_premium_listing ? "star" : "star_border"}
                size={24}
                color={agent.is_premium_listing ? '#f59e0b' : colors.textSecondary}
              />
              <Text style={[styles.premiumStatusText, { color: theme.colors.text }]}>
                {agent.is_premium_listing ? 'Agent Premium' : 'Agent Standard'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => openEditModal('is_premium_listing', agent.is_premium_listing)}
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

        {/* Internal Notes */}
        {agent.notes_internal && (
          <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notes internes</Text>
            <Text style={[styles.notesText, { color: theme.colors.text }]}>
              {agent.notes_internal}
            </Text>
          </View>
        )}

        {/* Timestamps */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dates</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Candidature reçue le:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {formatDate(agent.created_at)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Dernière mise à jour:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {formatDate(agent.updated_at)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {agent.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                onPress={validateAgent}
                disabled={saving}
              >
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>Valider l&apos;agent</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                onPress={rejectAgent}
                disabled={saving}
              >
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>Rejeter</Text>
              </TouchableOpacity>
            </>
          )}

          {agent.status === 'validated' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
              onPress={togglePremiumListing}
              disabled={saving}
            >
              <IconSymbol
                ios_icon_name={agent.is_premium_listing ? "star.slash" : "star.fill"}
                android_material_icon_name={agent.is_premium_listing ? "star_border" : "star"}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>
                {agent.is_premium_listing ? 'Retirer le statut Premium' : 'Mettre en avant (Premium)'}
              </Text>
            </TouchableOpacity>
          )}

          {agent.status === 'rejected' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
              onPress={validateAgent}
              disabled={saving}
            >
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>Réactiver l&apos;agent</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {editField === 'status' ? 'Modifier le statut' : 'Modifier le statut premium'}
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
                  {agentStatuses.map((status, index) => (
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
              ) : (
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: editValue === true ? colors.primary + '20' : theme.colors.background,
                        borderColor: editValue === true ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setEditValue(true)}
                  >
                    <View style={styles.premiumOptionRow}>
                      <IconSymbol
                        ios_icon_name="star.fill"
                        android_material_icon_name="star"
                        size={20}
                        color="#f59e0b"
                      />
                      <Text style={[styles.optionText, { color: editValue === true ? colors.primary : theme.colors.text }]}>
                        Agent Premium
                      </Text>
                    </View>
                    {editValue === true && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check_circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: editValue === false ? colors.primary + '20' : theme.colors.background,
                        borderColor: editValue === false ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setEditValue(false)}
                  >
                    <View style={styles.premiumOptionRow}>
                      <IconSymbol
                        ios_icon_name="star"
                        android_material_icon_name="star_border"
                        size={20}
                        color={colors.textSecondary}
                      />
                      <Text style={[styles.optionText, { color: editValue === false ? colors.primary : theme.colors.text }]}>
                        Agent Standard
                      </Text>
                    </View>
                    {editValue === false && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check_circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                </View>
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
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
    gap: 8,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
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
    alignItems: 'center',
    gap: 12,
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
    flex: 1,
  },
  portInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  portDetails: {
    flex: 1,
    gap: 4,
  },
  portName: {
    fontSize: 18,
    fontWeight: '700',
  },
  portLocation: {
    fontSize: 14,
  },
  portRegion: {
    fontSize: 13,
  },
  activitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  experienceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  certificationsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  certificationsText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
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
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
  premiumOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
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
