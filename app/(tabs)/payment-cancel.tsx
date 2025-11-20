
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { PageHeader } from '@/components/PageHeader';
import { colors } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';

type PaymentContext = 'freight_quote' | 'pricing_plan' | 'unknown';

export default function PaymentCancelScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const [context, setContext] = useState<PaymentContext>('unknown');

  useEffect(() => {
    // Determine context from URL params
    if (params.context) {
      setContext(params.context as PaymentContext);
    }
  }, [params]);

  const handleReturnToQuotes = () => {
    router.push('/(tabs)/freight-quote');
  };

  const handleReturnToPlans = () => {
    router.push('/(tabs)/pricing');
  };

  const handleGoHome = () => {
    router.push('/(tabs)/(home)/');
  };

  const handleContactSupport = () => {
    router.push('/(tabs)/contact');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title="Paiement annulé" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
          Le paiement a été annulé. Vous pouvez réessayer à tout moment.
        </Text>

        <View style={[styles.infoBox, { backgroundColor: theme.colors.card }]}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Aucun montant n&apos;a été débité de votre compte. Si vous avez rencontré un problème, n&apos;hésitez pas à contacter notre support.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {context === 'freight_quote' ? (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleReturnToQuotes}
            >
              <IconSymbol
                ios_icon_name="doc.text"
                android_material_icon_name="description"
                size={20}
                color="#ffffff"
              />
              <Text style={styles.primaryButtonText}>
                Retour à mes devis
              </Text>
            </TouchableOpacity>
          ) : context === 'pricing_plan' ? (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleReturnToPlans}
            >
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={20}
                color="#ffffff"
              />
              <Text style={styles.primaryButtonText}>
                Retour aux plans
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleGoHome}
            >
              <IconSymbol
                ios_icon_name="house.fill"
                android_material_icon_name="home"
                size={20}
                color="#ffffff"
              />
              <Text style={styles.primaryButtonText}>
                Retour à l&apos;accueil
              </Text>
            </TouchableOpacity>
          )}

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 140,
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
    paddingHorizontal: 10,
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
