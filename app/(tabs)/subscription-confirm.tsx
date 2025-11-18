
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";

type PlanType = 'basic' | 'premium_tracking' | 'enterprise_logistics' | 'agent_listing';

interface PlanDetails {
  id: PlanType;
  title: string;
  price: string;
  priceValue: number;
  description: string;
  features: string[];
  color: string;
  billingPeriod: 'monthly' | 'yearly';
}

export default function SubscriptionConfirmScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, client, refreshClient } = useAuth();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);

  const planType = params.plan as PlanType;

  useEffect(() => {
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour souscrire à un abonnement.',
        [
          {
            text: 'Se connecter',
            onPress: () => router.push('/(tabs)/client-space'),
          },
          {
            text: 'Annuler',
            style: 'cancel',
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }

    if (!client) {
      Alert.alert(
        'Profil incomplet',
        'Veuillez compléter votre profil client avant de souscrire.',
        [
          {
            text: 'Compléter mon profil',
            onPress: () => router.push('/(tabs)/client-profile'),
          },
          {
            text: 'Annuler',
            style: 'cancel',
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }

    loadPlanDetails();
  }, [user, client, planType]);

  const loadPlanDetails = () => {
    const plans: Record<PlanType, PlanDetails> = {
      basic: {
        id: 'basic',
        title: 'Basic Global Access',
        price: 'Gratuit',
        priceValue: 0,
        description: 'Accès aux informations de base, demande de devis et contact avec nos équipes.',
        features: [
          'Accès au catalogue de services',
          'Demande de devis en ligne',
          'Contact email standard',
        ],
        color: colors.textSecondary,
        billingPeriod: 'monthly',
      },
      premium_tracking: {
        id: 'premium_tracking',
        title: 'Premium Tracking',
        price: '49 € / mois',
        priceValue: 49,
        description: 'Suivi avancé de vos expéditions et support prioritaire.',
        features: [
          'Accès complet au tracking des shipments',
          'Notifications email sur les changements de statut',
          'Support prioritaire',
          'Accès au portail digital',
        ],
        color: colors.primary,
        billingPeriod: 'monthly',
      },
      enterprise_logistics: {
        id: 'enterprise_logistics',
        title: 'Enterprise Logistics',
        price: '99 € / mois',
        priceValue: 99,
        description: 'Solution logistique globale pour les entreprises avec volumes récurrents.',
        features: [
          'Tout Premium Tracking',
          'Reporting avancé',
          'Gestion multi-sites',
          'Accès complet au portail digital',
          'Support dédié',
        ],
        color: colors.secondary,
        billingPeriod: 'monthly',
      },
      agent_listing: {
        id: 'agent_listing',
        title: 'Agent Global Listing',
        price: '99 € / an',
        priceValue: 99,
        description: 'Soyez visible comme agent officiel UNIVERSAL SHIPPING SERVICES dans votre port.',
        features: [
          'Profil agent validé et public',
          'Mise en avant sur la page Port Coverage',
          'Badge "Premium Agent"',
          'Accès aux leads B2B',
        ],
        color: colors.accent,
        billingPeriod: 'yearly',
      },
    };

    const plan = plans[planType];
    if (plan) {
      setPlanDetails(plan);
    } else {
      Alert.alert('Erreur', 'Plan invalide');
      router.back();
    }
  };

  const handleConfirmSubscription = async () => {
    if (!client || !planDetails) {
      console.log('Missing client or plan details');
      return;
    }

    try {
      setLoading(true);

      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date();
      
      if (planDetails.billingPeriod === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Create subscription in pending status
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          client: client.id,
          plan_type: planDetails.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          is_active: false,
          status: 'pending',
          payment_provider: 'manual',
          notes: `Subscription created via app on ${new Date().toISOString()}`,
        })
        .select()
        .single();

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        throw subscriptionError;
      }

      console.log('Subscription created:', subscription);

      // Refresh client data
      await refreshClient();

      // Show success message
      Alert.alert(
        'Demande envoyée',
        `Votre demande d'abonnement ${planDetails.title} a été enregistrée.\n\nNotre équipe va traiter votre demande et vous contacter pour finaliser le paiement.\n\nVous recevrez un email de confirmation sous 24h.`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/client-dashboard'),
          },
        ]
      );
    } catch (error) {
      console.error('Error confirming subscription:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la création de votre abonnement. Veuillez réessayer ou contacter notre support.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!planDetails) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Confirmation
          </Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Confirmation d&apos;abonnement
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check_circle"
            size={80}
            color={planDetails.color}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Confirmez votre abonnement
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Vous êtes sur le point de souscrire au plan suivant :
          </Text>
        </View>

        <View style={[styles.planCard, { backgroundColor: theme.colors.card, borderColor: planDetails.color }]}>
          <View style={[styles.planBadge, { backgroundColor: planDetails.color }]}>
            <Text style={styles.planBadgeText}>{planDetails.title}</Text>
          </View>

          <Text style={[styles.planPrice, { color: theme.colors.text }]}>
            {planDetails.price}
          </Text>

          <Text style={[styles.planDescription, { color: colors.textSecondary }]}>
            {planDetails.description}
          </Text>

          <View style={styles.divider} />

          <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
            Ce qui est inclus :
          </Text>

          <View style={styles.featuresContainer}>
            {planDetails.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={[styles.featureText, { color: theme.colors.text }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              Processus de souscription
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              1. Votre demande sera enregistrée en statut &quot;En attente&quot;{'\n'}
              2. Notre équipe vous contactera pour finaliser le paiement{'\n'}
              3. Une fois le paiement confirmé, votre abonnement sera activé{'\n'}
              4. Vous recevrez un email de confirmation
            </Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
            Récapitulatif
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Plan sélectionné :
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {planDetails.title}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Période de facturation :
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {planDetails.billingPeriod === 'monthly' ? 'Mensuelle' : 'Annuelle'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Montant :
            </Text>
            <Text style={[styles.summaryValue, { color: planDetails.color, fontWeight: '700' }]}>
              {planDetails.price}
            </Text>
          </View>

          {client && (
            <>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Entreprise :
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  {client.company_name}
                </Text>
              </View>
              {client.email && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Email :
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {client.email}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: planDetails.color },
            loading && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmSubscription}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>
                Confirmer ma demande d&apos;abonnement
              </Text>
              <IconSymbol
                ios_icon_name="arrow.right"
                android_material_icon_name="arrow_forward"
                size={20}
                color="#ffffff"
              />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
            Annuler
          </Text>
        </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  planCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  planBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  planDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  summaryCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  confirmButton: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  cancelButton: {
    marginHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
