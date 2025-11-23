
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
import { colors } from '@/styles/commonStyles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';

export default function LoginScreen() {
  const { signIn, signInWithGoogle, loading: authLoading, user, isEmailVerified } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to appropriate screen if already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in, checking email verification and return destination');
      
      // Check if email is verified
      if (!isEmailVerified()) {
        console.log('Email not verified, redirecting to verify-email');
        router.replace('/(tabs)/verify-email');
        return;
      }
      
      // Check if there's a return destination
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
  }, [user, isEmailVerified, router, params]);

  const handleLogin = async () => {
    console.log('=== LOGIN BUTTON CLICKED ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Loading state:', loading);

    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez entrer votre email et mot de passe');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    console.log('Starting login process...');
    setLoading(true);
    
    try {
      const { error } = await signIn(email.trim().toLowerCase(), password);
      
      console.log('Login result:', error ? 'Error' : 'Success');
      
      if (error) {
        console.error('Login error:', error);
        
        // Handle specific error messages
        let errorMessage = 'Une erreur est survenue lors de la connexion';
        
        if (error.message) {
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Veuillez vérifier votre email avant de vous connecter. Consultez votre boîte de réception.';
          } else if (error.message.includes('User not found')) {
            errorMessage = 'Aucun compte trouvé avec cet email';
          } else {
            errorMessage = error.message;
          }
        }
        
        Alert.alert('Erreur de connexion', errorMessage);
      } else {
        // Success - navigation will be handled by useEffect
        console.log('Login successful, waiting for redirect...');
      }
    } catch (error) {
      console.error('Login exception:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('=== GOOGLE SIGN-IN BUTTON CLICKED ===');
    console.log('Loading state:', loading);

    setLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      console.log('Google sign-in result:', error ? 'Error' : 'Success');

      if (error) {
        console.error('Google sign-in error:', error);
        
        let errorMessage = 'Une erreur est survenue lors de la connexion avec Google';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        Alert.alert('Erreur de connexion', errorMessage);
      }
      // Success will be handled by the OAuth redirect and useEffect
    } catch (error) {
      console.error('Google sign-in exception:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue');
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

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
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
          <Text style={styles.label}>Mot de passe</Text>
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
        </View>

        <TouchableOpacity 
          onPress={handleForgotPassword} 
          style={styles.forgotPassword}
          disabled={loading || authLoading}
        >
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

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

        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleSignUp}
          disabled={loading || authLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.signupButtonText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>

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
