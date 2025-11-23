
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";
import { logEvent } from "@/utils/eventLogger";
import { FAQSection } from "@/components/FAQSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { ConfidenceBanner } from "@/components/ConfidenceBanner";

interface Port {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  region: string | null;
}

export default function FreightQuoteScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user, client } = useAuth();
  const params = useLocalSearchParams();
  
  const serviceId = params.service_id as string | undefined;

  const [serviceName, setServiceName] = useState<string>("");
  const [ports, setPorts] = useState<Port[]>([]);
  const [showOriginPortPicker, setShowOriginPortPicker] = useState(false);
  const [showDestinationPortPicker, setShowDestinationPortPicker] = useState(false);
  const [portSearchQuery, setPortSearchQuery] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    originPort: null as Port | null,
    destinationPort: null as Port | null,
    cargoType: "",
    cargoVolume: "",
    details: "",
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

  const loadPorts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("ports")
        .select("id, name, city, country, region")
        .eq("status", "active")
        .order("region")
        .order("name");

      if (error) {
        console.error("Error loading ports:", error);
        return;
      }

      setPorts(data || []);
    } catch (error) {
      console.error("Error loading ports:", error);
    }
  }, []);

  useEffect(() => {
    if (serviceId) {
      fetchServiceName();
    }
    loadPorts();
  }, [serviceId, fetchServiceName, loadPorts]);

  useEffect(() => {
    // Pre-fill client information if user is logged in
    if (user && client) {
      setFormData(prev => ({
        ...prev,
        clientName: client.contact_name || client.company_name || "",
        clientEmail: user.email || "",
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

  const handleSubmit = useCallback(async () => {
    console.log('=== FREIGHT QUOTE SUBMIT BUTTON CLICKED ===');
    console.log('Form data:', formData);
    console.log('User:', user);
    console.log('Client:', client);
    console.log('Is submitting:', isSubmitting);

    // Prevent double submission
    if (isSubmitting) {
      console.log('Already submitting, ignoring click');
      return;
    }

    // Determine if user is logged in
    const isLoggedIn = !!(user && client);
    console.log('Is logged in:', isLoggedIn);

    // Validation - cargo_type is always required
    if (!formData.cargoType.trim()) {
      console.log('Validation failed: cargo type missing');
      Alert.alert(
        t.common.error || "Erreur",
        "Le champ 'Type de cargo' est obligatoire."
      );
      return;
    }

    // If user is NOT logged in, client_name and client_email are required
    if (!isLoggedIn) {
      if (!formData.clientName.trim()) {
        console.log('Validation failed: client name missing');
        Alert.alert(
          t.common.error || "Erreur",
          "Veuillez entrer votre nom."
        );
        return;
      }

      if (!formData.clientEmail.trim()) {
        console.log('Validation failed: client email missing');
        Alert.alert(
          t.common.error || "Erreur",
          "Veuillez entrer votre email."
        );
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.clientEmail)) {
        console.log('Validation failed: invalid email format');
        Alert.alert(
          t.common.error || "Erreur",
          "Veuillez entrer un email valide."
        );
        return;
      }
    }

    // Validate ports
    if (!formData.originPort) {
      console.log('Validation failed: origin port missing');
      Alert.alert(
        t.common.error || "Erreur",
        "Veuillez sélectionner un port d'origine."
      );
      return;
    }

    if (!formData.destinationPort) {
      console.log('Validation failed: destination port missing');
      Alert.alert(
        t.common.error || "Erreur",
        "Veuillez sélectionner un port de destination."
      );
      return;
    }

    console.log('All validations passed, starting submission');
    setIsSubmitting(true);

    try {
      // Prepare volume_details combining cargo_volume and details
      let volumeDetailsText = '';
      
      // Add cargo volume if provided
      if (formData.cargoVolume.trim()) {
        volumeDetailsText += formData.cargoVolume.trim();
      }
      
      // Add additional details if provided
      if (formData.details.trim()) {
        if (volumeDetailsText) {
          volumeDetailsText += '\n\n';
        }
        volumeDetailsText += formData.details.trim();
      }

      // Prepare quote data according to requirements
      const quoteData: any = {
        // Technical fields
        status: 'received', // Default status (database enum value)
        created_at: new Date().toISOString(), // Current timestamp
        
        // User authentication conditional fields
        client: isLoggedIn ? client.id : null, // client_id if logged in, null otherwise
        client_email: isLoggedIn ? user.email : formData.clientEmail.trim(),
        client_name: isLoggedIn ? (client.contact_name || client.company_name) : formData.clientName.trim(),
        
        // Form fields mapped to collection
        cargo_type: formData.cargoType.trim(),
        volume_details: volumeDetailsText || null,
        origin_port: formData.originPort.id,
        destination_port: formData.destinationPort.id,
        service_id: serviceId || null,
      };

      console.log('Submitting freight quote with data:', quoteData);

      // Create the freight quote
      const { data, error } = await supabase
        .from('freight_quotes')
        .insert([quoteData])
        .select()
        .single();

      if (error) {
        console.error('Error submitting quote:', error);
        Alert.alert(
          t.common.error || "Erreur",
          "Une erreur est survenue, merci de réessayer."
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

      // Send emails via Edge Function (optional - don't fail if emails fail)
      try {
        const emailPayload = {
          quoteId: data.id,
          clientName: quoteData.client_name,
          clientEmail: quoteData.client_email,
          serviceName: serviceName || undefined,
          originPort: `${formData.originPort.name}, ${formData.originPort.city}, ${formData.originPort.country}`,
          destinationPort: `${formData.destinationPort.name}, ${formData.destinationPort.city}, ${formData.destinationPort.country}`,
          cargoType: formData.cargoType,
          cargoVolume: formData.cargoVolume || undefined,
          details: formData.details || undefined,
        };

        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          'send-freight-quote-emails',
          { body: emailPayload }
        );

        if (emailError) {
          console.error('Error sending emails:', emailError);
          // Don't fail the quote creation if emails fail
        } else {
          console.log('Emails sent successfully:', emailData);
        }
      } catch (emailException) {
        console.error('Exception sending emails:', emailException);
        // Don't fail the quote creation if emails fail
      }

      // Success handling based on authentication status
      if (isLoggedIn) {
        // User is logged in - show success message and redirect to client dashboard
        Alert.alert(
          "Demande envoyée !",
          "Votre demande de devis a bien été envoyée.",
          [
            {
              text: "OK",
              onPress: () => {
                setIsSubmitting(false);
                router.push('/(tabs)/client-dashboard');
              },
            },
          ]
        );
      } else {
        // User is not logged in - show success message on the same page
        setIsSubmitting(false);
        setShowSuccessMessage(true);
      }
    } catch (error) {
      console.error('Exception submitting quote:', error);
      Alert.alert(
        t.common.error || "Erreur",
        "Une erreur est survenue, merci de réessayer."
      );
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, user, client, serviceId, serviceName, router, t]);

  const filteredPorts = ports.filter((port) =>
    `${port.name} ${port.city} ${port.country}`
      .toLowerCase()
      .includes(portSearchQuery.toLowerCase())
  );

  // Success message component for non-logged-in users
  if (showSuccessMessage) {
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
          <View style={styles.successContainer}>
            <View style={[styles.successIconContainer, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={80}
                color={colors.success}
              />
            </View>
            <Text style={[styles.successTitle, { color: theme.colors.text }]}>
              Votre demande de devis a bien été envoyée.
            </Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              Vous recevrez une réponse par email sous 24 à 48 heures ouvrables.
            </Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              Notre équipe d&apos;experts va analyser votre demande et vous envoyer un devis détaillé.
            </Text>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/(home)/')}
            >
              <Text style={styles.primaryButtonText}>Retour à l&apos;accueil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/client-space')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                Créer un compte pour suivre mes devis
              </Text>
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
        </ScrollView>
      </View>
    );
  }

  // Determine if fields should be editable
  const isLoggedIn = !!(user && client);

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
              Nom complet {!isLoggedIn && '*'}
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
              editable={!isSubmitting}
            />
            {isLoggedIn && formData.clientName && (
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                ✓ Pré-rempli depuis votre profil
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Email {!isLoggedIn && '*'}
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
              editable={!isSubmitting}
            />
            {isLoggedIn && formData.clientEmail && (
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                ✓ Pré-rempli depuis votre compte
              </Text>
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>
            Ports et itinéraire
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Port d&apos;origine *
            </Text>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => !isSubmitting && setShowOriginPortPicker(true)}
              disabled={isSubmitting}
            >
              <Text style={[styles.pickerButtonText, { color: formData.originPort ? theme.colors.text : colors.textSecondary }]}>
                {formData.originPort
                  ? `${formData.originPort.name}, ${formData.originPort.city}, ${formData.originPort.country}`
                  : "Sélectionner le port d'origine"}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="expand_more"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Port de destination *
            </Text>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: theme.colors.card, borderColor: colors.border }]}
              onPress={() => !isSubmitting && setShowDestinationPortPicker(true)}
              disabled={isSubmitting}
            >
              <Text style={[styles.pickerButtonText, { color: formData.destinationPort ? theme.colors.text : colors.textSecondary }]}>
                {formData.destinationPort
                  ? `${formData.destinationPort.name}, ${formData.destinationPort.city}, ${formData.destinationPort.country}`
                  : "Sélectionner le port de destination"}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.down"
                android_material_icon_name="expand_more"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
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
              editable={!isSubmitting}
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
              value={formData.cargoVolume}
              onChangeText={(text) => setFormData({ ...formData, cargoVolume: text })}
              placeholder="Ex: 2 x 40HC, 25 tonnes, dimensions spéciales..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Remarques additionnelles
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: colors.border,
              }]}
              value={formData.details}
              onChangeText={(text) => setFormData({ ...formData, details: text })}
              placeholder="Informations complémentaires..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              editable={!isSubmitting}
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
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande de devis"}
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

      {/* Origin Port Picker Modal */}
      <Modal
        visible={showOriginPortPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOriginPortPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Port d&apos;origine
              </Text>
              <TouchableOpacity onPress={() => setShowOriginPortPicker(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              placeholder="Rechercher un port..."
              placeholderTextColor={colors.textSecondary}
              value={portSearchQuery}
              onChangeText={setPortSearchQuery}
            />
            <ScrollView style={styles.modalList}>
              {filteredPorts.map((port, index) => (
                <React.Fragment key={port.id}>
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setFormData({ ...formData, originPort: port });
                      setShowOriginPortPicker(false);
                      setPortSearchQuery("");
                    }}
                  >
                    <Text style={[styles.modalItemText, { color: theme.colors.text }]}>
                      {port.name}, {port.city}, {port.country}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Destination Port Picker Modal */}
      <Modal
        visible={showDestinationPortPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDestinationPortPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Port de destination
              </Text>
              <TouchableOpacity onPress={() => setShowDestinationPortPicker(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              placeholder="Rechercher un port..."
              placeholderTextColor={colors.textSecondary}
              value={portSearchQuery}
              onChangeText={setPortSearchQuery}
            />
            <ScrollView style={styles.modalList}>
              {filteredPorts.map((port, index) => (
                <React.Fragment key={port.id}>
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setFormData({ ...formData, destinationPort: port });
                      setShowDestinationPortPicker(false);
                      setPortSearchQuery("");
                    }}
                  >
                    <Text style={[styles.modalItemText, { color: theme.colors.text }]}>
                      {port.name}, {port.city}, {port.country}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerButtonText: {
    fontSize: 16,
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchInput: {
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
    gap: 20,
  },
  successIconContainer: {
    borderRadius: 100,
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
