
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { PageHeader } from '@/components/PageHeader';
import { colors } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PaymentCancelScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();

  const handleRetryPayment = () => {
    router.push('/pricing');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleContactSupport = () => {
    router.push('/contact');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title="Paiement annulé" />
      
      <View style={styles.content}>
        <View style={[styles.cancelIcon, { backgroundColor: colors.textSecondary + '20' }]}>
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="cancel"
            size={80}
            color={colors.textSecondary}
          />
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Paiement annulé
        </Text>

        <Text style={[styles.message, { color: colors.textSecondary }]}>
          Vous avez annulé le processus de paiement. Aucun montant n&apos;a été débité de votre compte.
        </Text>

        <View style={[styles.infoBox, { backgroundColor: theme.colors.card }]}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Si vous avez rencontré un problème lors du paiement, n&apos;hésitez pas à contacter notre support.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleRetryPayment}
          >
            <IconSymbol
              ios_icon_name="arrow.clockwise"
              android_material_icon_name="refresh"
              size={20}
              color="#ffffff"
            />
            <Text style={styles.primaryButtonText}>
              Réessayer le paiement
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={handleContactSupport}
          >
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={20}
              color={theme.colors.text}
            />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
              Contacter le support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tertiaryButton]}
            onPress={handleGoHome}
          >
            <Text style={[styles.tertiaryButtonText, { color: colors.textSecondary }]}>
              Retour à l&apos;accueil
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reasonsContainer}>
          <Text style={[styles.reasonsTitle, { color: theme.colors.text }]}>
            Raisons courantes d&apos;annulation :
          </Text>
          
          <View style={styles.reasonItem}>
            <IconSymbol
              ios_icon_name="creditcard.fill"
              android_material_icon_name="credit_card"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
              Problème avec la carte bancaire
            </Text>
          </View>

          <View style={styles.reasonItem}>
            <IconSymbol
              ios_icon_name="questionmark.circle.fill"
              android_material_icon_name="help"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
              Besoin de plus d&apos;informations
            </Text>
          </View>

          <View style={styles.reasonItem}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="schedule"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
              Décision de payer plus tard
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 120,
    alignItems: 'center',
  },
  cancelIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
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
  tertiaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  reasonsContainer: {
    width: '100%',
    gap: 16,
  },
  reasonsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reasonText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
