
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { supabaseAdmin } from '@/utils/supabaseAdminClient';
import appConfig from '@/config/appConfig';

export default function AdminLoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Prevent navigation loops with a ref
  const hasCheckedSession = useRef(false);
  const isNavigating = useRef(false);

  // Check if already logged in as admin (only once on mount)
  const checkExistingSession = useCallback(async () => {
    // Prevent multiple checks
    if (hasCheckedSession.current || isNavigating.current) {
      return;
    }

    try {
      hasCheckedSession.current = true;
      console.log('[ADMIN_LOGIN] Checking existing session...');
      
      const { data: { session } } = await supabaseAdmin.auth.getSession();
      
      if (session?.user) {
        const isAdmin = appConfig.isAdmin(session.user.email);
        
        if (isAdmin && !isNavigating.current) {
          // Already logged in as admin, redirect to dashboard
          console.log('[ADMIN_LOGIN] Admin session found, redirecting to dashboard');
          isNavigating.current = true;
          router.replace('/(tabs)/admin-dashboard');
        }
      }
    } catch (error) {
      console.error('[ADMIN_LOGIN] Error checking session:', error);
    }
  }, [router]);

  useEffect(() => {
    checkExistingSession();
  }, [checkExistingSession]);

  const handleLogin = async () => {
    // Prevent multiple simultaneous login attempts
    if (loading || isNavigating.current) {
      return;
    }

    // Clear previous errors
    setError('');

    // Validate inputs
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Adresse email invalide');
      return;
    }

    setLoading(true);

    try {
      console.log('[ADMIN_LOGIN] Attempting login...');
      
      // Attempt to sign in with Supabase
      const { data, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        console.error('[ADMIN_LOGIN] Sign in error:', signInError);
        
        // Handle specific error messages
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Veuillez confirmer votre email avant de vous connecter');
        } else {
          setError(signInError.message || 'Erreur de connexion');
        }
        
        setLoading(false);
        return;
      }

      // Check if user is an admin
      if (data.user) {
        const isAdmin = appConfig.isAdmin(data.user.email);
        
        if (!isAdmin) {
          // Not an admin, sign out and show error
          console.log('[ADMIN_LOGIN] User is not admin, signing out');
          await supabaseAdmin.auth.signOut();
          setError('Accès réservé à l\'équipe Universal Shipping Services.');
          setLoading(false);
          return;
        }

        // Success! Redirect to admin dashboard
        console.log('[ADMIN_LOGIN] Admin login successful:', data.user.email);
        
        // Prevent navigation loop
        if (!isNavigating.current) {
          isNavigating.current = true;
          router.replace('/(tabs)/admin-dashboard');
        }
      }
    } catch (error: any) {
      console.error('[ADMIN_LOGIN] Login exception:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol
              ios_icon_name="shield.lefthalf.filled"
              android_material_icon_name="admin_panel_settings"
              size={64}
              color={colors.primary}
            />
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text }]}>
            USS Admin Web
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Panneau d&apos;administration
          </Text>
          
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Universal Shipping Services
          </Text>
        </View>

        {/* Login Form */}
        <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>
            Connexion Administrateur
          </Text>

          {/* Error Message */}
          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="error"
                size={20}
                color={colors.error}
              />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Email
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background, borderColor: colors.border }]}>
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="admin@universalshipping.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Mot de passe
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background, borderColor: colors.border }]}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
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

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: colors.primary },
              loading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="arrow.right.circle.fill"
                  android_material_icon_name="login"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.loginButtonText}>
                  Se connecter (Admin)
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Info Message */}
          <View style={[styles.infoContainer, { backgroundColor: colors.primary + '10' }]}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              Accès réservé aux administrateurs USS
            </Text>
          </View>
        </View>

        {/* Back to Home Link */}
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => {
            if (!loading && !isNavigating.current) {
              router.push('/(tabs)/(home)/');
            }
          }}
          disabled={loading}
        >
          <IconSymbol
            ios_icon_name="house.fill"
            android_material_icon_name="home"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.backLinkText, { color: colors.primary }]}>
            Retour à l&apos;accueil
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 68 : 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    gap: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    outlineStyle: 'none',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    padding: 12,
  },
  backLinkText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
