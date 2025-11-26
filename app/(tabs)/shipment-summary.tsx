
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { useShipment } from '@/contexts/ShipmentContext';
import { processPaymentWithSecurity } from '@/utils/apiClient';
import { generateIdempotencyKey } from '@/utils/trackingGenerator';

type PaymentMethod = 'card' | 'mobile_money' | 'cash_on_delivery';

export default function ShipmentSummaryScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const { formData: contextFormData, quoteData: contextQuoteData, clearShipmentData } = useShipment();
  
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);

  useEffect(() => {
    // Try to load from navigation params first, then fall back to context
    if (params.quoteData) {
      try {
        const data = JSON.parse(params.quoteData as string);
        setQuoteData(data);
        console.log('[SHIPMENT_SUMMARY] Quote data loaded from params:', data);
      } catch (error) {
        console.error('[SHIPMENT_SUMMARY] Error parsing quote data:', error);
        
        // Fall back to context data
        if (contextFormData && contextQuoteData) {
          setQuoteData({
            ...contextFormData,
            quote: contextQuoteData,
          });
          console.log('[SHIPMENT_SUMMARY] Quote data loaded from context');
        } else {
          Alert.alert('Erreur', 'Données de devis invalides.');
          router.back();
        }
      }
    } else if (contextFormData && contextQuoteData) {
      // Load from context if no params
      setQuoteData({
        ...contextFormData,
        quote: contextQuoteData,
      });
      console.log('[SHIPMENT_SUMMARY] Quote data loaded from context');
    } else {
      Alert.alert('Erreur', 'Aucune donnée de devis disponible.');
      router.back();
    }
  }, [params.quoteData, contextFormData, contextQuoteData]);

  const handleModify = () => {
    console.log('[SHIPMENT_SUMMARY] Modify button pressed');
    router.back();
  };

  const handlePayment = async () => {
    console.log('[SHIPMENT_SUMMARY] Pay Now button pressed');
    
    // VALIDATION: Check payment method
    if (!paymentMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner un mode de paiement.');
      return;
    }

    // VALIDATION: Check terms acceptance
    if (!acceptedTerms) {
      Alert.alert('Erreur', 'Veuillez accepter les conditions générales d\'utilisation.');
      return;
    }

    // VALIDATION: Check quote data
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
      console.log('[SHIPMENT_SUMMARY] Quote ID:', quoteData.quote.quote_id);
      console.log('[SHIPMENT_SUMMARY] Payment method:', paymentMethod);

      // SECURITY: Call API with rate limiting and idempotency
      // In production, payment_token would come from payment provider SDK (Stripe, PayPal, etc.)
      const paymentToken = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const { data, error } = await processPaymentWithSecurity(
        quoteData.quote.quote_id,
        paymentMethod,
        paymentToken,
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
          Alert.alert('Erreur', 'Paiement refusé. Veuillez vérifier vos informations de paiement.');
        } else if (error.message?.includes('invalid') || error.message?.includes('invalide')) {
          Alert.alert('Erreur', 'Montant invalide.');
        } else if (error.message?.includes('déjà été payé')) {
          Alert.alert('Erreur', 'Ce devis a déjà été payé.');
        } else {
          Alert.alert('Erreur', 'Une erreur s\'est produite lors du paiement. Veuillez réessayer.');
        }
        return;
      }

      console.log('[SHIPMENT_SUMMARY] Payment successful:', data);

      // Clear shipment context data
      clearShipmentData();

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
        {/* PARTIE 4: AFFICHAGE RÉCAPITULATIF */}
        
        {/* Price Summary - Highlighted at top */}
        <View style={[styles.priceCard, { backgroundColor: colors.primary }]}>
          <View style={styles.priceHeader}>
            <IconSymbol
              ios_icon_name="dollarsign.circle.fill"
              android_material_icon_name="payments"
              size={32}
              color="#FFFFFF"
            />
            <View style={styles.priceTextContainer}>
              <Text style={styles.priceLabel}>Prix total</Text>
              <Text style={styles.priceValue}>€{quote?.price || '0.00'}</Text>
            </View>
          </View>
          {quote?.estimated_delivery && (
            <View style={styles.deliveryEstimateContainer}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="event"
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.deliveryEstimate}>
                Livraison estimée: {new Date(quote.estimated_delivery).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Sender Information */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <IconSymbol
              ios_icon_name="person.circle.fill"
              android_material_icon_name="account_circle"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Expéditeur</Text>
          </View>
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
          <View style={styles.cardHeader}>
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="inventory_2"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Adresse de collecte</Text>
          </View>
          <Text style={[styles.addressText, { color: colors.text }]}>{pickup.address}</Text>
          <Text style={[styles.addressText, { color: colors.text }]}>
            {pickup.city}, {pickup.country}
          </Text>
        </View>

        {/* Delivery Address */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="place"
              size={24}
              color={colors.secondary}
            />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Adresse de livraison</Text>
          </View>
          <Text style={[styles.addressText, { color: colors.text }]}>{delivery.address}</Text>
          <Text style={[styles.addressText, { color: colors.text }]}>
            {delivery.city}, {delivery.country}
          </Text>
        </View>

        {/* Parcel Details */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <IconSymbol
              ios_icon_name="cube.box.fill"
              android_material_icon_name="package_2"
              size={24}
              color={colors.secondary}
            />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Détails du colis</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {parcel.type === 'document' ? 'Document' : 
               parcel.type === 'standard' ? 'Standard' :
               parcel.type === 'fragile' ? 'Fragile' : 'Express'}
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

        {/* PARTIE 4: CHAMP PAIEMENT - Payment Method Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="creditcard.fill"
              android_material_icon_name="payment"
              size={24}
              color={colors.accent}
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mode de paiement</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              { 
                backgroundColor: paymentMethod === 'card' ? colors.accent : colors.card,
                borderColor: paymentMethod === 'card' ? colors.accent : colors.border,
              }
            ]}
            onPress={() => setPaymentMethod('card')}
            disabled={loading}
          >
            <View style={styles.paymentOptionLeft}>
              <IconSymbol
                ios_icon_name="creditcard.fill"
                android_material_icon_name="credit_card"
                size={24}
                color={paymentMethod === 'card' ? '#FFFFFF' : colors.text}
              />
              <View style={styles.paymentOptionTextContainer}>
                <Text style={[
                  styles.paymentOptionText,
                  { color: paymentMethod === 'card' ? '#FFFFFF' : colors.text }
                ]}>
                  Carte bancaire
                </Text>
                <Text style={[
                  styles.paymentOptionDescription,
                  { color: paymentMethod === 'card' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                ]}>
                  Visa, Mastercard, American Express
                </Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name={paymentMethod === 'card' ? 'checkmark.circle.fill' : 'circle'}
              android_material_icon_name={paymentMethod === 'card' ? 'check_circle' : 'radio_button_unchecked'}
              size={24}
              color={paymentMethod === 'card' ? '#FFFFFF' : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { 
                backgroundColor: paymentMethod === 'mobile_money' ? colors.accent : colors.card,
                borderColor: paymentMethod === 'mobile_money' ? colors.accent : colors.border,
              }
            ]}
            onPress={() => setPaymentMethod('mobile_money')}
            disabled={loading}
          >
            <View style={styles.paymentOptionLeft}>
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone_android"
                size={24}
                color={paymentMethod === 'mobile_money' ? '#FFFFFF' : colors.text}
              />
              <View style={styles.paymentOptionTextContainer}>
                <Text style={[
                  styles.paymentOptionText,
                  { color: paymentMethod === 'mobile_money' ? '#FFFFFF' : colors.text }
                ]}>
                  Mobile Money
                </Text>
                <Text style={[
                  styles.paymentOptionDescription,
                  { color: paymentMethod === 'mobile_money' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                ]}>
                  Orange Money, MTN, Moov
                </Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name={paymentMethod === 'mobile_money' ? 'checkmark.circle.fill' : 'circle'}
              android_material_icon_name={paymentMethod === 'mobile_money' ? 'check_circle' : 'radio_button_unchecked'}
              size={24}
              color={paymentMethod === 'mobile_money' ? '#FFFFFF' : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { 
                backgroundColor: paymentMethod === 'cash_on_delivery' ? colors.accent : colors.card,
                borderColor: paymentMethod === 'cash_on_delivery' ? colors.accent : colors.border,
              }
            ]}
            onPress={() => setPaymentMethod('cash_on_delivery')}
            disabled={loading}
          >
            <View style={styles.paymentOptionLeft}>
              <IconSymbol
                ios_icon_name="banknote.fill"
                android_material_icon_name="payments"
                size={24}
                color={paymentMethod === 'cash_on_delivery' ? '#FFFFFF' : colors.text}
              />
              <View style={styles.paymentOptionTextContainer}>
                <Text style={[
                  styles.paymentOptionText,
                  { color: paymentMethod === 'cash_on_delivery' ? '#FFFFFF' : colors.text }
                ]}>
                  Paiement à la livraison
                </Text>
                <Text style={[
                  styles.paymentOptionDescription,
                  { color: paymentMethod === 'cash_on_delivery' ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                ]}>
                  Payez en espèces lors de la réception
                </Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name={paymentMethod === 'cash_on_delivery' ? 'checkmark.circle.fill' : 'circle'}
              android_material_icon_name={paymentMethod === 'cash_on_delivery' ? 'check_circle' : 'radio_button_unchecked'}
              size={24}
              color={paymentMethod === 'cash_on_delivery' ? '#FFFFFF' : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* PARTIE 4: CHECKBOX CGU - Terms and Conditions */}
        <TouchableOpacity
          style={[styles.termsContainer, { borderColor: colors.border }]}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
          disabled={loading}
        >
          <View style={[
            styles.checkbox,
            { 
              backgroundColor: acceptedTerms ? colors.primary : 'transparent',
              borderColor: acceptedTerms ? colors.primary : colors.border,
            }
          ]}>
            {acceptedTerms && (
              <IconSymbol
                ios_icon_name="checkmark"
                android_material_icon_name="check"
                size={16}
                color="#FFFFFF"
              />
            )}
          </View>
          <Text style={[styles.termsText, { color: colors.text }]}>
            J&apos;accepte les{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              conditions générales d&apos;utilisation
            </Text>
            {' '}et la{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              politique de confidentialité
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* PARTIE 4: BOUTON MODIFIER */}
          <TouchableOpacity
            style={[styles.modifyButton, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={handleModify}
            disabled={loading}
          >
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.modifyButtonText, { color: colors.text }]}>
              Modifier
            </Text>
          </TouchableOpacity>

          {/* PARTIE 4: BOUTON PAYER MAINTENANT */}
          <TouchableOpacity
            style={[
              styles.payButton,
              { 
                backgroundColor: buttonDisabled || !paymentMethod || !acceptedTerms ? colors.textSecondary : colors.success,
                opacity: buttonDisabled || !paymentMethod || !acceptedTerms ? 0.6 : 1,
              }
            ]}
            onPress={handlePayment}
            disabled={buttonDisabled || !paymentMethod || !acceptedTerms}
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
        </View>

        {/* Security Notice */}
        <View style={[styles.securityNotice, { backgroundColor: colors.highlight }]}>
          <IconSymbol
            ios_icon_name="lock.shield.fill"
            android_material_icon_name="security"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.securityNoticeText, { color: colors.textSecondary }]}>
            Paiement sécurisé. Vos informations sont protégées et cryptées.
          </Text>
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  priceCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priceTextContainer: {
    flex: 1,
  },
  priceLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.9,
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  deliveryEstimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  deliveryEstimate: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    flex: 1,
    textAlign: 'right',
  },
  addressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentOptionTextContainer: {
    flex: 1,
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentOptionDescription: {
    fontSize: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  modifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  securityNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
