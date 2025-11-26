
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/styles/commonStyles';
import { PageHeader } from '@/components/PageHeader';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ShipmentConfirmationScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  
  const shipmentId = params.shipmentId as string;
  const trackingNumber = params.trackingNumber as string;

  console.log('[SHIPMENT_CONFIRMATION] Screen loaded with:', { shipmentId, trackingNumber });

  // PARTIE 4: BOUTON SUIVRE MON COLIS
  const handleTrackShipment = () => {
    console.log('[SHIPMENT_CONFIRMATION] Track shipment button pressed');
    router.push({
      pathname: '/shipment-detail',
      params: { id: shipmentId },
    });
  };

  // PARTIE 4: BOUTON RETOUR DASHBOARD
  const handleBackToDashboard = () => {
    console.log('[SHIPMENT_CONFIRMATION] Back to dashboard button pressed');
    router.replace('/client-dashboard');
  };

  const handleShareTracking = async () => {
    try {
      const message = `Suivez mon colis avec le numéro de suivi: ${trackingNumber}`;
      await Share.share({
        message,
        title: 'Numéro de suivi',
      });
    } catch (error) {
      console.error('[SHIPMENT_CONFIRMATION] Error sharing:', error);
    }
  };

  return (
    <ResponsiveContainer>
      <PageHeader title="Confirmation" showBack={false} />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* PARTIE 4: MESSAGE SUCCÈS - Success Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.success }]}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check_circle"
              size={80}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* PARTIE 4: MESSAGE SUCCÈS - Success Message */}
        <Text style={[styles.title, { color: colors.text }]}>
          Expédition créée avec succès !
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Votre paiement a été traité et votre expédition est confirmée.
        </Text>

        {/* PARTIE 4: AFFICHAGE RÉFÉRENCES - Shipment Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <IconSymbol
                ios_icon_name="number.circle.fill"
                android_material_icon_name="tag"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Numéro d&apos;expédition
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {shipmentId?.substring(0, 8).toUpperCase() || 'N/A'}
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <IconSymbol
                ios_icon_name="location.circle.fill"
                android_material_icon_name="local_shipping"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Numéro de suivi
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '700' }]}>
              {trackingNumber || 'N/A'}
            </Text>
          </View>

          {/* Share Tracking Button */}
          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: colors.highlight }]}
            onPress={handleShareTracking}
          >
            <IconSymbol
              ios_icon_name="square.and.arrow.up"
              android_material_icon_name="share"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.shareButtonText, { color: colors.primary }]}>
              Partager le numéro de suivi
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.highlight }]}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Vous recevrez un email de confirmation avec tous les détails de votre expédition. 
            Vous pouvez suivre votre colis en temps réel depuis votre tableau de bord.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* PARTIE 4: BOUTON SUIVRE MON COLIS */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleTrackShipment}
          >
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location_on"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.primaryButtonText}>Suivre mon colis</Text>
          </TouchableOpacity>

          {/* PARTIE 4: BOUTON RETOUR DASHBOARD */}
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={handleBackToDashboard}
          >
            <IconSymbol
              ios_icon_name="house.fill"
              android_material_icon_name="home"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Retour au dashboard
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info - Next Steps */}
        <View style={styles.additionalInfo}>
          <Text style={[styles.additionalInfoTitle, { color: colors.text }]}>
            Prochaines étapes
          </Text>
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Préparation de l&apos;expédition
              </Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Nous préparons votre colis et organisons la collecte
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={[styles.stepNumber, { backgroundColor: colors.secondary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Collecte à l&apos;adresse indiquée
              </Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Notre équipe viendra récupérer votre colis
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Livraison à destination
              </Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Votre colis sera livré à l&apos;adresse de destination
              </Text>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={[styles.supportSection, { backgroundColor: colors.card }]}>
          <View style={styles.supportHeader}>
            <IconSymbol
              ios_icon_name="questionmark.circle.fill"
              android_material_icon_name="help"
              size={24}
              color={colors.accent}
            />
            <Text style={[styles.supportTitle, { color: colors.text }]}>
              Besoin d&apos;aide ?
            </Text>
          </View>
          <Text style={[styles.supportText, { color: colors.textSecondary }]}>
            Notre équipe est disponible 24/7 pour répondre à vos questions.
          </Text>
          <TouchableOpacity
            style={[styles.supportButton, { borderColor: colors.accent }]}
            onPress={() => router.push('/contact')}
          >
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={18}
              color={colors.accent}
            />
            <Text style={[styles.supportButtonText, { color: colors.accent }]}>
              Contacter le support
            </Text>
          </TouchableOpacity>
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
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  detailsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  additionalInfo: {
    width: '100%',
    marginBottom: 24,
  },
  additionalInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
  },
  supportSection: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  supportText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
