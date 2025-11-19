
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, Alert, Modal, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { PageHeader } from "@/components/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";
import { FAQSection, FAQItem } from "@/components/FAQSection";
import { HowItWorksSection, HowItWorksStep } from "@/components/HowItWorksSection";
import { TrustBar } from "@/components/TrustBar";

interface Port {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  region: string | null;
}

interface ActivityOption {
  value: string;
  label: string;
}

export default function BecomeAgentScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ports, setPorts] = useState<Port[]>([]);
  const [showPortPicker, setShowPortPicker] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [portSearchQuery, setPortSearchQuery] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    whatsapp: "",
    website: "",
    selectedPort: null as Port | null,
    selectedActivities: [] as string[],
    yearsExperience: "",
    certifications: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const activityOptions: ActivityOption[] = [
    { value: "consignation", label: "Consignation" },
    { value: "customs", label: "Customs" },
    { value: "freight_forwarding", label: "Freight Forwarding" },
    { value: "ship_supply", label: "Ship Supply" },
    { value: "warehousing", label: "Warehousing" },
    { value: "trucking", label: "Trucking" },
    { value: "consulting", label: "Consulting" },
  ];

  useEffect(() => {
    loadPorts();
  }, []);

  const loadPorts = async () => {
    try {
      const { data, error } = await supabase
        .from("ports")
        .select("id, name, city, country, region")
        .eq("status", "actif")
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
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = t.becomeAgent.requiredField;
    }
    if (!formData.email.trim()) {
      newErrors.email = t.becomeAgent.requiredField;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.becomeAgent.invalidEmail;
    }
    if (!formData.selectedPort) {
      newErrors.port = t.becomeAgent.requiredField;
    }
    if (formData.selectedActivities.length === 0) {
      newErrors.activities = t.becomeAgent.selectAtLeastOne;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(t.becomeAgent.errorTitle, "Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("global_agents")
        .insert({
          company_name: formData.companyName,
          port: formData.selectedPort?.id,
          activities: formData.selectedActivities,
          years_experience: formData.yearsExperience ? Number(formData.yearsExperience) : null,
          email: formData.email,
          whatsapp: formData.whatsapp || null,
          website: formData.website || null,
          certifications: formData.certifications || null,
          status: "pending",
          is_premium_listing: false,
          notes_internal: "",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("Application submitted successfully:", data);
      
      setShowSuccessMessage(true);
      setFormData({
        companyName: "",
        email: "",
        phone: "",
        whatsapp: "",
        website: "",
        selectedPort: null,
        selectedActivities: [],
        yearsExperience: "",
        certifications: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      Alert.alert(t.becomeAgent.errorTitle, t.becomeAgent.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivity = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedActivities: prev.selectedActivities.includes(activity)
        ? prev.selectedActivities.filter((a) => a !== activity)
        : [...prev.selectedActivities, activity],
    }));
  };

  const filteredPorts = ports.filter((port) =>
    `${port.name} ${port.city} ${port.country}`
      .toLowerCase()
      .includes(portSearchQuery.toLowerCase())
  );

  if (showSuccessMessage) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <View style={{ width: 28 }} />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t.becomeAgent.title}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.successContainer}>
          <View style={[styles.successIconContainer, { backgroundColor: colors.accent }]}>
            <IconSymbol
              ios_icon_name="checkmark"
              android_material_icon_name="check"
              size={60}
              color="#ffffff"
            />
          </View>
          
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>
            {t.becomeAgent.successTitle}
          </Text>
          
          <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
            {t.becomeAgent.successMessage}
          </Text>

          <TouchableOpacity
            style={[styles.backToHomeButton, { backgroundColor: colors.accent }]}
            onPress={() => {
              setShowSuccessMessage(false);
              router.push("/(tabs)/(home)");
            }}
          >
            <Text style={styles.backToHomeButtonText}>
              {t.becomeAgent.backToHome}
            </Text>
            <IconSymbol
              ios_icon_name="house.fill"
              android_material_icon_name="home"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showForm) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowForm(false)}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t.becomeAgent.applicationForm}
          </Text>
          <TouchableOpacity
            style={[styles.quoteButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/freight-quote')}
          >
            <IconSymbol
              ios_icon_name="doc.text.fill"
              android_material_icon_name="description"
              size={18}
              color="#ffffff"
            />
            <Text style={styles.quoteButtonText}>{t.home.requestQuote}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.formScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t.becomeAgent.companyName} *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: errors.companyName ? "#ff4444" : colors.border }]}
                placeholder={t.becomeAgent.companyNamePlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={formData.companyName}
                onChangeText={(text) => setFormData({ ...formData, companyName: text })}
              />
              {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t.becomeAgent.selectPort} *
              </Text>
              <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: theme.colors.card, borderColor: errors.port ? "#ff4444" : colors.border }]}
                onPress={() => setShowPortPicker(true)}
              >
                <Text style={[styles.pickerButtonText, { color: formData.selectedPort ? theme.colors.text : colors.textSecondary }]}>
                  {formData.selectedPort
                    ? `${formData.selectedPort.name}, ${formData.selectedPort.city}, ${formData.selectedPort.country}`
                    : t.becomeAgent.selectPort}
                </Text>
                <IconSymbol
                  ios_icon_name="chevron.down"
                  android_material_icon_name="expand_more"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {errors.port && <Text style={styles.errorText}>{errors.port}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t.becomeAgent.activities} *
              </Text>
              <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: theme.colors.card, borderColor: errors.activities ? "#ff4444" : colors.border }]}
                onPress={() => setShowActivityPicker(true)}
              >
                <Text style={[styles.pickerButtonText, { color: formData.selectedActivities.length > 0 ? theme.colors.text : colors.textSecondary }]}>
                  {formData.selectedActivities.length > 0
                    ? `${formData.selectedActivities.length} selected`
                    : t.becomeAgent.selectActivities}
                </Text>
                <IconSymbol
                  ios_icon_name="chevron.down"
                  android_material_icon_name="expand_more"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {errors.activities && <Text style={styles.errorText}>{errors.activities}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t.becomeAgent.yearsExperience}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: colors.border }]}
                placeholder="5"
                placeholderTextColor={colors.textSecondary}
                value={formData.yearsExperience}
                onChangeText={(text) => setFormData({ ...formData, yearsExperience: text })}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t.becomeAgent.whatsapp}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: colors.border }]}
                placeholder={t.becomeAgent.whatsappPlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={formData.whatsapp}
                onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t.becomeAgent.email} *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: errors.email ? "#ff4444" : colors.border }]}
                placeholder={t.becomeAgent.emailPlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t.becomeAgent.website}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: colors.border }]}
                placeholder={t.becomeAgent.websitePlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={formData.website}
                onChangeText={(text) => setFormData({ ...formData, website: text })}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t.becomeAgent.certifications}
              </Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: colors.border }]}
                placeholder={t.becomeAgent.certificationsPlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={formData.certifications}
                onChangeText={(text) => setFormData({ ...formData, certifications: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <React.Fragment>
                <Text style={styles.submitButtonText}>
                  {t.becomeAgent.submitApplication}
                </Text>
                <IconSymbol
                  ios_icon_name="paperplane.fill"
                  android_material_icon_name="send"
                  size={20}
                  color="#ffffff"
                />
              </React.Fragment>
            )}
          </TouchableOpacity>
        </ScrollView>

        <Modal
          visible={showPortPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPortPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {t.becomeAgent.selectPort}
                </Text>
                <TouchableOpacity onPress={() => setShowPortPicker(false)}>
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
                placeholder={t.becomeAgent.searchPort}
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
                        setFormData({ ...formData, selectedPort: port });
                        setShowPortPicker(false);
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

        <Modal
          visible={showActivityPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowActivityPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {t.becomeAgent.selectActivities}
                </Text>
                <TouchableOpacity onPress={() => setShowActivityPicker(false)}>
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalList}>
                {activityOptions.map((activity, index) => (
                  <React.Fragment key={activity.value}>
                    <TouchableOpacity
                      style={styles.checkboxItem}
                      onPress={() => toggleActivity(activity.value)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: formData.selectedActivities.includes(activity.value)
                              ? colors.accent
                              : "transparent",
                            borderColor: formData.selectedActivities.includes(activity.value)
                              ? colors.accent
                              : colors.border,
                          },
                        ]}
                      >
                        {formData.selectedActivities.includes(activity.value) && (
                          <IconSymbol
                            ios_icon_name="checkmark"
                            android_material_icon_name="check"
                            size={16}
                            color="#ffffff"
                          />
                        )}
                      </View>
                      <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
                        {activity.label}
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PageHeader title={t.becomeAgent.title} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <IconSymbol
            ios_icon_name="handshake"
            android_material_icon_name="handshake"
            size={80}
            color={colors.accent}
          />
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            {t.becomeAgent.subtitle}
          </Text>
          <Text style={[styles.introduction, { color: colors.textSecondary }]}>
            {t.becomeAgent.introduction}
          </Text>
        </View>

        {/* Trust Bar */}
        <TrustBar
          items={[
            {
              icon: { ios: 'lock.shield.fill', android: 'lock' },
              text: t.trustBar.item1,
            },
            {
              icon: { ios: 'checkmark.circle.fill', android: 'check_circle' },
              text: t.trustBar.item2,
            },
            {
              icon: { ios: 'bolt.fill', android: 'flash_on' },
              text: t.trustBar.item3,
            },
            {
              icon: { ios: 'shield.checkered', android: 'security' },
              text: t.trustBar.item4,
            },
          ]}
        />

        <View style={styles.conditionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.becomeAgent.conditionsTitle}
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.conditionItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.conditionText, { color: theme.colors.text }]}>
                {t.becomeAgent.condition1}
              </Text>
            </View>
            <View style={styles.conditionItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.conditionText, { color: theme.colors.text }]}>
                {t.becomeAgent.condition2}
              </Text>
            </View>
            <View style={styles.conditionItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.conditionText, { color: theme.colors.text }]}>
                {t.becomeAgent.condition3}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.advantagesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.becomeAgent.advantagesTitle}
          </Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.advantageItem}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.advantageText, { color: theme.colors.text }]}>
                {t.becomeAgent.advantage1}
              </Text>
            </View>
            <View style={styles.advantageItem}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.advantageText, { color: theme.colors.text }]}>
                {t.becomeAgent.advantage2}
              </Text>
            </View>
            <View style={styles.advantageItem}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.advantageText, { color: theme.colors.text }]}>
                {t.becomeAgent.advantage3}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.accent }]}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.applyButtonText}>{t.becomeAgent.apply}</Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow_forward"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <FAQSection
          title={t.becomeAgentFaq.faqTitle}
          items={[
            {
              question: t.becomeAgentFaq.faqQuestion1,
              answer: t.becomeAgentFaq.faqAnswer1,
            },
            {
              question: t.becomeAgentFaq.faqQuestion2,
              answer: t.becomeAgentFaq.faqAnswer2,
            },
            {
              question: t.becomeAgentFaq.faqQuestion3,
              answer: t.becomeAgentFaq.faqAnswer3,
            },
            {
              question: t.becomeAgentFaq.faqQuestion4,
              answer: t.becomeAgentFaq.faqAnswer4,
            },
          ]}
        />

        {/* How It Works Section */}
        <HowItWorksSection
          title={t.becomeAgent.applicationForm}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  quoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  quoteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  formScrollContent: {
    paddingBottom: 140,
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
    marginBottom: 16,
  },
  introduction: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  conditionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  advantagesSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  conditionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  advantageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  advantageText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  formSection: {
    paddingHorizontal: 20,
    marginTop: 20,
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
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    flex: 1,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 18,
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
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    flex: 1,
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
  backToHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  backToHomeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
