
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { PageHeader } from '@/components/PageHeader';
import { colors } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking payment status
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleGoToDashboard = () => {
    router.push('/client-dashboard');
  };

  const handleGoToPricing = () => {
    router.push('/pricing');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <PageHeader title="Paiement" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Vérification du paiement...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title="Paiement réussi" />
      
      <View style={styles.content}>
        <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check_circle"
            size={80}
            color={colors.success}
          />
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Paiement réussi !
        </Text>

        <Text style={[styles.message, { color: colors.textSecondary }]}>
          Votre paiement a été traité avec succès. Votre abonnement sera activé dans quelques instants.
        </Text>

        <View style={[styles.infoBox, { backgroundColor: theme.colors.card }]}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Vous recevrez un email de confirmation avec tous les détails de votre abonnement.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleGoToDashboard}
          >
            <IconSymbol
              ios_icon_name="house.fill"
              android_material_icon_name="dashboard"
              size={20}
              color="#ffffff"
            />
            <Text style={styles.primaryButtonText}>
              Accéder au tableau de bord
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={handleGoToPricing}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
              Retour aux plans
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
            Prochaines étapes :
          </Text>
          
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="1.circle.fill"
              android_material_icon_name="looks_one"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Consultez votre email pour la confirmation
            </Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="2.circle.fill"
              android_material_icon_name="looks_two"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Explorez les fonctionnalités de votre plan
            </Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="3.circle.fill"
              android_material_icon_name="looks_3"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Contactez le support si vous avez des questions
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 120,
    alignItems: 'center',
  },
  successIcon: {
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
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
