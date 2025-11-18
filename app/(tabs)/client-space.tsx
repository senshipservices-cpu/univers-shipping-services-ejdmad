
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/styles/commonStyles";

export default function ClientSpaceScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      router.replace('/(tabs)/client-dashboard');
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && !companyName) {
      Alert.alert('Error', 'Please enter your company name');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('Login Error', error.message || 'Failed to login. Please check your credentials.');
        } else {
          // Navigation will happen automatically via useEffect
          console.log('Login successful');
        }
      } else {
        const { error } = await signUp(email, password, companyName);
        if (error) {
          Alert.alert('Registration Error', error.message || 'Failed to register. Please try again.');
        } else {
          Alert.alert(
            'Registration Successful',
            'Please check your email to verify your account before logging in.',
            [{ text: 'OK', onPress: () => setIsLogin(true) }]
          );
          setEmail('');
          setPassword('');
          setCompanyName('');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t.clientSpace.title}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <IconSymbol
            ios_icon_name="person.circle.fill"
            android_material_icon_name="account_circle"
            size={80}
            color={colors.primary}
          />
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            {isLogin ? t.clientSpace.login : t.clientSpace.register}
          </Text>
          <Text style={styles.description}>
            {isLogin
              ? "Access your account to track shipments and manage documents"
              : "Create an account to start using our services"}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.formCard, { backgroundColor: theme.colors.card }]}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Company Name</Text>
                <View style={styles.inputContainer}>
                  <IconSymbol
                    ios_icon_name="building.2"
                    android_material_icon_name="business"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Your Company Name"
                    placeholderTextColor={colors.textSecondary}
                    value={companyName}
                    onChangeText={setCompanyName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Email</Text>
              <View style={styles.inputContainer}>
                <IconSymbol
                  ios_icon_name="envelope"
                  android_material_icon_name="email"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="your.email@example.com"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Password</Text>
              <View style={styles.inputContainer}>
                <IconSymbol
                  ios_icon_name="lock"
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
                  secureTextEntry
                />
              </View>
            </View>

            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Please wait...' : (isLogin ? t.clientSpace.login : t.clientSpace.register)}
              </Text>
            </TouchableOpacity>

            <View style={styles.switchMode}>
              <Text style={styles.switchModeText}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={[styles.switchModeLink, { color: colors.primary }]}>
                  {isLogin ? t.clientSpace.register : t.clientSpace.login}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Client Portal Features
          </Text>
          <View style={styles.featuresContainer}>
            <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location_on"
                size={32}
                color={colors.primary}
              />
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {t.clientSpace.tracking}
              </Text>
              <Text style={styles.featureDescription}>
                Real-time tracking of your shipments
              </Text>
            </View>
            <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
              <IconSymbol
                ios_icon_name="doc.text.fill"
                android_material_icon_name="description"
                size={32}
                color={colors.secondary}
              />
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {t.clientSpace.documents}
              </Text>
              <Text style={styles.featureDescription}>
                Access all your shipping documents
              </Text>
            </View>
          </View>
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
    fontSize: 20,
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
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  formCard: {
    padding: 24,
    borderRadius: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  switchMode: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  switchModeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  switchModeLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  featuresSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
