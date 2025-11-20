
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { PageHeader } from '@/components/PageHeader';
import { colors } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/app/integrations/supabase/client';

type PaymentContext = 'freight_quote' | 'pricing_plan' | 'unknown';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<PaymentContext>('unknown');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session_id from URL params
    const session = params.session_id as string;
    setSessionId(session);

    // Determine context from URL params or session metadata
    const checkPaymentContext = async () => {
      try {
        if (session) {
          // Call Edge Function to get session details
          const { data, error } = await supabase.functions.invoke('get-checkout-session', {
            body: { sessionId: session },
          });

          if (error) {
            console.error('Error fetching session:', error);
          } else if (data?.metadata?.context) {
            setContext(data.metadata.context as PaymentContext);
          }
        }

        // Fallback: check URL params
        if (params.context) {
          setContext(params.context as PaymentContext);
        }
      } catch (error) {
        console.error('Error checking payment context:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentContext();
  }, [params]);

  const handleGoToDashboard = () => {
    router.push('/(tabs)/client-dashboard');
  };

  const handleGoToQuotes = () => {
    router.push('/(tabs)/freight-quote');
  };

  const handleGoToPricing = () => {
    router.push('/(tabs)/pricing');
  };

  const getContextMessage = () => {
    switch (context) {
      case 'freight_quote':
        return {
          title: 'Paiement reçu !',
          message: 'Merci, votre paiement pour le devis a été reçu. Votre expédition est en cours de création.',
          icon: 'shippingbox.fill' as const,
          iconAndroid: 'inventory_2' as const,
        };
      case 'pricing_plan':
        return {
          title: 'Plan activé !',
          message: 'Merci, votre plan est activé. Vous pouvez maintenant accéder à toutes les fonctionnalités incluses.',
          icon: 'checkmark.seal.fill' as const,
          iconAndroid: 'verified' as const,
        };
      default:
        return {
          title: 'Paiement réussi !',
          message: 'Votre paiement a été traité avec succès. Vous recevrez un email de confirmation dans quelques instants.',
          icon: 'checkmark.circle.fill' as const,
          iconAndroid: 'check_circle' as const,
        };
    }
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

  const contextInfo = getContextMessage();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title="Paiement réussi" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
          <IconSymbol
            ios_icon_name={contextInfo.icon}
            android_material_icon_name={contextInfo.iconAndroid}
            size={80}
            color={colors.success}
          />
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          {contextInfo.title}
        </Text>

        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {contextInfo.message}
        </Text>

        <View style={[styles.infoBox, { backgroundColor: theme.colors.card }]}>
          <IconSymbol
            ios_icon_name="envelope.fill"
            android_material_icon_name="email"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Vous recevrez un email de confirmation avec tous les détails de votre {context === 'freight_quote' ? 'expédition' : 'abonnement'}.
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
              Aller à mon espace client
            </Text>
          </TouchableOpacity>

          {context === 'freight_quote' ? (
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={handleGoToQuotes}
            >
              <IconSymbol
                ios_icon_name="doc.text"
                android_material_icon_name="description"
                size={20}
                color={theme.colors.text}
              />
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                Voir mes devis / commandes
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={handleGoToPricing}
            >
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={20}
                color={theme.colors.text}
              />
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                Découvrir d&apos;autres plans
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
            Prochaines étapes :
          </Text>
          
          {context === 'freight_quote' ? (
            <React.Fragment>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="1.circle.fill"
                  android_material_icon_name="looks_one"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  Consultez votre email pour la confirmation de paiement
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
                  Votre expédition sera créée automatiquement
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
                  Suivez votre expédition depuis votre espace client
                </Text>
              </View>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="1.circle.fill"
                  android_material_icon_name="looks_one"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  Consultez votre email pour la confirmation d&apos;activation
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
            </React.Fragment>
          )}
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 140,
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
