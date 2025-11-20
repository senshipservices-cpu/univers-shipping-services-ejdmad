
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

export default function VerifyEmailScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check if email is already verified
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (user?.email_confirmed_at) {
        console.log('Email already verified, redirecting to dashboard');
        router.replace('/(tabs)/client-dashboard');
      }
    };

    checkEmailVerification();
  }, [user, router]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!user?.email) {
      Alert.alert('Erreur', 'Aucun email trouvé pour cet utilisateur');
      return;
    }

    if (resendCooldown > 0) {
      Alert.alert('Veuillez patienter', `Vous pouvez renvoyer l'email dans ${resendCooldown} secondes`);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
        },
      });

      if (error) {
        console.error('Resend verification error:', error);
        Alert.alert('Erreur', error.message || 'Impossible de renvoyer l\'email de vérification');
      } else {
        Alert.alert(
          'Email envoyé',
          'Un nouvel email de vérification a été envoyé. Veuillez consulter votre boîte de réception.'
        );
        setResendCooldown(60); // 60 seconds cooldown
      }
    } catch (error) {
      console.error('Resend verification exception:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/(tabs)/login');
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    
    try {
      // Refresh the session to get the latest user data
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Refresh session error:', error);
        Alert.alert('Erreur', 'Impossible de vérifier le statut de votre email');
      } else if (data.user?.email_confirmed_at) {
        Alert.alert(
          'Email vérifié !',
          'Votre email a été vérifié avec succès. Vous pouvez maintenant accéder à votre compte.',
          [
            {
              text: 'Continuer',
              onPress: () => router.replace('/(tabs)/client-dashboard'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Email non vérifié',
          'Votre email n\'a pas encore été vérifié. Veuillez cliquer sur le lien dans l\'email que nous vous avons envoyé.'
        );
      }
    } catch (error) {
      console.error('Check verification exception:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol
            ios_icon_name="envelope.badge"
            android_material_icon_name="mark_email_unread"
            size={80}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>Vérifiez votre email</Text>
        
        <Text style={styles.message}>
          Veuillez vérifier votre adresse email pour accéder à votre compte. Consultez votre boîte de réception.
        </Text>

        {user?.email && (
          <View style={styles.emailBox}>
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.emailText}>{user.email}</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            Cliquez sur le lien dans l&apos;email que nous vous avons envoyé pour vérifier votre adresse.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, (loading || resendCooldown > 0) && styles.buttonDisabled]}
          onPress={handleResendVerification}
          disabled={loading || resendCooldown > 0}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.primaryButtonText}>
                {resendCooldown > 0 
                  ? `Renvoyer dans ${resendCooldown}s` 
                  : 'Renvoyer l\'email de vérification'}
              </Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, loading && styles.buttonDisabled]}
          onPress={handleCheckVerification}
          disabled={loading}
        >
          <IconSymbol
            ios_icon_name="checkmark.circle"
            android_material_icon_name="check_circle"
            size={20}
            color={colors.primary}
            style={styles.buttonIcon}
          />
          <Text style={styles.secondaryButtonText}>
            J&apos;ai vérifié mon email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={styles.helpBox}>
          <Text style={styles.helpText}>
            Vous n&apos;avez pas reçu l&apos;email ?
          </Text>
          <Text style={styles.helpSubtext}>
            - Vérifiez votre dossier spam ou courrier indésirable{'\n'}
            - Assurez-vous que l&apos;adresse email est correcte{'\n'}
            - Attendez quelques minutes et réessayez
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 80 : 100,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  emailText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: 32,
    width: '100%',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    width: '100%',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 12,
    marginTop: 8,
  },
  logoutButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  helpBox: {
    marginTop: 32,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  helpText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  helpSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
