
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/styles/commonStyles';
import { PageHeader } from '@/components/PageHeader';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { processPaymentWithSecurity } from '@/utils/apiClient';
import { generateIdempotencyKey } from '@/utils/trackingGenerator';

type PaymentMethod = 'card' | 'mobile_money' | 'cash_on_delivery';

export default function ShipmentSummaryScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [quoteData, setQuoteData] = useState<any>(null);

  useEffect(() => {
    if (params.quoteData) {
      try {
        const data = JSON.parse(params.quoteData as string);
        setQuoteData(data);
        console.log('[SHIPMENT_SUMMARY] Quote data loaded:', data);
      } catch (error) {
        console.error('[SHIPMENT_SUMMARY] Error parsing quote data:', error);
        Alert.alert('Erreur', 'Données de devis invalides.');
        router.back();
      }
    }
  }, [params.quoteData]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner un mode de paiement.');
      return;
    }

    if (!quoteData?.quote?.quote_id) {
      Alert.alert('Erreur', 'Données de devis manquantes.');
      return;
    }

    // SECURITY: Disable button during API call
    setLoading(true);
    setButtonDisabled(true);

    try {
      // SECURITY: Generate idempotency key to prevent duplicate payments
      const idempotencyKey = generateIdempotencyKey();
      
      console.log('[SHIPMENT_SUMMARY] Processing payment with idempotency key:', idempotencyKey);

      // SECURITY: Call API with rate limiting and idempotency
      const { data, error } = await processPaymentWithSecurity(
        quoteData.quote.quote_id,
        paymentMethod,
        '<secure_token>', // This would come from a payment provider SDK
        idempotencyKey
      );

      if (error) {
        console.error('[SHIPMENT_SUMMARY] Payment error:', error);
        
        // Handle specific error messages
        if (error.message?.includes('timeout') || error.message?.includes('expiré')) {
          Alert.alert('Erreur', 'La requête a expiré. Veuillez réessayer.');
        } else if (error.message?.includes('tentatives')) {
          Alert.alert('Erreur', error.message);
        } else if (error.message?.includes('refused') || error.message?.includes('refusé')) {
          Alert.alert('Erreur', 'Paiement refusé.');
        } else if (error.message?.includes('invalid') || error.message?.includes('invalide')) {
          Alert.alert('Erreur', 'Montant invalide.');
        } else {
          Alert.alert('Erreur', 'Une erreur s\'est produite lors du paiement.');
        }
        return;
      }

      console.log('[SHIPMENT_SUMMARY] Payment successful:', data);

      // Navigate to confirmation screen
      router.replace({
        pathname: '/shipment-confirmation',
        params: {
          shipmentId: data.shipment_id,
          trackingNumber: data.tracking_number,
        },
      });
    } catch (error) {
      console.error('[SHIPMENT_SUMMARY] Unexpected error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite.');
    } finally {
      // SECURITY: Re-enable button after API call completes
      setLoading(false);
      setButtonDisabled(false);
    }
  };

  if (!quoteData) {
    return (
      <ResponsiveContainer>
        <PageHeader title="Résumé de l'expédition" showBack />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement...</Text>
        </View>
      </ResponsiveContainer>
    );
  }

  const { sender, pickup, delivery, parcel, quote } = quoteData;

  return (
    <ResponsiveContainer>
      <PageHeader title="Résumé de l'expédition" showBack />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sender Information */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Expéditeur</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {sender.type === 'individual' ? 'Particulier' : 'Entreprise'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nom:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{sender.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Téléphone:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{sender.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{sender.email}</Text>
          </View>
        </View>

        {/* Pickup Address */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Collecte</Text>
          <Text style={[styles.addressText, { color: colors.text }]}>{pickup.address}</Text>
          <Text style={[styles.addressText, { color: colors.text }]}>
            {pickup.city}, {pickup.country}
          </Text>
        </View>

        {/* Delivery Address */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Livraison</Text>
          <Text style={[styles.addressText, { color: colors.text }]}>{delivery.address}</Text>
          <Text style={[styles.addressText, { color: colors.text }]}>
            {delivery.city}, {delivery.country}
          </Text>
        </View>

        {/* Parcel Details */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Détails du colis</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {parcel.type.charAt(0).toUpperCase() + parcel.type.slice(1)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Poids:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{parcel.weight_kg} kg</Text>
          </View>
          {parcel.declared_value > 0 && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Valeur déclarée:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>€{parcel.declared_value}</Text>
            </View>
          )}
          {parcel.options.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Options:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {parcel.options.map((opt: string) => 
                  opt === 'insurance' ? 'Assurance' : opt === 'express' ? 'Express' : 'Signature'
                ).join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Price Summary */}
        <View style={[styles.priceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.priceLabel}>Prix calculé</Text>
          <Text style={styles.priceValue}>€{quote?.price || '0.00'}</Text>
          {quote?.estimated_delivery && (
            <Text style={styles.deliveryEstimate}>
              Livraison estimée: {new Date(quote.estimated_delivery).toLocaleDateString('fr-FR')}
            </Text>
          )}
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mode de paiement</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              { 
                backgroundColor: paymentMethod === 'card' ? colors.accent : colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setPaymentMethod('card')}
            disabled={loading}
          >
            <IconSymbol
              ios_icon_name="creditcard.fill"
              android_material_icon_name="credit_card"
              size={24}
              color={paymentMethod === 'card' ? '#FFFFFF' : colors.text}
            />
            <Text style={[
              styles.paymentOptionText,
              { color: paymentMethod === 'card' ? '#FFFFFF' : colors.text }
            ]}>
              Carte bancaire
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { 
                backgroundColor: paymentMethod === 'mobile_money' ? colors.accent : colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setPaymentMethod('mobile_money')}
            disabled={loading}
          >
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone_android"
              size={24}
              color={paymentMethod === 'mobile_money' ? '#FFFFFF' : colors.text}
            />
            <Text style={[
              styles.paymentOptionText,
              { color: paymentMethod === 'mobile_money' ? '#FFFFFF' : colors.text }
            ]}>
              Mobile Money
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { 
                backgroundColor: paymentMethod === 'cash_on_delivery' ? colors.accent : colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setPaymentMethod('cash_on_delivery')}
            disabled={loading}
          >
            <IconSymbol
              ios_icon_name="banknote.fill"
              android_material_icon_name="payments"
              size={24}
              color={paymentMethod === 'cash_on_delivery' ? '#FFFFFF' : colors.text}
            />
            <Text style={[
              styles.paymentOptionText,
              { color: paymentMethod === 'cash_on_delivery' ? '#FFFFFF' : colors.text }
            ]}>
              Paiement à la livraison
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={[
            styles.payButton,
            { 
              backgroundColor: buttonDisabled || !paymentMethod ? colors.textSecondary : colors.success,
              opacity: buttonDisabled || !paymentMethod ? 0.6 : 1,
            }
          ]}
          onPress={handlePayment}
          disabled={buttonDisabled || !paymentMethod}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.payButtonText}>Payer maintenant</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  priceCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  priceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  deliveryEstimate: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
