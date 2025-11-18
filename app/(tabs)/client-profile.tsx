
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/app/integrations/supabase/client";
import { colors } from "@/styles/commonStyles";

interface ClientProfile {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  sector: string | null;
  is_verified: boolean;
}

export default function ClientProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    sector: '',
  });

  // Redirect if not authenticated
  if (!user) {
    return <Redirect href="/(tabs)/client-space" />;
  }

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
      } else {
        setProfile(data);
        setFormData({
          company_name: data.company_name || '',
          contact_name: data.contact_name || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          country: data.country || '',
          city: data.city || '',
          sector: data.sector || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.company_name) {
      Alert.alert(
        language === 'fr' ? 'Erreur' : language === 'es' ? 'Error' : language === 'ar' ? 'خطأ' : 'Error',
        language === 'fr' ? 'Le nom de l\'entreprise est requis' : language === 'es' ? 'El nombre de la empresa es obligatorio' : language === 'ar' ? 'اسم الشركة مطلوب' : 'Company name is required'
      );
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          company_name: formData.company_name,
          contact_name: formData.contact_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          country: formData.country || null,
          city: formData.city || null,
          sector: formData.sector || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert(
          language === 'fr' ? 'Erreur' : language === 'es' ? 'Error' : language === 'ar' ? 'خطأ' : 'Error',
          language === 'fr' ? 'Échec de la mise à jour du profil. Veuillez réessayer.' : language === 'es' ? 'Error al actualizar el perfil. Por favor, inténtelo de nuevo.' : language === 'ar' ? 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.' : 'Failed to update profile. Please try again.'
        );
      } else {
        Alert.alert(
          language === 'fr' ? 'Succès' : language === 'es' ? 'Éxito' : language === 'ar' ? 'نجاح' : 'Success',
          language === 'fr' ? 'Profil mis à jour avec succès' : language === 'es' ? 'Perfil actualizado con éxito' : language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully'
        );
        loadProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        language === 'fr' ? 'Erreur' : language === 'es' ? 'Error' : language === 'ar' ? 'خطأ' : 'Error',
        language === 'fr' ? 'Une erreur inattendue s\'est produite. Veuillez réessayer.' : language === 'es' ? 'Se produjo un error inesperado. Por favor, inténtelo de nuevo.' : language === 'ar' ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/(tabs)/client-dashboard');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t.clientSpace.myProfile}
          </Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t.common.loading}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t.clientSpace.myProfile}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={48}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {formData.contact_name || formData.company_name}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {/* Account Status Badge */}
          {profile?.is_verified ? (
            <View style={styles.verifiedBadge}>
              <IconSymbol
                ios_icon_name="checkmark.seal.fill"
                android_material_icon_name="verified"
                size={16}
                color="#10b981"
              />
              <Text style={styles.verifiedText}>
                {language === 'fr' ? 'Compte vérifié' : language === 'es' ? 'Cuenta verificada' : language === 'ar' ? 'حساب موثق' : 'Verified Account'}
              </Text>
            </View>
          ) : (
            <View style={styles.unverifiedBadge}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={16}
                color="#f59e0b"
              />
              <Text style={styles.unverifiedText}>
                {language === 'fr' ? 'En attente de vérification par nos équipes' : language === 'es' ? 'Pendiente de verificación por nuestros equipos' : language === 'ar' ? 'في انتظار التحقق من قبل فرقنا' : 'Pending verification by our teams'}
              </Text>
            </View>
          )}
        </View>

        {/* Company Information Form */}
        <View style={[styles.formSection, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {language === 'fr' ? 'Informations de l\'entreprise' : language === 'es' ? 'Información de la empresa' : language === 'ar' ? 'معلومات الشركة' : 'Company Information'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {language === 'fr' ? 'Nom de l\'entreprise *' : language === 'es' ? 'Nombre de la empresa *' : language === 'ar' ? 'اسم الشركة *' : 'Company Name *'}
            </Text>
            <View style={styles.inputContainer}>
              <IconSymbol
                ios_icon_name="building.2"
                android_material_icon_name="business"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={language === 'fr' ? 'Nom de votre entreprise' : language === 'es' ? 'Nombre de su empresa' : language === 'ar' ? 'اسم شركتك' : 'Your Company Name'}
                placeholderTextColor={colors.textSecondary}
                value={formData.company_name}
                onChangeText={(text) => setFormData({ ...formData, company_name: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {language === 'fr' ? 'Nom du contact' : language === 'es' ? 'Nombre del contacto' : language === 'ar' ? 'اسم جهة الاتصال' : 'Contact Name'}
            </Text>
            <View style={styles.inputContainer}>
              <IconSymbol
                ios_icon_name="person"
                android_material_icon_name="person"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={language === 'fr' ? 'Nom de la personne de contact' : language === 'es' ? 'Nombre de la persona de contacto' : language === 'ar' ? 'اسم الشخص المسؤول' : 'Contact Person Name'}
                placeholderTextColor={colors.textSecondary}
                value={formData.contact_name}
                onChangeText={(text) => setFormData({ ...formData, contact_name: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {language === 'fr' ? 'Email' : language === 'es' ? 'Correo electrónico' : language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </Text>
            <View style={styles.inputContainer}>
              <IconSymbol
                ios_icon_name="envelope"
                android_material_icon_name="email"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="contact@company.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {language === 'fr' ? 'Téléphone' : language === 'es' ? 'Teléfono' : language === 'ar' ? 'الهاتف' : 'Phone'}
            </Text>
            <View style={styles.inputContainer}>
              <IconSymbol
                ios_icon_name="phone"
                android_material_icon_name="phone"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="+1 234 567 8900"
                placeholderTextColor={colors.textSecondary}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {language === 'fr' ? 'Secteur' : language === 'es' ? 'Sector' : language === 'ar' ? 'القطاع' : 'Sector'}
            </Text>
            <View style={styles.inputContainer}>
              <IconSymbol
                ios_icon_name="briefcase"
                android_material_icon_name="work"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={language === 'fr' ? 'ex: Import/Export, Fabrication' : language === 'es' ? 'ej: Importación/Exportación, Fabricación' : language === 'ar' ? 'مثال: استيراد/تصدير، تصنيع' : 'e.g., Import/Export, Manufacturing'}
                placeholderTextColor={colors.textSecondary}
                value={formData.sector}
                onChangeText={(text) => setFormData({ ...formData, sector: text })}
              />
            </View>
          </View>
        </View>

        {/* Location Information Form */}
        <View style={[styles.formSection, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {language === 'fr' ? 'Localisation' : language === 'es' ? 'Ubicación' : language === 'ar' ? 'الموقع' : 'Location'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {language === 'fr' ? 'Pays' : language === 'es' ? 'País' : language === 'ar' ? 'البلد' : 'Country'}
            </Text>
            <View style={styles.inputContainer}>
              <IconSymbol
                ios_icon_name="globe"
                android_material_icon_name="public"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={language === 'fr' ? 'Pays' : language === 'es' ? 'País' : language === 'ar' ? 'البلد' : 'Country'}
                placeholderTextColor={colors.textSecondary}
                value={formData.country}
                onChangeText={(text) => setFormData({ ...formData, country: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {language === 'fr' ? 'Ville' : language === 'es' ? 'Ciudad' : language === 'ar' ? 'المدينة' : 'City'}
            </Text>
            <View style={styles.inputContainer}>
              <IconSymbol
                ios_icon_name="location"
                android_material_icon_name="location_city"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={language === 'fr' ? 'Ville' : language === 'es' ? 'Ciudad' : language === 'ar' ? 'المدينة' : 'City'}
                placeholderTextColor={colors.textSecondary}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {language === 'fr' ? 'Enregistrer' : language === 'es' ? 'Guardar' : language === 'ar' ? 'حفظ' : 'Save'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={handleBackToDashboard}
          >
            <IconSymbol
              ios_icon_name="arrow.left"
              android_material_icon_name="arrow_back"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              {language === 'fr' ? 'Retour au tableau de bord' : language === 'es' ? 'Volver al panel' : language === 'ar' ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
            </Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifiedText: {
    fontSize: 13,
    color: '#065f46',
    fontWeight: '600',
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: '90%',
  },
  unverifiedText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
    textAlign: 'center',
  },
  formSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
