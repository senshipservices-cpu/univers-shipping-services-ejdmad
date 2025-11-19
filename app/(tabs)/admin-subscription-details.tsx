
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
import DateTimePicker from '@react-native-community/datetimepicker';

interface Subscription {
  id: string;
  client: string;
  plan_type: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  status: string;
  payment_provider: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client_data?: {
    id: string;
    company_name: string;
    email: string;
    contact_name: string | null;
    phone: string | null;
  };
}

export default function AdminSubscriptionDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const params = useLocalSearchParams();
  const subscriptionId = params.subscription_id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  
  // Edit modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<string>('');
  const [editValue, setEditValue] = useState<string | boolean>('');
  
  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadSubscriptionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          client_data:clients(id, company_name, email, contact_name, phone)
        `)
        .eq('id', subscriptionId)
        .single();

      if (error) {
        console.error('Error loading subscription details:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails de l\'abonnement.');
        router.back();
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Exception loading subscription details:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [subscriptionId, router]);

  useEffect(() => {
    if (isAdmin && subscriptionId) {
      loadSubscriptionDetails();
    }
  }, [isAdmin, subscriptionId, loadSubscriptionDetails]);

  const openEditModal = (field: string, currentValue: string | boolean) => {
    setEditField(field);
    setEditValue(currentValue);
    setEditModalVisible(true);
  };

  const openDatePicker = (field: string, currentDate: string | null) => {
    setEditField(field);
    setSelectedDate(currentDate ? new Date(currentDate) : new Date());
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date && subscription) {
      updateSubscriptionField(editField, date.toISOString().split('T')[0]);
    }
  };

  const saveEdit = async () => {
    if (!subscription) return;

    await updateSubscriptionField(editField, editValue);
    setEditModalVisible(false);
  };

  const updateSubscriptionField = async (field: string, value: string | boolean) => {
    if (!subscription) return;

    try {
      setSaving(true);
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      updateData[field] = value;

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscription.id);

      if (error) {
        console.error('Error updating subscription:', error);
        Alert.alert('Erreur', 'Impossible de mettre à jour l\'abonnement.');
      } else {
        // Log event
        await supabase.from('events_log').insert({
          event_type: 'subscription_updated',
          user_id: user?.id,
          client_id: subscription.client,
          details: `Subscription ${subscription.id} - ${field} updated to ${value}`,
        });

        Alert.alert('Succès', 'Abonnement mis à jour avec succès.');
        loadSubscriptionDetails();
      }
    } catch (error) {
      console.error('Exception updating subscription:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const activateNow = async () => {
    if (!subscription) return;

    Alert.alert(
      'Activer maintenant',
      `Êtes-vous sûr de vouloir activer l'abonnement pour ${subscription.client_data?.company_name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Activer',
          onPress: async () => {
            try {
              setSaving(true);

              const { error } = await supabase
                .from('subscriptions')
                .update({
                  is_active: true,
                  status: 'active',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', subscription.id);

              if (error) {
                console.error('Error activating subscription:', error);
                Alert.alert('Erreur', 'Impossible d\'activer l\'abonnement.');
              } else {
                // Log event
                await supabase.from('events_log').insert({
                  event_type: 'subscription_activated',
                  user_id: user?.id,
                  client_id: subscription.client,
                  details: `Subscription ${subscription.id} activated`,
                });

                // Send email notification to client
                const emailData = {
                  recipient_email: subscription.client_data?.email,
                  email_type: 'subscription_activated',
                  subject: language === 'fr' 
                    ? 'Votre abonnement UNIVERSAL SHIPPING SERVICES est activé' 
                    : 'Your UNIVERSAL SHIPPING SERVICES subscription is activated',
                  body: language === 'fr'
                    ? `Bonjour ${subscription.client_data?.contact_name || ''},\n\nNous avons le plaisir de vous informer que votre abonnement ${formatPlanType(subscription.plan_type)} a été activé avec succès.\n\nVous pouvez maintenant profiter de tous les avantages de votre plan.\n\nCordialement,\nL'équipe UNIVERSAL SHIPPING SERVICES`
                    : `Hello ${subscription.client_data?.contact_name || ''},\n\nWe are pleased to inform you that your ${formatPlanType(subscription.plan_type)} subscription has been successfully activated.\n\nYou can now enjoy all the benefits of your plan.\n\nBest regards,\nThe UNIVERSAL SHIPPING SERVICES team`,
                  metadata: {
                    subscription_id: subscription.id,
                    plan_type: subscription.plan_type,
                  },
                  status: 'pending',
                };

                await supabase.from('email_notifications').insert(emailData);

                Alert.alert('Succès', 'L\'abonnement a été activé avec succès. Un email de confirmation a été envoyé.');
                loadSubscriptionDetails();
              }
            } catch (error) {
              console.error('Exception activating subscription:', error);
              Alert.alert('Erreur', 'Une erreur est survenue.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const deactivate = async () => {
    if (!subscription) return;

    Alert.alert(
      'Désactiver l\'abonnement',
      `Êtes-vous sûr de vouloir désactiver l'abonnement pour ${subscription.client_data?.company_name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);

              const { error } = await supabase
                .from('subscriptions')
                .update({
                  is_active: false,
                  status: 'cancelled',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', subscription.id);

              if (error) {
                console.error('Error deactivating subscription:', error);
                Alert.alert('Erreur', 'Impossible de désactiver l\'abonnement.');
              } else {
                // Log event
                await supabase.from('events_log').insert({
                  event_type: 'subscription_deactivated',
                  user_id: user?.id,
                  client_id: subscription.client,
                  details: `Subscription ${subscription.id} deactivated`,
                });

                // Send email notification to client
                const emailData = {
                  recipient_email: subscription.client_data?.email,
                  email_type: 'subscription_deactivated',
                  subject: language === 'fr' 
                    ? 'Votre abonnement UNIVERSAL SHIPPING SERVICES a été désactivé' 
                    : 'Your UNIVERSAL SHIPPING SERVICES subscription has been deactivated',
                  body: language === 'fr'
                    ? `Bonjour ${subscription.client_data?.contact_name || ''},\n\nNous vous informons que votre abonnement ${formatPlanType(subscription.plan_type)} a été désactivé.\n\nSi vous avez des questions, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe UNIVERSAL SHIPPING SERVICES`
                    : `Hello ${subscription.client_data?.contact_name || ''},\n\nWe inform you that your ${formatPlanType(subscription.plan_type)} subscription has been deactivated.\n\nIf you have any questions, please do not hesitate to contact us.\n\nBest regards,\nThe UNIVERSAL SHIPPING SERVICES team`,
                  metadata: {
                    subscription_id: subscription.id,
                    plan_type: subscription.plan_type,
                  },
                  status: 'pending',
                };

                await supabase.from('email_notifications').insert(emailData);

                Alert.alert('Succès', 'L\'abonnement a été désactivé. Un email de notification a été envoyé.');
                loadSubscriptionDetails();
              }
            } catch (error) {
              console.error('Exception deactivating subscription:', error);
              Alert.alert('Erreur', 'Une erreur est survenue.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const extend = async () => {
    if (!subscription) return;

    Alert.alert(
      'Prolonger l\'abonnement',
      'De combien de mois souhaitez-vous prolonger l\'abonnement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: '1 mois',
          onPress: () => extendSubscription(1),
        },
        {
          text: '3 mois',
          onPress: () => extendSubscription(3),
        },
        {
          text: '6 mois',
          onPress: () => extendSubscription(6),
        },
        {
          text: '12 mois',
          onPress: () => extendSubscription(12),
        },
      ]
    );
  };

  const extendSubscription = async (months: number) => {
    if (!subscription) return;

    try {
      setSaving(true);

      const currentEndDate = subscription.end_date ? new Date(subscription.end_date) : new Date();
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + months);

      const { error } = await supabase
        .from('subscriptions')
        .update({
          end_date: newEndDate.toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (error) {
        console.error('Error extending subscription:', error);
        Alert.alert('Erreur', 'Impossible de prolonger l\'abonnement.');
      } else {
        // Log event
        await supabase.from('events_log').insert({
          event_type: 'subscription_extended',
          user_id: user?.id,
          client_id: subscription.client,
          details: `Subscription ${subscription.id} extended by ${months} months`,
        });

        // Send email notification to client
        const emailData = {
          recipient_email: subscription.client_data?.email,
          email_type: 'subscription_extended',
          subject: language === 'fr' 
            ? 'Votre abonnement UNIVERSAL SHIPPING SERVICES a été prolongé' 
            : 'Your UNIVERSAL SHIPPING SERVICES subscription has been extended',
          body: language === 'fr'
            ? `Bonjour ${subscription.client_data?.contact_name || ''},\n\nNous avons le plaisir de vous informer que votre abonnement ${formatPlanType(subscription.plan_type)} a été prolongé de ${months} mois.\n\nNouvelle date de fin: ${formatDate(newEndDate.toISOString())}\n\nCordialement,\nL'équipe UNIVERSAL SHIPPING SERVICES`
            : `Hello ${subscription.client_data?.contact_name || ''},\n\nWe are pleased to inform you that your ${formatPlanType(subscription.plan_type)} subscription has been extended by ${months} months.\n\nNew end date: ${formatDate(newEndDate.toISOString())}\n\nBest regards,\nThe UNIVERSAL SHIPPING SERVICES team`,
          metadata: {
            subscription_id: subscription.id,
            plan_type: subscription.plan_type,
            months_extended: months,
          },
          status: 'pending',
        };

        await supabase.from('email_notifications').insert(emailData);

        Alert.alert('Succès', `L\'abonnement a été prolongé de ${months} mois. Un email de confirmation a été envoyé.`);
        loadSubscriptionDetails();
      }
    } catch (error) {
      console.error('Exception extending subscription:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const sendEmailToClient = async () => {
    if (!subscription) return;

    Alert.alert(
      'Envoyer email client',
      `Envoyer un email de rappel à ${subscription.client_data?.company_name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: async () => {
            try {
              setSaving(true);

              const emailData = {
                recipient_email: subscription.client_data?.email,
                email_type: 'subscription_reminder',
                subject: language === 'fr' 
                  ? 'Rappel concernant votre abonnement UNIVERSAL SHIPPING SERVICES' 
                  : 'Reminder about your UNIVERSAL SHIPPING SERVICES subscription',
                body: language === 'fr'
                  ? `Bonjour ${subscription.client_data?.contact_name || ''},\n\nNous vous contactons concernant votre abonnement ${formatPlanType(subscription.plan_type)}.\n\nStatut: ${formatStatus(subscription.status)}\nActif: ${subscription.is_active ? 'Oui' : 'Non'}\nDate de début: ${formatDate(subscription.start_date)}\n${subscription.end_date ? `Date de fin: ${formatDate(subscription.end_date)}` : ''}\n\nSi vous avez des questions, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe UNIVERSAL SHIPPING SERVICES`
                  : `Hello ${subscription.client_data?.contact_name || ''},\n\nWe are contacting you regarding your ${formatPlanType(subscription.plan_type)} subscription.\n\nStatus: ${formatStatus(subscription.status)}\nActive: ${subscription.is_active ? 'Yes' : 'No'}\nStart date: ${formatDate(subscription.start_date)}\n${subscription.end_date ? `End date: ${formatDate(subscription.end_date)}` : ''}\n\nIf you have any questions, please do not hesitate to contact us.\n\nBest regards,\nThe UNIVERSAL SHIPPING SERVICES team`,
                metadata: {
                  subscription_id: subscription.id,
                  plan_type: subscription.plan_type,
                },
                status: 'pending',
              };

              const { error } = await supabase.from('email_notifications').insert(emailData);

              if (error) {
                console.error('Error sending email:', error);
                Alert.alert('Erreur', 'Impossible d\'envoyer l\'email.');
              } else {
                // Log event
                await supabase.from('events_log').insert({
                  event_type: 'subscription_email_sent',
                  user_id: user?.id,
                  client_id: subscription.client,
                  details: `Email sent to client for subscription ${subscription.id}`,
                });

                Alert.alert('Succès', 'L\'email a été envoyé avec succès.');
              }
            } catch (error) {
              console.error('Exception sending email:', error);
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
    });
  };

  const formatDateTime = (dateString: string | null) => {
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
      'active': 'Actif',
      'cancelled': 'Annulé',
      'expired': 'Expiré',
    };
    return statusTranslations[status] || status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatPlanType = (planType: string) => {
    const planTranslations: Record<string, string> = {
      'basic': 'Basic Global Access',
      'premium_tracking': 'Premium Tracking',
      'enterprise_logistics': 'Enterprise Logistics',
      'agent_listing': 'Agent Global Listing',
      'digital_portal': 'Digital Portal',
    };
    return planTranslations[planType] || planType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': colors.textSecondary,
      'active': '#10b981',
      'cancelled': '#ef4444',
      'expired': colors.textSecondary,
    };
    return statusColors[status] || colors.textSecondary;
  };

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  if (!subscriptionId) {
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails de l&apos;abonnement</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!subscription) {
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails de l&apos;abonnement</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>Abonnement introuvable</Text>
        </View>
      </View>
    );
  }

  const subscriptionStatuses = ['pending', 'active', 'cancelled', 'expired'];

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Détails de l&apos;abonnement</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Client Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <View style={styles.clientHeader}>
            <View style={[styles.clientIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol
                ios_icon_name="building.2"
                android_material_icon_name="business"
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.clientInfo}>
              <Text style={[styles.clientName, { color: theme.colors.text }]}>
                {subscription.client_data?.company_name || 'Client inconnu'}
              </Text>
              <Text style={[styles.clientEmail, { color: colors.textSecondary }]}>
                {subscription.client_data?.email || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Plan Type */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Type de plan</Text>
          <View style={[styles.planBadge, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.planText, { color: colors.primary }]}>
              {formatPlanType(subscription.plan_type)}
            </Text>
          </View>
        </View>

        {/* Status Section - Editable */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Statut</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(subscription.status) }]}>
                {formatStatus(subscription.status)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => openEditModal('status', subscription.status)}
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

        {/* Active Status - Editable */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>État d&apos;activation</Text>
          <View style={styles.activeRow}>
            <View style={styles.activeInfo}>
              <IconSymbol
                ios_icon_name={subscription.is_active ? "checkmark.circle.fill" : "xmark.circle.fill"}
                android_material_icon_name={subscription.is_active ? "check_circle" : "cancel"}
                size={24}
                color={subscription.is_active ? '#10b981' : '#ef4444'}
              />
              <Text style={[styles.activeStatusText, { color: theme.colors.text }]}>
                {subscription.is_active ? 'Actif' : 'Inactif'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => openEditModal('is_active', subscription.is_active)}
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

        {/* Dates */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dates</Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateInfo}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar_today"
                size={20}
                color={colors.primary}
              />
              <View style={styles.dateDetails}>
                <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Date de début</Text>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                  {formatDate(subscription.start_date)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateInfo}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="event"
                size={20}
                color={colors.primary}
              />
              <View style={styles.dateDetails}>
                <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Date de fin</Text>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                  {formatDate(subscription.end_date)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => openDatePicker('end_date', subscription.end_date)}
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

        {/* Payment Information */}
        {(subscription.payment_provider || subscription.payment_reference) && (
          <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informations de paiement</Text>
            {subscription.payment_provider && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Fournisseur:</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {subscription.payment_provider}
                </Text>
              </View>
            )}
            {subscription.payment_reference && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Référence:</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {subscription.payment_reference}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        {subscription.notes && (
          <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notes</Text>
            <Text style={[styles.notesText, { color: theme.colors.text }]}>
              {subscription.notes}
            </Text>
          </View>
        )}

        {/* Timestamps */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Historique</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Créé le:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {formatDateTime(subscription.created_at)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Dernière mise à jour:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {formatDateTime(subscription.updated_at)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!subscription.is_active && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
              onPress={activateNow}
              disabled={saving}
            >
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>Activer maintenant</Text>
            </TouchableOpacity>
          )}

          {subscription.is_active && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
              onPress={deactivate}
              disabled={saving}
            >
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>Désactiver</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
            onPress={extend}
            disabled={saving}
          >
            <IconSymbol
              ios_icon_name="calendar.badge.plus"
              android_material_icon_name="event_available"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>Prolonger</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={sendEmailToClient}
            disabled={saving}
          >
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>Envoyer email client</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {editField === 'status' ? 'Modifier le statut' : 'Modifier l\'état d\'activation'}
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
                  {subscriptionStatuses.map((status, index) => (
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
                    <View style={styles.activeOptionRow}>
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check_circle"
                        size={20}
                        color="#10b981"
                      />
                      <Text style={[styles.optionText, { color: editValue === true ? colors.primary : theme.colors.text }]}>
                        Actif
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
                    <View style={styles.activeOptionRow}>
                      <IconSymbol
                        ios_icon_name="xmark.circle.fill"
                        android_material_icon_name="cancel"
                        size={20}
                        color="#ef4444"
                      />
                      <Text style={[styles.optionText, { color: editValue === false ? colors.primary : theme.colors.text }]}>
                        Inactif
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

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
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
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clientIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientInfo: {
    flex: 1,
    gap: 4,
  },
  clientName: {
    fontSize: 20,
    fontWeight: '700',
  },
  clientEmail: {
    fontSize: 14,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  planText: {
    fontSize: 16,
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
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dateDetails: {
    flex: 1,
    gap: 4,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
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
    width: 100,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
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
  activeOptionRow: {
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
