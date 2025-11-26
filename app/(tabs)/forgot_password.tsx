
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

/**
 * ForgotPassword Screen - PARTIE 3/3
 * 
 * SCREEN_ID: ForgotPassword
 * TITLE: "Mot de passe oublié"
 * ROUTE: "/forgot-password"
 * 
 * Implements the password reset flow with:
 * - Email field with validation
 * - Reset button that calls the forgot password API
 * - Generic success/error messages for security
 * - Navigation to Login screen after API call
 * 
 * SECURITY NOTES:
 * - API is silent (same response whether email exists or not)
 * - Generic message prevents account enumeration
 * - Reset link expires after limited time (handled by backend)
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  // Form fields
  const [email, setEmail] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Field-specific errors for validation
  const [emailError, setEmailError] = useState<string | null>(null);

  /**
   * Validate email field
   * Rules:
   * - Required: "Merci d'indiquer votre email."
   * - Email format: "Adresse email invalide."
   */
  const validateEmail = (value: string): boolean => {
    if (!value || value.trim().length === 0) {
      setEmailError("Merci d'indiquer votre email.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Adresse email invalide.");
      return false;
    }

    setEmailError(null);
    return true;
  };

  /**
   * Show toast message
   * Helper function to display toast notifications
   */
  const showToast = (message: string, variant: 'success' | 'error') => {
    if (variant === 'success') {
      Alert.alert('Succès', message);
    } else {
      Alert.alert('Information', message);
    }
  };

  /**
   * Handle reset password button click
   * 
   * LOGIQUE BOUTON Réinitialiser mon mot de passe
   * 
   * Flow:
   * 1. Validate email field
   * 2. Set loading state on button
   * 3. Call API POST /auth/forgot-password (via Supabase)
   * 4. On success:
   *    - Set loading to false
   *    - Show generic success toast
   *    - Navigate to Login
   * 5. On error:
   *    - Set loading to false
   *    - Show generic success toast (same message for security)
   * 
   * 🔒 Security: Generic message to prevent revealing if email exists
   */
  const handleResetPassword = async () => {
    console.log('=== RESET PASSWORD BUTTON CLICKED ===');
    console.log('Email:', email);

    // Clear previous errors
    setErrorMessage(null);
    setEmailError(null);

    // Step 1: Validate email field
    const isEmailValid = validateEmail(email);

    if (!isEmailValid) {
      console.log('Validation failed, stopping flow');
      return;
    }

    // Step 2: Set loading state on button
    console.log('Starting password reset process...');
    setLoading(true);
    
    try {
      // Step 3: Call API POST /auth/forgot-password
      // Note: Supabase handles the actual API call
      console.log('Calling password reset API for email:', email.trim().toLowerCase());
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: 'https://natively.dev/email-confirmed',
        }
      );
      
      console.log('Password reset API result:', error ? 'Error' : 'Success');
      
      // Step 4 & 5: On success OR error - Show generic message
      // 🔒 Security: Same message regardless of whether email exists
      setLoading(false);
      
      const genericMessage = "Si un compte existe avec cet email, un lien de réinitialisation vous a été envoyé.";
      
      if (error) {
        console.error('Password reset error:', error);
        // Still show success message for security
        showToast(genericMessage, 'success');
      } else {
        console.log('Password reset email sent successfully');
        showToast(genericMessage, 'success');
      }
      
      // Navigate to Login screen
      console.log('Navigating to Login screen...');
      router.replace('/(tabs)/login');
      
    } catch (error: any) {
      console.error('Password reset exception:', error);
      
      // Step 5: On error - Set loading to false and show generic message
      setLoading(false);
      
      // 🔒 Security: Generic message even on exception
      const genericMessage = "Si un compte existe avec cet email, un lien de réinitialisation vous a été envoyé.";
      showToast(genericMessage, 'success');
      
      // Navigate to Login screen
      console.log('Navigating to Login screen...');
      router.replace('/(tabs)/login');
    }
  };

  /**
   * Handle back to login
   * Navigate to Login screen
   */
  const handleBackToLogin = () => {
    console.log('Navigating back to Login screen...');
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        
        <Text style={styles.title}>Mot de passe oublié</Text>
        <Text style={styles.subtitle}>
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </Text>
      </View>

      {/* Global Error Message Display */}
      {errorMessage && (
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="error"
            size={20}
            color={colors.error}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <View style={styles.form}>
        {/* Email Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email associé au compte</Text>
          <View style={[
            styles.inputWrapper,
            emailError && styles.inputWrapperError
          ]}>
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={20}
              color={emailError ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(null);
                setErrorMessage(null);
              }}
              onBlur={() => validateEmail(email)}
              placeholder="votre@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
          {emailError && (
            <Text style={styles.fieldError}>{emailError}</Text>
          )}
        </View>

        {/* Reset Button - btn_reset */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Réinitialiser mon mot de passe</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Security Info Box */}
      <View style={styles.infoBox}>
        <IconSymbol
          ios_icon_name="lock.shield.fill"
          android_material_icon_name="security"
          size={20}
          color={colors.primary}
          style={styles.infoIcon}
        />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>Sécurité et confidentialité</Text>
          <Text style={styles.infoText}>
            Pour des raisons de sécurité, nous ne révélons pas si un compte existe avec cet email. 
            Si vous avez un compte, vous recevrez un email de réinitialisation. 
            Le lien est valide pendant 24 heures.
          </Text>
        </View>
      </View>

      {/* Additional Info Box */}
      <View style={styles.helpBox}>
        <IconSymbol
          ios_icon_name="questionmark.circle.fill"
          android_material_icon_name="help"
          size={20}
          color={colors.textSecondary}
          style={styles.infoIcon}
        />
        <View style={styles.infoTextContainer}>
          <Text style={styles.helpTitle}>Besoin d&apos;aide ?</Text>
          <Text style={styles.helpText}>
            Si vous ne recevez pas l&apos;email, vérifiez vos spams ou contactez notre support.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 60 : 80,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  errorIcon: {
    marginRight: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  inputWrapperError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  fieldError: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  helpBox: {
    flexDirection: 'row',
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
