
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';
import { validateEmail, validatePhone, validateRequired, validateMinLength } from '@/utils/validation';
import * as Haptics from 'expo-haptics';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  account_type?: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();
  const { user, refreshClient, isEmailVerified } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    account_type: 'individual' as 'individual' | 'business',
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    account_type: false,
  });

  // Initialize form with data from navigation params
  useEffect(() => {
    console.log('[EDIT_PROFILE] Params received:', params);
    
    if (params.name || params.email || params.phone || params.account_type) {
      setFormData({
        name: (params.name as string) || '',
        email: (params.email as string) || '',
        phone: (params.phone as string) || '',
        account_type: (params.account_type as 'individual' | 'business') || 'individual',
      });
    }
  }, [params]);

  // Validate a single field
  const validateField = useCallback((field: keyof typeof formData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        const nameRequired = validateRequired(value, 'Nom');
        if (!nameRequired.isValid) {
          return 'Merci d\'indiquer votre nom / raison sociale.';
        }
        const nameLength = validateMinLength(value, 2, 'Nom');
        if (!nameLength.isValid) {
          return 'Nom trop court.';
        }
        return undefined;

      case 'email':
        const emailRequired = validateRequired(value, 'Email');
        if (!emailRequired.isValid) {
          return 'Merci d\'indiquer votre email.';
        }
        const emailValid = validateEmail(value);
        if (!emailValid.isValid) {
          return 'Adresse email invalide.';
        }
        return undefined;

      case 'phone':
        const phoneRequired = validateRequired(value, 'Téléphone');
        if (!phoneRequired.isValid) {
          return 'Merci d\'indiquer votre téléphone.';
        }
        const phoneLength = validateMinLength(value, 8, 'Téléphone');
        if (!phoneLength.isValid) {
          return 'Numéro invalide.';
        }
        return undefined;

      case 'account_type':
        const accountTypeRequired = validateRequired(value, 'Type de compte');
        if (!accountTypeRequired.isValid) {
          return 'Merci de choisir un type de compte.';
        }
        return undefined;

      default:
        return undefined;
    }
  }, []);

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
  }, [errors]);

  // Handle field blur
  const handleFieldBlur = useCallback((field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [formData, validateField]);

  // Handle save profile
  const handleSaveProfile = useCallback(async () => {
    console.log('[EDIT_PROFILE] Save button clicked');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      account_type: true,
    });

    // Validate all fields
    if (!validateAllFields()) {
      console.log('[EDIT_PROFILE] Validation failed:', errors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setSaving(true);
      console.log('[EDIT_PROFILE] Updating profile with data:', formData);

      // Update client record in database
      const { data, error } = await supabase
        .from('clients')
        .update({
          contact_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          account_type: formData.account_type,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('[EDIT_PROFILE] Error updating profile:', error);
        throw error;
      }

      console.log('[EDIT_PROFILE] Profile updated successfully:', data);

      // Refresh client data in AuthContext
      await refreshClient();

      // Show success message
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Succès',
        'Profil mis à jour avec succès.',
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
    } catch (error) {
      console.error('[EDIT_PROFILE] Exception updating profile:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour votre profil pour le moment.'
      );
    } finally {
      setSaving(false);
    }
  }, [formData, user, validateAllFields, refreshClient, router, errors]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    console.log('[EDIT_PROFILE] Cancel button clicked');
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
          Modifier mon profil
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
          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Nom complet / Raison sociale *
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: theme.colors.card,
                borderColor: touched.name && errors.name ? colors.error : colors.border,
              }
            ]}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Votre nom ou raison sociale"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(text) => handleFieldChange('name', text)}
                onBlur={() => handleFieldBlur('name')}
                autoCapitalize="words"
                editable={!saving}
              />
            </View>
            {touched.name && errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Email *
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: theme.colors.card,
                borderColor: touched.email && errors.email ? colors.error : colors.border,
              }
            ]}>
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="votre@email.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => handleFieldChange('email', text)}
                onBlur={() => handleFieldBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!saving}
              />
            </View>
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Phone Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Téléphone *
            </Text>
            <View style={[
              styles.inputContainer,
              { 
                backgroundColor: theme.colors.card,
                borderColor: touched.phone && errors.phone ? colors.error : colors.border,
              }
            ]}>
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="+33 6 12 34 56 78"
                placeholderTextColor={colors.textSecondary}
                value={formData.phone}
                onChangeText={(text) => handleFieldChange('phone', text)}
                onBlur={() => handleFieldBlur('phone')}
                keyboardType="phone-pad"
                editable={!saving}
              />
            </View>
            {touched.phone && errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          {/* Account Type Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
              Type de compte *
            </Text>
            <View style={[
              styles.pickerContainer,
              { 
                backgroundColor: theme.colors.card,
                borderColor: touched.account_type && errors.account_type ? colors.error : colors.border,
              }
            ]}>
              <IconSymbol
                ios_icon_name="briefcase.fill"
                android_material_icon_name="work"
                size={20}
                color={colors.textSecondary}
              />
              <Picker
                selectedValue={formData.account_type}
                onValueChange={(value) => handleFieldChange('account_type', value)}
                style={[styles.picker, { color: theme.colors.text }]}
                enabled={!saving}
              >
                <Picker.Item label="Particulier" value="individual" />
                <Picker.Item label="Entreprise" value="business" />
              </Picker>
            </View>
            {touched.account_type && errors.account_type && (
              <Text style={styles.errorText}>{errors.account_type}</Text>
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
              Les champs marqués d&apos;un astérisque (*) sont obligatoires.
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
          onPress={handleSaveProfile}
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 0,
    gap: 12,
  },
  picker: {
    flex: 1,
    height: Platform.OS === 'ios' ? 120 : 50,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
