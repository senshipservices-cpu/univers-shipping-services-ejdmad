
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
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { Picker } from '@react-native-picker/picker';

/**
 * Register Screen - PARTIE 2/3 – B
 * 
 * SCREEN_ID: Register
 * TITLE: "Créer un compte"
 * ROUTE: "/register"
 * 
 * Implements the complete registration flow with:
 * - Account type selection (Particulier/Entreprise)
 * - Full name or company name
 * - Email with validation
 * - Phone number with validation
 * - Password with confirmation
 * - Terms and conditions acceptance
 * - Comprehensive field validations
 * - API integration with auto-login or email verification flow
 */
export default function RegisterScreen() {
  const { signUp, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Form fields
  const [accountType, setAccountType] = useState<'individual' | 'business' | ''>('');
  const [fullNameOrCompany, setFullNameOrCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Field-specific errors for validation
  const [accountTypeError, setAccountTypeError] = useState<string | null>(null);
  const [fullNameOrCompanyError, setFullNameOrCompanyError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordConfirmError, setPasswordConfirmError] = useState<string | null>(null);
  const [acceptTermsError, setAcceptTermsError] = useState<string | null>(null);

  /**
   * Validate account_type field
   * Rules:
   * - Required: "Merci de choisir un type de compte."
   */
  const validateAccountType = (value: string): boolean => {
    if (!value || value.trim().length === 0) {
      setAccountTypeError("Merci de choisir un type de compte.");
      return false;
    }

    setAccountTypeError(null);
    return true;
  };

  /**
   * Validate full_name_or_company field
   * Rules:
   * - Required: "Merci d'indiquer votre nom / raison sociale."
   * - Min length 2: "Texte trop court."
   */
  const validateFullNameOrCompany = (value: string): boolean => {
    if (!value || value.trim().length === 0) {
      setFullNameOrCompanyError("Merci d'indiquer votre nom / raison sociale.");
      return false;
    }

    if (value.trim().length < 2) {
      setFullNameOrCompanyError("Texte trop court.");
      return false;
    }

    setFullNameOrCompanyError(null);
    return true;
  };

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
   * Validate phone field
   * Rules:
   * - Required: "Merci d'indiquer votre numéro de téléphone."
   * - Min length 8: "Numéro de téléphone invalide."
   */
  const validatePhone = (value: string): boolean => {
    if (!value || value.trim().length === 0) {
      setPhoneError("Merci d'indiquer votre numéro de téléphone.");
      return false;
    }

    // Remove spaces, dashes, and parentheses for validation
    const cleanPhone = value.replace(/[\s\-()]/g, '');
    
    if (cleanPhone.length < 8) {
      setPhoneError("Numéro de téléphone invalide.");
      return false;
    }

    setPhoneError(null);
    return true;
  };

  /**
   * Validate password field
   * Rules:
   * - Required: "Merci de choisir un mot de passe."
   * - Min length 8: "Le mot de passe doit contenir au moins 8 caractères."
   */
  const validatePassword = (value: string): boolean => {
    if (!value || value.length === 0) {
      setPasswordError("Merci de choisir un mot de passe.");
      return false;
    }

    if (value.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }

    setPasswordError(null);
    return true;
  };

  /**
   * Validate password_confirm field
   * Rules:
   * - Required: "Merci de confirmer votre mot de passe."
   */
  const validatePasswordConfirm = (value: string): boolean => {
    if (!value || value.length === 0) {
      setPasswordConfirmError("Merci de confirmer votre mot de passe.");
      return false;
    }

    setPasswordConfirmError(null);
    return true;
  };

  /**
   * Cross-field validation: password_match
   * Rules:
   * - Equals: "Les mots de passe ne correspondent pas."
   */
  const validatePasswordMatch = (): boolean => {
    if (password !== passwordConfirm) {
      setPasswordConfirmError("Les mots de passe ne correspondent pas.");
      return false;
    }

    setPasswordConfirmError(null);
    return true;
  };

  /**
   * Validate accept_terms field
   * Rules:
   * - Required true: "Vous devez accepter les conditions pour créer un compte."
   */
  const validateAcceptTerms = (value: boolean): boolean => {
    if (!value) {
      setAcceptTermsError("Vous devez accepter les conditions pour créer un compte.");
      return false;
    }

    setAcceptTermsError(null);
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
      Alert.alert('Erreur', message);
    }
  };

  /**
   * Handle register button click
   * 
   * LOGIQUE BOUTON Créer mon compte
   * 
   * Flow:
   * 1. Validate all fields
   * 2. Set loading state on button
   * 3. Call API POST /auth/register (via Supabase)
   * 4. On success:
   *    - If auto_login == true:
   *      - Set global state (access_token, refresh_token, current_user)
   *      - Navigate to Dashboard
   *    - Else:
   *      - Show success toast
   *      - Navigate to Login
   * 5. On error:
   *    - Set loading state to false
   *    - Show error toast
   */
  const handleRegister = async () => {
    console.log('=== REGISTER BUTTON CLICKED ===');
    console.log('Account type:', accountType);
    console.log('Full name/company:', fullNameOrCompany);
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Password length:', password.length);
    console.log('Accept terms:', acceptTerms);

    // Clear previous errors
    setErrorMessage(null);
    setAccountTypeError(null);
    setFullNameOrCompanyError(null);
    setEmailError(null);
    setPhoneError(null);
    setPasswordError(null);
    setPasswordConfirmError(null);
    setAcceptTermsError(null);

    // Step 1: Validate all fields
    const isAccountTypeValid = validateAccountType(accountType);
    const isFullNameOrCompanyValid = validateFullNameOrCompany(fullNameOrCompany);
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhone(phone);
    const isPasswordValid = validatePassword(password);
    const isPasswordConfirmValid = validatePasswordConfirm(passwordConfirm);
    const isPasswordMatchValid = validatePasswordMatch();
    const isAcceptTermsValid = validateAcceptTerms(acceptTerms);

    // If invalid, show errors and stop flow
    if (
      !isAccountTypeValid ||
      !isFullNameOrCompanyValid ||
      !isEmailValid ||
      !isPhoneValid ||
      !isPasswordValid ||
      !isPasswordConfirmValid ||
      !isPasswordMatchValid ||
      !isAcceptTermsValid
    ) {
      console.log('Validation failed, stopping flow');
      return;
    }

    // Step 2: Set loading state on button
    console.log('Starting registration process...');
    setLoading(true);
    
    try {
      // Step 3: Call API POST /auth/register
      // Prepare metadata to send to Supabase Auth
      const metadata = {
        full_name: accountType === 'individual' ? fullNameOrCompany.trim() : '',
        company: accountType === 'business' ? fullNameOrCompany.trim() : '',
        phone: phone.trim(),
        account_type: accountType,
        preferred_language: 'fr', // Default to French for this form
      };

      console.log('Calling API with body:', {
        account_type: accountType,
        name: fullNameOrCompany.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: '***',
      });

      // Call Supabase Auth signUp
      const { error } = await signUp(email.trim().toLowerCase(), password, metadata);
      
      console.log('Registration API result:', error ? 'Error' : 'Success');
      
      if (error) {
        console.error('Registration error:', error);
        
        // Step 5: On error - Set loading to false and show error toast
        setLoading(false);
        
        // Generic error message for security
        showToast(
          "Impossible de créer le compte. Cet email est peut-être déjà utilisé, ou le service est momentanément indisponible.",
          'error'
        );
        
        // Also set the error message for display
        setErrorMessage("Impossible de créer le compte. Cet email est peut-être déjà utilisé, ou le service est momentanément indisponible.");
      } else {
        // Step 4: On success
        console.log('Registration successful');
        
        // Note: Supabase requires email verification by default
        // The auto_login scenario would only happen if email verification is disabled
        // For this implementation, we assume email verification is required
        
        // Since Supabase requires email verification, we follow the "else" path:
        // - Show success toast
        // - Navigate to Login
        
        setLoading(false);
        
        showToast(
          "Compte créé. Vérifiez vos emails pour activer votre compte.",
          'success'
        );
        
        // Navigate to Login screen
        console.log('Navigating to Login screen...');
        router.replace('/(tabs)/login');
      }
    } catch (error: any) {
      console.error('Registration exception:', error);
      
      // Step 5: On error - Set loading to false and show error toast
      setLoading(false);
      
      showToast(
        "Impossible de créer le compte. Cet email est peut-être déjà utilisé, ou le service est momentanément indisponible.",
        'error'
      );
      
      setErrorMessage("Impossible de créer le compte. Cet email est peut-être déjà utilisé, ou le service est momentanément indisponible.");
    }
  };

  /**
   * Handle "Déjà un compte ? Se connecter" link
   * Navigate to Login screen
   */
  const handleGoToLogin = () => {
    console.log('Navigating to Login screen...');
    router.push('/(tabs)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>
          Rejoignez Universal Shipping Services et accédez à tous nos services
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
        {/* Account Type Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Type de compte *</Text>
          <View style={[
            styles.pickerWrapper,
            accountTypeError && styles.inputWrapperError
          ]}>
            <IconSymbol
              ios_icon_name="person.2.fill"
              android_material_icon_name="group"
              size={20}
              color={accountTypeError ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <Picker
              selectedValue={accountType}
              onValueChange={(value) => {
                setAccountType(value);
                setAccountTypeError(null);
                setErrorMessage(null);
              }}
              style={styles.picker}
              enabled={!loading && !authLoading}
            >
              <Picker.Item label="Sélectionnez un type" value="" />
              <Picker.Item label="Particulier" value="individual" />
              <Picker.Item label="Entreprise" value="business" />
            </Picker>
          </View>
          {accountTypeError && (
            <Text style={styles.fieldError}>{accountTypeError}</Text>
          )}
        </View>

        {/* Full Name or Company Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {accountType === 'business' ? 'Raison sociale *' : 'Nom complet *'}
          </Text>
          <View style={[
            styles.inputWrapper,
            fullNameOrCompanyError && styles.inputWrapperError
          ]}>
            <IconSymbol
              ios_icon_name={accountType === 'business' ? 'building.2.fill' : 'person.fill'}
              android_material_icon_name={accountType === 'business' ? 'business' : 'person'}
              size={20}
              color={fullNameOrCompanyError ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={fullNameOrCompany}
              onChangeText={(text) => {
                setFullNameOrCompany(text);
                setFullNameOrCompanyError(null);
                setErrorMessage(null);
              }}
              onBlur={() => validateFullNameOrCompany(fullNameOrCompany)}
              placeholder={accountType === 'business' ? 'Nom de votre entreprise' : 'Votre nom complet'}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
              editable={!loading && !authLoading}
            />
          </View>
          {fullNameOrCompanyError && (
            <Text style={styles.fieldError}>{fullNameOrCompanyError}</Text>
          )}
        </View>

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email *</Text>
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

        {/* Phone Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Téléphone *</Text>
          <View style={[
            styles.inputWrapper,
            phoneError && styles.inputWrapperError
          ]}>
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone"
              size={20}
              color={phoneError ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setPhoneError(null);
                setErrorMessage(null);
              }}
              onBlur={() => validatePhone(phone)}
              placeholder="+33 6 12 34 56 78"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              editable={!loading && !authLoading}
            />
          </View>
          {phoneError && (
            <Text style={styles.fieldError}>{phoneError}</Text>
          )}
        </View>

        {/* Password Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe *</Text>
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
              placeholder="Minimum 8 caractères"
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

        {/* Password Confirm Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmer le mot de passe *</Text>
          <View style={[
            styles.inputWrapper,
            passwordConfirmError && styles.inputWrapperError
          ]}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={20}
              color={passwordConfirmError ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={passwordConfirm}
              onChangeText={(text) => {
                setPasswordConfirm(text);
                setPasswordConfirmError(null);
                setErrorMessage(null);
              }}
              onBlur={() => {
                validatePasswordConfirm(passwordConfirm);
                if (passwordConfirm.length > 0) {
                  validatePasswordMatch();
                }
              }}
              placeholder="Confirmez votre mot de passe"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPasswordConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading && !authLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
              style={styles.eyeIcon}
              disabled={loading || authLoading}
            >
              <IconSymbol
                ios_icon_name={showPasswordConfirm ? 'eye.slash.fill' : 'eye.fill'}
                android_material_icon_name={showPasswordConfirm ? 'visibility_off' : 'visibility'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {passwordConfirmError && (
            <Text style={styles.fieldError}>{passwordConfirmError}</Text>
          )}
        </View>

        {/* Accept Terms Checkbox */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => {
              setAcceptTerms(!acceptTerms);
              setAcceptTermsError(null);
              setErrorMessage(null);
            }}
            disabled={loading || authLoading}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              acceptTerms && styles.checkboxChecked,
              acceptTermsError && styles.checkboxError
            ]}>
              {acceptTerms && (
                <IconSymbol
                  ios_icon_name="checkmark"
                  android_material_icon_name="check"
                  size={16}
                  color="#FFFFFF"
                />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              J&apos;accepte les CGU et la politique de confidentialité *
            </Text>
          </TouchableOpacity>
          {acceptTermsError && (
            <Text style={styles.fieldError}>{acceptTermsError}</Text>
          )}
        </View>

        {/* Register Button - btn_register */}
        <TouchableOpacity
          style={[styles.button, (loading || authLoading) && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading || authLoading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Créer mon compte</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Login Link - link_go_login */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleGoToLogin}
          disabled={loading || authLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <IconSymbol
          ios_icon_name="checkmark.shield.fill"
          android_material_icon_name="verified_user"
          size={20}
          color={colors.primary}
          style={styles.infoIcon}
        />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>Vérification email requise</Text>
          <Text style={styles.infoText}>
            Après inscription, vous recevrez un email de vérification. Vous devez cliquer sur le lien de confirmation avant de pouvoir vous connecter.
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
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 12,
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
  picker: {
    flex: 1,
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
  checkboxError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
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
  loginButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  loginButtonText: {
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
});
