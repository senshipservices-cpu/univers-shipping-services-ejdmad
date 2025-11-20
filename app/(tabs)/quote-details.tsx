
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
import { formatPrice } from '@/utils/stripe';

interface Port {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
}

interface FreightQuote {
  id: string;
  client: string | null;
  origin_port: Port | null;
  destination_port: Port | null;
  cargo_type: string | null;
  volume_details: string | null;
  incoterm: string | null;
  desired_eta: string | null;
  status: string;
  quote_amount: number | null;
  quote_currency: string | null;
  payment_status: string | null;
  client_decision: string | null;
  can_pay_online: boolean | null;
  created_at: string;
  updated_at: string;
  stripe_payment_intent_id: string | null;
}

export default function QuoteDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, client: authClient, isEmailVerified } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<FreightQuote | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Load quote details
  const loadQuoteDetails = useCallback(async () => {
    if (!id || !user?.id) {
      console.log('No quote ID or user ID available');
      return;
    }

    try {
      setLoading(true);

      // Get client record
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!clientData) {
        Alert.alert('Erreur', 'Profil client introuvable');
        router.back();
        return;
      }

      // Load quote with port details
      const { data: quoteData, error: quoteError } = await supabase
        .from('freight_quotes')
        .select(`
          *,
          origin_port:ports!freight_quotes_origin_port_fkey(id, name, city, country),
          destination_port:ports!freight_quotes_destination_port_fkey(id, name, city, country)
        `)
        .eq('id', id)
        .single();

      if (quoteError) {
        console.error('Error loading quote:', quoteError);
        Alert.alert('Erreur', 'Impossible de charger le devis');
        router.back();
        return;
      }

      // Verify ownership
      if (quoteData.client !== clientData.id) {
        Alert.alert('Accès refusé', 'Vous n\'avez pas accès à ce devis');
        router.back();
        return;
      }

      setQuote(quoteData);
    } catch (error) {
      console.error('Error loading quote details:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement du devis');
    } finally {
      setLoading(false);
    }
  }, [id, user, router]);

  useEffect(() => {
    if (user && id) {
      loadQuoteDetails();
    }
  }, [user, id, loadQuoteDetails]);

  const handlePayQuote = useCallback(async () => {
    if (!quote || !user) return;

    // Verify payment conditions
    if (quote.payment_status === 'paid') {
      Alert.alert('Déjà payé', 'Ce devis a déjà été payé');
      return;
    }

    if (!quote.quote_amount || quote.quote_amount <= 0) {
      Alert.alert('Erreur', 'Ce devis n\'a pas de montant valide');
      return;
    }

    try {
      setProcessingPayment(true);

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
        return;
      }

      // Call Edge Function to create Stripe checkout session
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            quote_id: quote.id,
            context: 'freight_quote',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
      }

      console.log('Checkout session created:', data.sessionId);

      // Redirect to Stripe checkout
      if (data.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          // For mobile, you would typically use a WebView or deep linking
          Alert.alert(
            'Paiement',
            'Vous allez être redirigé vers la page de paiement Stripe',
            [
              {
                text: 'Continuer',
                onPress: () => {
                  // Open URL in browser
                  // You might want to use Linking.openURL(data.url) here
                  console.log('Redirect to:', data.url);
                },
              },
              {
                text: 'Annuler',
                style: 'cancel',
              },
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Error creating payment session:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer la session de paiement');
    } finally {
      setProcessingPayment(false);
    }
  }, [quote, user]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'accepted':
      case 'paid':
        return '#10b981';
      case 'in_progress':
      case 'sent_to_client':
      case 'processing':
        return colors.primary;
      case 'received':
      case 'unpaid':
        return '#f59e0b';
      case 'refused':
      case 'failed':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  }, []);

  const formatStatus = useCallback((status: string) => {
    const statusMap: Record<string, string> = {
      received: 'Reçu',
      in_progress: 'En cours',
      sent_to_client: 'Envoyé',
      accepted: 'Accepté',
      refused: 'Refusé',
      unpaid: 'Non payé',
      processing: 'En traitement',
      paid: 'Payé',
      failed: 'Échec',
      pending: 'En attente',
    };
    return statusMap[status] || status;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Chargement...</Text>
        </View>
      </View>
    );
  }

  // No quote found
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
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="doc.text.fill.badge.ellipsis"
            android_material_icon_name="description"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>Devis introuvable</Text>
        </View>
      </View>
    );
  }

  const canPayOnline = quote.payment_status === 'unpaid' && quote.quote_amount && quote.quote_amount > 0;

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
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Quote ID Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Référence</Text>
          <Text style={[styles.quoteId, { color: theme.colors.text }]}>
            #{quote.id.substring(0, 8).toUpperCase()}
          </Text>
        </View>

        {/* Status Cards */}
        <View style={styles.statusRow}>
          <View style={[styles.statusCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statusCardLabel, { color: colors.textSecondary }]}>Statut devis</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                {formatStatus(quote.status)}
              </Text>
            </View>
          </View>

          <View style={[styles.statusCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statusCardLabel, { color: colors.textSecondary }]}>Statut paiement</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(quote.payment_status || 'pending') + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(quote.payment_status || 'pending') }]}>
                {formatStatus(quote.payment_status || 'pending')}
              </Text>
            </View>
          </View>
        </View>

        {/* Amount Card */}
        {quote.quote_amount && (
          <View
            style={[
              styles.amountCard,
              { backgroundColor: colors.primary + '10', borderColor: colors.primary },
            ]}
          >
            <View style={styles.amountHeader}>
              <IconSymbol
                ios_icon_name="dollarsign.circle.fill"
                android_material_icon_name="payments"
                size={32}
                color={colors.primary}
              />
              <View style={styles.amountContent}>
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Montant du devis</Text>
                <Text style={[styles.amountValue, { color: theme.colors.text }]}>
                  {formatPrice(quote.quote_amount, quote.quote_currency || 'EUR')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Route Information */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Itinéraire</Text>

          <View style={styles.routeContainer}>
            <View style={styles.portInfo}>
              <IconSymbol
                ios_icon_name="location.circle.fill"
                android_material_icon_name="place"
                size={24}
                color={colors.primary}
              />
              <View style={styles.portDetails}>
                <Text style={[styles.portLabel, { color: colors.textSecondary }]}>Origine</Text>
                <Text style={[styles.portName, { color: theme.colors.text }]}>
                  {quote.origin_port?.name || 'N/A'}
                </Text>
                {quote.origin_port?.country && (
                  <Text style={[styles.portCountry, { color: colors.textSecondary }]}>
                    {quote.origin_port.country}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.routeArrow}>
              <IconSymbol
                ios_icon_name="arrow.down"
                android_material_icon_name="arrow_downward"
                size={24}
                color={colors.textSecondary}
              />
            </View>

            <View style={styles.portInfo}>
              <IconSymbol
                ios_icon_name="location.circle.fill"
                android_material_icon_name="place"
                size={24}
                color={colors.secondary}
              />
              <View style={styles.portDetails}>
                <Text style={[styles.portLabel, { color: colors.textSecondary }]}>Destination</Text>
                <Text style={[styles.portName, { color: theme.colors.text }]}>
                  {quote.destination_port?.name || 'N/A'}
                </Text>
                {quote.destination_port?.country && (
                  <Text style={[styles.portCountry, { color: colors.textSecondary }]}>
                    {quote.destination_port.country}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Cargo Details */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Détails de la cargaison</Text>

          {quote.cargo_type && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Type de cargo</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{quote.cargo_type}</Text>
            </View>
          )}

          {quote.volume_details && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Volume</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{quote.volume_details}</Text>
            </View>
          )}

          {quote.incoterm && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Incoterm</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{quote.incoterm}</Text>
            </View>
          )}

          {quote.desired_eta && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>ETA souhaitée</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {formatDate(quote.desired_eta)}
              </Text>
            </View>
          )}
        </View>

        {/* Dates */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dates</Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Créé le</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {formatDate(quote.created_at)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Mis à jour le</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {formatDate(quote.updated_at)}
            </Text>
          </View>
        </View>

        {/* Payment Button */}
        {canPayOnline && (
          <TouchableOpacity
            style={[
              styles.payButton,
              { backgroundColor: colors.primary },
              processingPayment && styles.payButtonDisabled,
            ]}
            onPress={handlePayQuote}
            disabled={processingPayment}
          >
            {processingPayment ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.payButtonText}>Traitement...</Text>
              </>
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="creditcard.fill"
                  android_material_icon_name="payment"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.payButtonText}>Payer ce devis</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {quote.payment_status === 'paid' && (
          <View style={[styles.paidBanner, { backgroundColor: '#10b981' + '20', borderColor: '#10b981' }]}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check_circle"
              size={24}
              color="#10b981"
            />
            <Text style={[styles.paidBannerText, { color: '#10b981' }]}>Ce devis a été payé avec succès</Text>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
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
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  quoteId: {
    fontSize: 24,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  statusCardLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  amountCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  amountContent: {
    flex: 1,
    gap: 4,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  routeContainer: {
    gap: 16,
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
  portLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  portName: {
    fontSize: 18,
    fontWeight: '700',
  },
  portCountry: {
    fontSize: 14,
  },
  routeArrow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
    marginTop: 8,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  paidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
    marginTop: 8,
  },
  paidBannerText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
