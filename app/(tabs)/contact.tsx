
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";

export default function ContactScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, client } = useAuth();
  const params = useLocalSearchParams();
  
  const prefilledSubject = params.subject as string | undefined;

  const [formData, setFormData] = useState({
    name: client?.contact_name || "",
    email: user?.email || "",
    subject: prefilledSubject || "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData(prev => ({
        ...prev,
        name: client.contact_name || "",
        email: user?.email || "",
      }));
    }
  }, [client, user]);

  useEffect(() => {
    if (prefilledSubject) {
      setFormData(prev => ({
        ...prev,
        subject: prefilledSubject,
      }));
    }
  }, [prefilledSubject]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert(t.common.error || "Erreur", "Veuillez entrer votre nom");
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert(t.common.error || "Erreur", "Veuillez entrer votre email");
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert(t.common.error || "Erreur", "Veuillez entrer un email valide");
      return;
    }

    if (!formData.subject.trim()) {
      Alert.alert(t.common.error || "Erreur", "Veuillez entrer un sujet");
      return;
    }

    if (!formData.message.trim()) {
      Alert.alert(t.common.error || "Erreur", "Veuillez entrer votre message");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to contact_messages collection
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          client_id: client?.id || null,
          user_id: user?.id || null,
          status: 'new',
        }])
        .select()
        .single();

      if (error) {
        console.error('Error submitting contact message:', error);
        Alert.alert(
          t.common.error || "Erreur",
          "Une erreur s'est produite lors de l'envoi de votre message. Veuillez réessayer."
        );
        setIsSubmitting(false);
        return;
      }

      console.log('Contact message submitted successfully:', data);

      // Show success state
      setShowSuccess(true);

      // Reset form
      setFormData({
        name: client?.contact_name || "",
        email: user?.email || "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error('Exception submitting contact message:', error);
      Alert.alert(
        t.common.error || "Erreur",
        "Une erreur s'est produite. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneCall = () => {
    Linking.openURL('tel:+33123456789');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/33123456789');
  };

  if (showSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <View style={{ width: 28 }} />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Nous contacter
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.successContainer}>
          <View style={[styles.successIconContainer, { backgroundColor: colors.success }]}>
            <IconSymbol
              ios_icon_name="checkmark"
              android_material_icon_name="check"
              size={60}
              color="#ffffff"
            />
          </View>
          
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>
            Message envoyé !
          </Text>
          
          <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
            Votre message a bien été reçu. Notre équipe vous répondra dans les plus brefs délais.
          </Text>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setShowSuccess(false);
              router.back();
            }}
          >
            <Text style={styles.backButtonText}>
              Retour
            </Text>
            <IconSymbol
              ios_icon_name="arrow.left"
              android_material_icon_name="arrow_back"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity
          style={styles.headerBackButton}
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
          Nous contacter
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
            ios_icon_name="envelope.fill"
            android_material_icon_name="email"
            size={64}
            color={colors.primary}
          />
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            Contactez nos experts
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Notre équipe est à votre disposition pour répondre à toutes vos questions sur nos services maritimes et logistiques.
          </Text>
        </View>

        <View style={styles.contactMethodsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Moyens de contact rapide
          </Text>

          <View style={styles.contactMethodsGrid}>
            <TouchableOpacity
              style={[styles.contactMethodCard, { backgroundColor: theme.colors.card }]}
              onPress={handlePhoneCall}
            >
              <IconSymbol
                ios_icon_name="phone.fill"
                android_material_icon_name="phone"
                size={32}
                color={colors.primary}
              />
              <Text style={[styles.contactMethodTitle, { color: theme.colors.text }]}>
                Téléphone
              </Text>
              <Text style={[styles.contactMethodText, { color: colors.textSecondary }]}>
                +33 1 23 45 67 89
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactMethodCard, { backgroundColor: theme.colors.card }]}
              onPress={handleWhatsApp}
            >
              <IconSymbol
                ios_icon_name="message.fill"
                android_material_icon_name="chat"
                size={32}
                color={colors.success}
              />
              <Text style={[styles.contactMethodTitle, { color: theme.colors.text }]}>
                WhatsApp
              </Text>
              <Text style={[styles.contactMethodText, { color: colors.textSecondary }]}>
                Chat direct
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactMethodCard, { backgroundColor: theme.colors.card }]}
              onPress={() => Linking.openURL('mailto:contact@universalshipping.com')}
            >
              <IconSymbol
                ios_icon_name="envelope.fill"
                android_material_icon_name="email"
                size={32}
                color={colors.secondary}
              />
              <Text style={[styles.contactMethodTitle, { color: theme.colors.text }]}>
                Email
              </Text>
              <Text style={[styles.contactMethodText, { color: colors.textSecondary }]}>
                contact@universalshipping.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Formulaire de contact
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Nom complet *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: colors.border,
              }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Votre nom"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Email *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: colors.border,
              }]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="votre@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Sujet *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: colors.border,
              }]}
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
              placeholder="Objet de votre demande"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Message *
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: colors.border,
              }]}
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              placeholder="Décrivez votre demande..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary },
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
            </Text>
            {!isSubmitting && (
              <IconSymbol
                ios_icon_name="paperplane.fill"
                android_material_icon_name="send"
                size={20}
                color="#ffffff"
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Nos bureaux
          </Text>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <IconSymbol
              ios_icon_name="building.2.fill"
              android_material_icon_name="business"
              size={24}
              color={colors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                Siège social
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                123 Avenue Maritime{'\n'}
                75001 Paris, France
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="schedule"
              size={24}
              color={colors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                Horaires
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Lun - Ven: 9h00 - 18h00{'\n'}
                Sam - Dim: Fermé
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
  headerBackButton: {
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  contactMethodsSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  contactMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactMethodCard: {
    flex: 1,
    minWidth: '30%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactMethodTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  contactMethodText: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
