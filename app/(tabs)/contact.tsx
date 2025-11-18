
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/styles/commonStyles";

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

    if (!formData.subject.trim()) {
      Alert.alert(t.common.error || "Erreur", "Veuillez entrer un sujet");
      return;
    }

    if (!formData.message.trim()) {
      Alert.alert(t.common.error || "Erreur", "Veuillez entrer votre message");
      return;
    }

    setIsSubmitting(true);

    // For now, we'll use mailto as a simple solution
    // In production, you would want to send this to an edge function or API
    const mailtoUrl = `mailto:contact@universalshipping.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Nom: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        Alert.alert(
          "Message envoyé",
          "Votre client email a été ouvert. Veuillez envoyer le message.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Erreur",
          "Impossible d'ouvrir le client email. Veuillez contacter contact@universalshipping.com directement."
        );
      }
    } catch (error) {
      console.error('Error opening email client:', error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite. Veuillez contacter contact@universalshipping.com directement."
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
});
