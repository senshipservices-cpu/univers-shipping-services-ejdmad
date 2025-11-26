
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { Logo } from '@/components/Logo';
import { colors } from '@/styles/commonStyles';
import { getFontSize, spacing, borderRadius, getShadow } from '@/styles/responsiveStyles';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

/**
 * USS Error Screen - Universal Error Handler
 * 
 * This screen is displayed when unhandled errors occur in the application.
 * It provides a consistent error experience across Web, iOS, and Android.
 * 
 * Features:
 * - Retry functionality (navigates home)
 * - Support contact information
 * - Professional USS branding
 * - Platform-specific behavior
 */
export default function ErrorScreen() {
  const router = useRouter();
  const theme = useTheme();

  const handleRetry = async () => {
    console.log('🔄 [ERROR_SCREEN] User clicked Retry button');
    
    try {
      // Navigate to home screen
      console.log('[ERROR_SCREEN] Navigating to home screen');
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.error('[ERROR_SCREEN] Error during retry:', error);
      // Last resort: just navigate to home
      router.replace('/(tabs)/(home)/');
    }
  };

  const handleContactSupport = () => {
    console.log('📧 [ERROR_SCREEN] User clicked Contact Support');
    // Open email client or navigate to contact page
    if (Platform.OS === 'web') {
      window.location.href = 'mailto:support@universalshippingservices.com?subject=Erreur%20Application';
    } else {
      router.push({
        pathname: '/(tabs)/contact',
        params: { subject: 'Erreur application - Besoin d\'aide' }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer>
          <View style={styles.content}>
            {/* Logo USS */}
            <View style={styles.logoContainer}>
              <Logo width={140} showText={false} />
            </View>

            {/* Error Icon */}
            <View style={[styles.errorIconContainer, { backgroundColor: colors.error + '15' }]}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="error"
                size={72}
                color={colors.error}
              />
            </View>

            {/* Error Message */}
            <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
              Oups, une erreur est survenue…
            </Text>

            <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
              Nous sommes désolés pour ce désagrément. Notre équipe a été notifiée et travaille à résoudre le problème.
            </Text>

            {/* Retry Button */}
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }, getShadow('lg')]}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={24}
                color="#ffffff"
              />
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>

            {/* Support Contact */}
            <View style={[styles.supportCard, { backgroundColor: theme.colors.card }, getShadow('md')]}>
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={28}
                color={colors.primary}
              />
              <View style={styles.supportContent}>
                <Text style={[styles.supportTitle, { color: theme.colors.text }]}>
                  Besoin d&apos;aide ?
                </Text>
                <TouchableOpacity onPress={handleContactSupport}>
                  <Text style={[styles.supportEmail, { color: colors.primary }]}>
                    support@universalshippingservices.com
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.supportText, { color: colors.textSecondary }]}>
                  Notre équipe support est disponible 24/7
                </Text>
              </View>
            </View>

            {/* Additional Info */}
            <View style={styles.infoContainer}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={22}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Si le problème persiste après plusieurs tentatives, veuillez contacter notre support technique avec une description détaillée de l&apos;erreur.
              </Text>
            </View>

            {/* Platform Info (Dev Only) */}
            {__DEV__ && (
              <View style={[styles.devInfo, { backgroundColor: colors.card }]}>
                <Text style={[styles.devInfoText, { color: colors.textSecondary }]}>
                  🔧 Mode Développement
                </Text>
                <Text style={[styles.devInfoText, { color: colors.textSecondary }]}>
                  Platform: {Platform.OS}
                </Text>
                <Text style={[styles.devInfoText, { color: colors.textSecondary }]}>
                  Version: {Platform.Version}
                </Text>
              </View>
            )}
          </View>
        </ResponsiveContainer>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.huge,
    paddingTop: Platform.OS === 'android' ? 48 + spacing.huge : spacing.huge,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.xxxl,
  },
  errorIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
  },
  errorTitle: {
    fontSize: getFontSize('xxxl'),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorMessage: {
    fontSize: getFontSize('lg'),
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xxxl,
    maxWidth: 500,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.huge,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    marginBottom: spacing.xxxl,
    minWidth: 250,
  },
  retryButtonText: {
    fontSize: getFontSize('xl'),
    fontWeight: '700',
    color: '#ffffff',
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.xxxl,
    borderRadius: borderRadius.xl,
    gap: spacing.lg,
    width: '100%',
    maxWidth: 500,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportContent: {
    flex: 1,
    gap: spacing.sm,
  },
  supportTitle: {
    fontSize: getFontSize('xl'),
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  supportEmail: {
    fontSize: getFontSize('lg'),
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginBottom: spacing.sm,
  },
  supportText: {
    fontSize: getFontSize('sm'),
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    maxWidth: 500,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.highlight,
    borderRadius: borderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: getFontSize('sm'),
    lineHeight: 20,
  },
  devInfo: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  devInfoText: {
    fontSize: getFontSize('sm'),
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    marginBottom: 4,
  },
});
