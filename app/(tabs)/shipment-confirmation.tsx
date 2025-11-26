
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

  const handleTrackShipment = () => {
    router.push({
      pathname: '/shipment-detail',
      params: { id: shipmentId },
    });
  };

  const handleBackToDashboard = () => {
    router.replace('/client-dashboard');
  };

  return (
    <ResponsiveContainer>
      <PageHeader title="Confirmation" showBack={false} />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
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

        {/* Success Message */}
        <Text style={[styles.title, { color: colors.text }]}>
          Expédition créée avec succès !
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Votre paiement a été traité et votre expédition est confirmée.
        </Text>

        {/* Shipment Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Numéro d&apos;expédition
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {shipmentId?.substring(0, 8).toUpperCase() || 'N/A'}
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Numéro de suivi
            </Text>
            <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '700' }]}>
              {trackingNumber || 'N/A'}
            </Text>
          </View>
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

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
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

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <Text style={[styles.additionalInfoTitle, { color: colors.text }]}>
            Prochaines étapes
          </Text>
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Nous préparons votre expédition
            </Text>
          </View>
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Collecte à l&apos;adresse indiquée
            </Text>
          </View>
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Livraison à destination
            </Text>
          </View>
        </View>

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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  detailsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  infoBox: {
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
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
    borderRadius: 8,
    gap: 8,
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
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  additionalInfo: {
    width: '100%',
  },
  additionalInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
  },
});
