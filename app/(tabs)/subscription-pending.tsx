
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";

export default function SubscriptionPendingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)/client-dashboard')}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Abonnement en attente
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="schedule"
              size={80}
              color={colors.primary}
            />
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Votre abonnement a été enregistré
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Merci pour votre demande d&apos;abonnement !
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.infoHeader}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={32}
              color={colors.primary}
            />
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              Prochaines étapes
            </Text>
          </View>

          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                  Validation de votre demande
                </Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Notre équipe va vérifier votre demande d&apos;abonnement et vous contacter pour finaliser les détails.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.secondary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                  Confirmation du paiement
                </Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Vous recevrez un email avec les instructions de paiement et les modalités de votre abonnement.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                  Activation de votre abonnement
                </Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Une fois le paiement confirmé, votre abonnement sera activé et vous aurez accès à toutes les fonctionnalités.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.success }]}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                  Email de confirmation
                </Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Vous recevrez un email de confirmation avec tous les détails de votre abonnement actif.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.contactCard, { backgroundColor: theme.colors.card }]}>
          <IconSymbol
            ios_icon_name="envelope.fill"
            android_material_icon_name="email"
            size={32}
            color={colors.accent}
          />
          <Text style={[styles.contactTitle, { color: theme.colors.text }]}>
            Besoin d&apos;aide ?
          </Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            Notre équipe est disponible pour répondre à toutes vos questions concernant votre abonnement.
          </Text>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/contact')}
          >
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={20}
              color="#ffffff"
            />
            <Text style={styles.contactButtonText}>
              Nous contacter
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/(tabs)/client-dashboard')}
          >
            <Text style={styles.primaryButtonText}>
              Retour au tableau de bord
            </Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow_forward"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/pricing')}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
              Voir tous les plans
            </Text>
          </TouchableOpacity>
        </View>
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
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  stepsList: {
    gap: 24,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
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
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
