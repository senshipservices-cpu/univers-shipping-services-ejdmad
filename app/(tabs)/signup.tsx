
import React, { useState, useEffect } from 'react';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';

export default function SignupScreen() {
  const { signUp, loading: authLoading, user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect to client dashboard if already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to client dashboard');
      router.replace('/(tabs)/client-dashboard');
    }
  }, [user, router]);

  const validateForm = () => {
    // Full name validation
    if (!fullName || fullName.trim().length === 0) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom complet');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return false;
    }

    // Password validation
    if (!password || password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    // Confirm password
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    console.log('=== SIGNUP BUTTON CLICKED ===');
    console.log('Full name:', fullName);
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Loading state:', loading);

    if (!validateForm()) {
      return;
    }

    console.log('Starting signup process...');
    setLoading(true);
    
    try {
      // Prepare metadata to be stored with the user
      // Use current app language, defaulting to 'en' if not set
      const metadata = {
        full_name: fullName.trim(),
        preferred_language: language || 'en',
      };

      console.log('Signing up with language:', metadata.preferred_language);

      const { error } = await signUp(
        email.trim().toLowerCase(),
        password,
        metadata
      );
      
      console.log('Signup result:', error ? 'Error' : 'Success');

      if (error) {
        console.error('Signup error:', error);
        
        let errorMessage = 'Une erreur est survenue lors de l\'inscription';
        
        if (error.message) {
          if (error.message.includes('User already registered')) {
            errorMessage = 'Un compte existe déjà avec cet email';
          } else if (error.message.includes('Password should be at least')) {
            errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
          } else if (error.message.includes('Invalid email')) {
            errorMessage = 'Adresse email invalide';
          } else {
            errorMessage = error.message;
          }
        }
        
        Alert.alert('Erreur d\'inscription', errorMessage);
      } else {
        // Success
        Alert.alert(
          'Inscription réussie !',
          'Un email de confirmation vous a été envoyé. Veuillez vérifier votre adresse avant de vous connecter.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/login'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Signup exception:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
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

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nom complet *</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Votre nom complet"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
              editable={!loading && !authLoading}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email *</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading && !authLoading}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe *</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 caractères"
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
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmation mot de passe *</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmez votre mot de passe"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading && !authLoading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
              disabled={loading || authLoading}
            >
              <IconSymbol
                ios_icon_name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                android_material_icon_name={showConfirmPassword ? 'visibility_off' : 'visibility'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, (loading || authLoading) && styles.buttonDisabled]}
          onPress={handleSignUp}
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

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading || authLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </View>

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
