
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";
import { logEvent } from "@/utils/eventLogger";
import { FAQSection, FAQItem } from "@/components/FAQSection";
import { HowItWorksSection, HowItWorksStep } from "@/components/HowItWorksSection";
import { ConfidenceBanner } from "@/components/ConfidenceBanner";

export default function FreightQuoteScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, client } = useAuth();
  const params = useLocalSearchParams();
  
  const serviceId = params.service_id as string | undefined;

  const [serviceName, setServiceName] = useState<string>("");
  const [formData, setFormData] = useState({
    clientName: client?.contact_name || "",
    clientEmail: user?.email || "",
    cargoType: "",
    volumeDetails: "",
    incoterm: "",
    desiredEta: "",
    additionalNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServiceName = useCallback(async () => {
    if (!serviceId) return;
    
    try {
      const { data, error } = await supabase
        .from('services_global')
        .select('name_fr, name_en')
        .eq('id', serviceId)
        .single();

      if (error) {
        console.error('Error fetching service:', error);
        return;
      }

      setServiceName(data.name_fr || data.name_en || "");
    } catch (error) {
      console.error('Exception fetching service:', error);
    }
  }, [serviceId]);

  useEffect(() => {
    if (serviceId) {
      fetchServiceName();
    }
  }, [serviceId, fetchServiceName]);

  useEffect(() => {
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientName: client.contact_name || "",
        clientEmail: user?.email || "",
      }));
    }
  }, [client, user]);

  // Log the "service_quote_click" event when the screen loads
  useEffect(() => {
    const logQuoteClickEvent = async () => {
      await logEvent({
        eventType: 'service_quote_click',
        userId: user?.id || null,
        clientId: client?.id || null,
        serviceId: serviceId || null,
        details: serviceName ? `Service: ${serviceName}` : null,
      });
      console.log('Logged service_quote_click event');
    };

    logQuoteClickEvent();
  }, [user, client, serviceId, serviceName]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.clientName.trim()) {
      Alert.alert(t.common.error || "Erreur", "Veuillez entrer votre nom");
      return;
    }

    if (!formData.clientEmail.trim()) {
      Alert.alert(t.common.error || "Erreur", "Veuillez entrer votre email");
      return;
    }

    if (!formData.cargoType.trim()) {
      Alert.alert(t.common.error || "Erreur", "Veuillez spécifier le type de cargo");
      return;
    }

    setIsSubmitting(true);

    try {
      const quoteData: any = {
        client: client?.id || null,
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        cargo_type: formData.cargoType,
        volume_details: formData.volumeDetails || null,
        incoterm: formData.incoterm || null,
        desired_eta: formData.desiredEta || null,
        status: 'received',
      };

      // Add service reference in notes if service_id is provided
      if (serviceId && serviceName) {
        quoteData.volume_details = `Service: ${serviceName}\n${formData.volumeDetails || ''}`;
      }

      const { data, error } = await supabase
        .from('freight_quotes')
        .insert([quoteData])
        .select()
        .single();

      if (error) {
        console.error('Error submitting quote:', error);
        Alert.alert(
          t.common.error || "Erreur",
          "Une erreur s'est produite lors de l'envoi de votre demande. Veuillez réessayer."
        );
        setIsSubmitting(false);
        return;
      }

      console.log('Quote submitted successfully:', data);

      // Log quote_created event
      await logEvent({
        eventType: 'quote_created',
        userId: user?.id || null,
        clientId: client?.id || null,
        serviceId: serviceId || null,
        quoteId: data.id,
        details: `Quote created for ${formData.cargoType}`,
      });

      Alert.alert(
        "Demande envoyée !",
        t.feedbackMessages.quoteSubmitted,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Exception submitting quote:', error);
      Alert.alert(
        t.common.error || "Erreur",
        "Une erreur s'est produite. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
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
          Demande de devis
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
            ios_icon_name="doc.text.fill"
            android_material_icon_name="description"
            size={64}
            color={colors.primary}
          />
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            Demande de devis fret
          </Text>
          {serviceName && (
            <View style={[styles.serviceBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.serviceBadgeText, { color: colors.primary }]}>
                Service: {serviceName}
              </Text>
            </View>
          )}
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Remplissez le formulaire ci-dessous et notre équipe vous contactera rapidement avec une offre personnalisée.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Informations de contact
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
              value={formData.clientName}
              onChangeText={(text) => setFormData({ ...formData, clientName: text })}
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
              value={formData.clientEmail}
              onChangeText={(text) => setFormData({ ...formData, clientEmail: text })}
              placeholder="votre@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>
            Détails du fret
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Type de cargo *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: colors.border,
              }]}
              value={formData.cargoType}
              onChangeText={(text) => setFormData({ ...formData, cargoType: text })}
              placeholder="Ex: Conteneurs, Vrac, Marchandises diverses"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Volume / Détails
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: colors.border,
              }]}
              value={formData.volumeDetails}
              onChangeText={(text) => setFormData({ ...formData, volumeDetails: text })}
              placeholder="Ex: 2 x 40HC, 25 tonnes, dimensions spéciales..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Incoterm
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: colors.border,
              }]}
              value={formData.incoterm}
              onChangeText={(text) => setFormData({ ...formData, incoterm: text })}
              placeholder="Ex: FOB, CIF, EXW..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Date souhaitée (ETA)
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: colors.border,
              }]}
              value={formData.desiredEta}
              onChangeText={(text) => setFormData({ ...formData, desiredEta: text })}
              placeholder="Ex: Fin janvier 2025"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Notes additionnelles
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: colors.border,
              }]}
              value={formData.additionalNotes}
              onChangeText={(text) => setFormData({ ...formData, additionalNotes: text })}
              placeholder="Informations complémentaires..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
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
              {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
            </Text>
            {!isSubmitting && (
              <IconSymbol
                ios_icon_name="arrow.right"
                android_material_icon_name="send"
                size={20}
                color="#ffffff"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Confidence Banner */}
        <ConfidenceBanner
          blocks={[
            {
              icon: { ios: 'headphones', android: 'support_agent' },
              title: t.confidenceBanner.block1Title,
              description: t.confidenceBanner.block1Desc,
              color: colors.primary,
            },
            {
              icon: { ios: 'checkmark.seal.fill', android: 'verified_user' },
              title: t.confidenceBanner.block2Title,
              description: t.confidenceBanner.block2Desc,
              color: colors.secondary,
            },
            {
              icon: { ios: 'shield.checkered', android: 'security' },
              title: t.confidenceBanner.block3Title,
              description: t.confidenceBanner.block3Desc,
              color: colors.accent,
            },
            {
              icon: { ios: 'star.fill', android: 'star' },
              title: t.confidenceBanner.block4Title,
              description: t.confidenceBanner.block4Desc,
              color: colors.success,
            },
          ]}
        />

        {/* FAQ Section */}
        <FAQSection
          title={t.freightQuote.faqTitle}
          items={[
            {
              question: t.freightQuote.faqQuestion1,
              answer: t.freightQuote.faqAnswer1,
            },
            {
              question: t.freightQuote.faqQuestion2,
              answer: t.freightQuote.faqAnswer2,
            },
            {
              question: t.freightQuote.faqQuestion3,
              answer: t.freightQuote.faqAnswer3,
            },
            {
              question: t.freightQuote.faqQuestion4,
              answer: t.freightQuote.faqAnswer4,
            },
            {
              question: t.freightQuote.faqQuestion5,
              answer: t.freightQuote.faqAnswer5,
            },
          ]}
        />

        {/* How It Works Section */}
        <HowItWorksSection
          title={t.freightQuote.howItWorksTitle}
          steps={[
            {
              number: 1,
              title: t.howItWorks.step1Title,
              description: t.howItWorks.step1Desc,
              icon: { ios: 'doc.text.fill', android: 'description' },
              color: colors.primary,
            },
            {
              number: 2,
              title: t.howItWorks.step2Title,
              description: t.howItWorks.step2Desc,
              icon: { ios: 'person.fill.checkmark', android: 'verified_user' },
              color: colors.secondary,
            },
            {
              number: 3,
              title: t.howItWorks.step3Title,
              description: t.howItWorks.step3Desc,
              icon: { ios: 'checkmark.circle.fill', android: 'check_circle' },
              color: colors.accent,
            },
            {
              number: 4,
              title: t.howItWorks.step4Title,
              description: t.howItWorks.step4Desc,
              icon: { ios: 'location.fill', android: 'my_location' },
              color: colors.success,
            },
          ]}
        />
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
  serviceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  serviceBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
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
    minHeight: 100,
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
});
