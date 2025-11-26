
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';
import { validateRequired, validateMinLength } from '@/utils/validation';
import * as Haptics from 'expo-haptics';

// SCREEN_ID: ChangePassword
// TITLE: "Changer mon mot de passe"
// ROUTE: "/change-password"

interface FormErrors {
  current_password?: string;
  new_password?: string;
  new_password_confirm?: string;
  password_match?: string;
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, isEmailVerified } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({
    current_password: false,
    new_password: false,
    new_password_confirm: false,
  });

  // Show/hide password state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate a single field
  const validateField = useCallback((field: keyof typeof formData, value: string): string | undefined => {
    switch (field) {
      case 'current_password':
        const currentRequired = validateRequired(value, 'Mot de passe actuel');
        if (!currentRequired.isValid) {
          return 'Merci d\'indiquer votre mot de passe actuel.';
        }
        return undefined;

      case 'new_password':
        const newRequired = validateRequired(value, 'Nouveau mot de passe');
        if (!newRequired.isValid) {
          return 'Merci de choisir un nouveau mot de passe.';
        }
        const newLength = validateMinLength(value, 8, 'Nouveau mot de passe');
        if (!newLength.isValid) {
          return 'Le mot de passe doit contenir au moins 8 caractères.';
        }
        return undefined;

      case 'new_password_confirm':
        const confirmRequired = validateRequired(value, 'Confirmation');
        if (!confirmRequired.isValid) {
          return 'Merci de confirmer le mot de passe.';
        }
        return undefined;

      default:
        return undefined;
    }
  }, []);

  // Validate password match
  const validatePasswordMatch = useCallback((): boolean => {
    if (formData.new_password !== formData.new_password_confirm) {
      setErrors(prev => ({ ...prev, password_match: 'Les mots de passe ne correspondent pas.' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password_match: undefined }));
    return true;
  }, [formData.new_password, formData.new_password_confirm]);

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate each field
    Object.keys(formData).forEach((key) => {
      const field = key as keyof typeof formData;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Validate password match
    if (formData.new_password !== formData.new_password_confirm) {
      newErrors.password_match = 'Les mots de passe ne correspondent pas.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  // Handle field change
  const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Clear password match error when either password field changes
    if ((field === 'new_password' || field === 'new_password_confirm') && errors.password_match) {
      setErrors(prev => ({ ...prev, password_match: undefined }));
    }
  }, [errors]);

  // Handle field blur
  const handleFieldBlur = useCallback((field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }

    // Validate password match if confirming password
    if (field === 'new_password_confirm') {
      validatePasswordMatch();
    }
  }, [formData, validateField, validatePasswordMatch]);

  // Handle save password
  const handleSavePassword = useCallback(async () => {
    console.log('[CHANGE_PASSWORD] Save button clicked');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Mark all fields as touched
    setTouched({
      current_password: true,
      new_password: true,
      new_password_confirm: true,
    });

    // Validate all fields
    if (!validateAllFields()) {
      console.log('[CHANGE_PASSWORD] Validation failed:', errors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setSaving(true);
      console.log('[CHANGE_PASSWORD] Updating password...');

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: formData.new_password,
      });

      if (error) {
        console.error('[CHANGE_PASSWORD] Error updating password:', error);
        throw error;
      }

      console.log('[CHANGE_PASSWORD] Password updated successfully');

      // Show success message
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Succès',
        'Mot de passe modifié avec succès.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to Profile screen
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[CHANGE_PASSWORD] Exception updating password:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Check for specific error messages
      let errorMessage = 'Impossible de changer le mot de passe. Vérifiez votre mot de passe actuel.';
      
      if (error.message && error.message.includes('same')) {
        errorMessage = 'Le nouveau mot de passe doit être différent de l\'ancien.';
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setSaving(false);
    }
  }, [formData, validateAllFields, router, errors]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    console.log('[CHANGE_PASSWORD] Cancel button clicked');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  // Redirect if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/login" />;
  }

  // Redirect if email is not verified
  if (!isEmailVerified()) {
    return <Redirect href="/(tabs)/verify-email" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Changer mon mot de passe
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Current Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Mot de passe actuel *
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: theme.colors.card,
                borderColor: touched.current_password && errors.current_password ? colors.error : colors.border,
              }
            ]}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Votre mot de passe actuel"
                placeholderTextColor={colors.textSecondary}
                value={formData.current_password}
                onChangeText={(text) => handleFieldChange('current_password', text)}
                onBlur={() => handleFieldBlur('current_password')}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!saving}
              />
              <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <IconSymbol
                  ios_icon_name={showCurrentPassword ? 'eye.slash.fill' : 'eye.fill'}
                  android_material_icon_name={showCurrentPassword ? 'visibility_off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {touched.current_password && errors.current_password && (
              <Text style={styles.errorText}>{errors.current_password}</Text>
            )}
          </View>

          {/* New Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Nouveau mot de passe *
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: theme.colors.card,
                borderColor: touched.new_password && errors.new_password ? colors.error : colors.border,
              }
            ]}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Minimum 8 caractères"
                placeholderTextColor={colors.textSecondary}
                value={formData.new_password}
                onChangeText={(text) => handleFieldChange('new_password', text)}
                onBlur={() => handleFieldBlur('new_password')}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!saving}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <IconSymbol
                  ios_icon_name={showNewPassword ? 'eye.slash.fill' : 'eye.fill'}
                  android_material_icon_name={showNewPassword ? 'visibility_off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {touched.new_password && errors.new_password && (
              <Text style={styles.errorText}>{errors.new_password}</Text>
            )}
          </View>

          {/* Confirm New Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Confirmer le nouveau mot de passe *
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: theme.colors.card,
                borderColor: (touched.new_password_confirm && errors.new_password_confirm) || errors.password_match ? colors.error : colors.border,
              }
            ]}>
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Confirmez votre nouveau mot de passe"
                placeholderTextColor={colors.textSecondary}
                value={formData.new_password_confirm}
                onChangeText={(text) => handleFieldChange('new_password_confirm', text)}
                onBlur={() => handleFieldBlur('new_password_confirm')}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!saving}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <IconSymbol
                  ios_icon_name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                  android_material_icon_name={showConfirmPassword ? 'visibility_off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {touched.new_password_confirm && errors.new_password_confirm && (
              <Text style={styles.errorText}>{errors.new_password_confirm}</Text>
            )}
            {errors.password_match && (
              <Text style={styles.errorText}>{errors.password_match}</Text>
            )}
          </View>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Votre mot de passe doit contenir au moins 8 caractères. Pour votre sécurité, utilisez une combinaison de lettres, chiffres et caractères spéciaux.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.buttonContainer, { backgroundColor: theme.colors.background }]}>
        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { 
              backgroundColor: colors.primary,
              opacity: saving ? 0.6 : 1,
            }
          ]}
          onPress={handleSavePassword}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <React.Fragment>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={[
            styles.cancelButton,
            { 
              backgroundColor: theme.colors.card,
              borderColor: colors.border,
            }
          ]}
          onPress={handleCancel}
          disabled={saving}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="xmark.circle"
            android_material_icon_name="cancel"
            size={24}
            color={colors.textSecondary}
          />
          <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
            Annuler
          </Text>
        </TouchableOpacity>
      </View>
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
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formContainer: {
    padding: 20,
    gap: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
