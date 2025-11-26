
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
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Login Screen - PARTIE 1/3
 * 
 * SCREEN_ID: Login
 * TITLE: "Connexion"
 * ROUTE: "/login"
 * 
 * Implements the authentication flow with:
 * - Email and password fields with validation
 * - Remember me checkbox for persistent sessions
 * - Links to forgot password and registration
 * - Generic error messages for security
 */
export default function LoginScreen() {
  const { signIn, signInWithGoogle, loading: authLoading, user, isEmailVerified } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Field-specific errors for validation
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
   * Validate password field
   * Rules:
   * - Required: "Merci d'indiquer votre mot de passe."
   * - Min length 6: "Le mot de passe est trop court."
   */
  const validatePassword = (value: string): boolean => {
    if (!value || value.length === 0) {
      setPasswordError("Merci d'indiquer votre mot de passe.");
      return false;
    }

    if (value.length < 6) {
      setPasswordError("Le mot de passe est trop court.");
      return false;
    }

    setPasswordError(null);
    return true;
  };

  /**
   * Handle login button click
   * 
   * Flow:
   * 1. Validate fields (email, password)
   * 2. Set loading state
   * 3. Call API POST /auth/login
   * 4. On success:
   *    - Set global state (access_token, refresh_token, current_user)
   *    - If remember_me: persist state to secure storage
   *    - Navigate to Dashboard
   * 5. On error:
   *    - Show generic error message (security)
   */
  const handleLogin = async () => {
    console.log('=== LOGIN BUTTON CLICKED ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Remember me:', rememberMe);

    // Clear previous errors
    setErrorMessage(null);
    setEmailError(null);
    setPasswordError(null);

    // Step 1: Validate fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      console.log('Validation failed, stopping flow');
      return;
    }

    // Step 2: Set loading state
    console.log('Starting login process...');
    setLoading(true);
    
    try {
      // Step 3: Call API (via Supabase Auth)
      // Note: Supabase handles the actual API call to POST /auth/login
      const { error } = await signIn(email.trim().toLowerCase(), password);
      
      console.log('Login result:', error ? 'Error' : 'Success');
      
      if (error) {
        console.error('Login error:', error);
        
        // Step 5: On error - Show generic error message for security
        // 🔒 Security: Generic message to not reveal if account exists
        setErrorMessage("Email ou mot de passe incorrect, ou compte indisponible.");
      } else {
        // Step 4: On success
        console.log('Login successful');
        
        // Supabase automatically handles:
        // - Setting access_token and refresh_token in session
        // - Storing in AsyncStorage (configured in supabase client)
        // - Setting current_user data
        
        // If remember_me is true, tokens are already persisted by Supabase
        // (persistSession: true in client config)
        if (rememberMe) {
          console.log('Remember me enabled - session will persist');
          // Store remember_me preference
          await AsyncStorage.setItem('@3s_global_remember_me', 'true');
        } else {
          console.log('Remember me disabled - session will not persist');
          await AsyncStorage.removeItem('@3s_global_remember_me');
        }
        
        // Check if email is verified
        if (!isEmailVerified()) {
          console.log('Email not verified, redirecting to verify-email');
          router.replace('/(tabs)/verify-email');
          return;
        }
        
        // Navigate based on return destination or to Dashboard
        const returnTo = params.returnTo as string;
        const plan = params.plan as string;
        
        if (returnTo === 'subscription-confirm' && plan) {
          console.log('Redirecting to subscription-confirm with plan:', plan);
          router.replace({
            pathname: '/(tabs)/subscription-confirm',
            params: { plan }
          });
        } else if (returnTo === 'pricing') {
          console.log('Redirecting to pricing');
          router.replace('/(tabs)/pricing');
        } else {
          console.log('Redirecting to client dashboard');
          router.replace('/(tabs)/client-dashboard');
        }
      }
    } catch (error: any) {
      console.error('Login exception:', error);
      // 🔒 Security: Generic error message
      setErrorMessage("Email ou mot de passe incorrect, ou compte indisponible.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('=== GOOGLE SIGN-IN BUTTON CLICKED ===');
    setErrorMessage(null);
    setLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google sign-in error:', error);
        setErrorMessage("Email ou mot de passe incorrect, ou compte indisponible.");
      }
    } catch (error: any) {
      console.error('Google sign-in exception:', error);
      setErrorMessage("Email ou mot de passe incorrect, ou compte indisponible.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(tabs)/forgot_password');
  };

  const handleSignUp = () => {
    router.push('/(tabs)/signup');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>
          Accédez à votre espace client Universal Shipping Services
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
          <Text style={styles.label}>Email</Text>
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
              editable={!loading && !authLoading}
            />
          </View>
          {emailError && (
            <Text style={styles.fieldError}>{emailError}</Text>
          )}
        </View>

        {/* Password Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={[
            styles.inputWrapper,
            passwordError && styles.inputWrapperError
          ]}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={20}
              color={passwordError ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(null);
                setErrorMessage(null);
              }}
              onBlur={() => validatePassword(password)}
              placeholder="Entrez votre mot de passe"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading && !authLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              disabled={loading || authLoading}
            >
              <IconSymbol
                ios_icon_name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                android_material_icon_name={showPassword ? 'visibility_off' : 'visibility'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {passwordError && (
            <Text style={styles.fieldError}>{passwordError}</Text>
          )}
        </View>

        {/* Remember Me Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}
          disabled={loading || authLoading}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            rememberMe && styles.checkboxChecked
          ]}>
            {rememberMe && (
              <IconSymbol
                ios_icon_name="checkmark"
                android_material_icon_name="check"
                size={16}
                color="#FFFFFF"
              />
            )}
          </View>
          <Text style={styles.checkboxLabel}>Se souvenir de moi</Text>
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <TouchableOpacity 
          onPress={handleForgotPassword} 
          style={styles.forgotPassword}
          disabled={loading || authLoading}
        >
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, (loading || authLoading) && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading || authLoading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={[styles.googleButton, (loading || authLoading) && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={loading || authLoading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="globe"
                android_material_icon_name="language"
                size={20}
                color={colors.text}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continuer avec Google</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleSignUp}
          disabled={loading || authLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.signupButtonText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <IconSymbol
          ios_icon_name="info.circle.fill"
          android_material_icon_name="info"
          size={20}
          color={colors.primary}
          style={styles.infoIcon}
        />
        <Text style={styles.infoText}>
          Après inscription, vous devez vérifier votre email avant de pouvoir vous connecter.
        </Text>
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
    marginBottom: 20,
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
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  fieldError: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 16,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  signupButtonText: {
    color: colors.primary,
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
    marginTop: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
