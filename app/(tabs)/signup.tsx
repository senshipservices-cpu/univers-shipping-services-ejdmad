
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
import { useLanguage } from '@/contexts/LanguageContext';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';

export default function SignupScreen() {
  const { signUp, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    // Confirm password
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Prepare metadata to be stored with the user
    // Use current app language, defaulting to 'en' if not set
    const metadata = {
      full_name: fullName.trim() || '',
      company: company.trim() || 'To be specified',
      phone: phone.trim() || '',
      preferred_language: language || 'en',
    };

    console.log('Signing up with language:', metadata.preferred_language);

    const { error } = await signUp(
      email.trim().toLowerCase(),
      password,
      metadata
    );
    
    setLoading(false);

    if (error) {
      console.error('Signup error:', error);
      
      let errorMessage = 'An error occurred during registration';
      
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account already exists with this email';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Invalid email address';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Registration Error', errorMessage);
    } else {
      // Success
      Alert.alert(
        'Registration Successful!',
        'A verification email has been sent to your address.\n\nPlease check your inbox and click the confirmation link before logging in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/login'),
          },
        ]
      );
    }
  };

  const handleLogin = () => {
    router.push('/(tabs)/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Create an Account</Text>
        <Text style={styles.subtitle}>
          Join Universal Shipping Services and access all our services
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
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
              placeholder="Your full name"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Company (optional)</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol
              ios_icon_name="building.2.fill"
              android_material_icon_name="business"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="Your company name"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone (optional)</Text>
          <View style={styles.inputWrapper}>
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 234 567 8900"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              editable={!loading}
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
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password *</Text>
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
              placeholder="Minimum 6 characters"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
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
          <Text style={styles.label}>Confirm Password *</Text>
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
              placeholder="Confirm your password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
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
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading || authLoading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create My Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>I Already Have an Account</Text>
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
          <Text style={styles.infoTitle}>Email Verification Required</Text>
          <Text style={styles.infoText}>
            After registration, you will receive a verification email. You must click the confirmation link before you can log in.
          </Text>
        </View>
      </View>

      <View style={styles.termsBox}>
        <Text style={styles.termsText}>
          By creating an account, you agree to our terms of use and privacy policy.
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
  termsBox: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
