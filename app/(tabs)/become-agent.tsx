
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, Alert, Modal, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";

interface Benefit {
  title: string;
  description: string;
  icon: string;
}

interface Port {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
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

  // Form fields
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    whatsapp: "",
    website: "",
    selectedPort: null as Port | null,
    selectedActivities: [] as string[],
    yearsExperience: "",
    certifications: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const activityOptions: ActivityOption[] = [
    { value: "consignation", label: "Ship Agency / Consignation" },
    { value: "customs", label: "Customs Clearance" },
    { value: "freight_forwarding", label: "Freight Forwarding" },
    { value: "ship_supply", label: "Ship Supply" },
    { value: "warehousing", label: "Warehousing" },
    { value: "trucking", label: "Trucking / Transport" },
    { value: "consulting", label: "Consulting" },
  ];

  const benefits: Benefit[] = [
    {
      title: "Global Network",
      description: "Access to our worldwide network of partners and clients",
      icon: "public",
    },
    {
      title: "Competitive Commission",
      description: "Attractive commission structure and incentive programs",
      icon: "payments",
    },
    {
      title: "Training & Support",
      description: "Comprehensive training and ongoing support",
      icon: "school",
    },
    {
      title: "Marketing Tools",
      description: "Professional marketing materials and digital resources",
      icon: "campaign",
    },
    {
      title: "Technology Platform",
      description: "Access to our advanced booking and tracking systems",
      icon: "computer",
    },
    {
      title: "Brand Recognition",
      description: "Leverage our established brand and reputation",
      icon: "verified",
    },
  ];

  useEffect(() => {
    loadPorts();
  }, []);

  const loadPorts = async () => {
    try {
      const { data, error } = await supabase
        .from("ports")
        .select("id, name, city, country")
        .eq("status", "actif")
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
    if (!formData.contactName.trim()) {
      newErrors.contactName = t.becomeAgent.requiredField;
    }
    if (!formData.email.trim()) {
      newErrors.email = t.becomeAgent.requiredField;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.becomeAgent.invalidEmail;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t.becomeAgent.requiredField;
    }
    if (!formData.selectedPort) {
      newErrors.port = t.becomeAgent.requiredField;
    }
    if (formData.selectedActivities.length === 0) {
      newErrors.activities = t.becomeAgent.selectAtLeastOne;
    }
    if (!formData.yearsExperience.trim() || isNaN(Number(formData.yearsExperience))) {
      newErrors.yearsExperience = t.becomeAgent.requiredField;
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
      const { data: projectData } = await supabase.auth.getSession();
      const supabaseUrl = supabase.supabaseUrl;

      const response = await fetch(`${supabaseUrl}/functions/v1/submit-agent-application`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${projectData.session?.access_token || ""}`,
        },
        body: JSON.stringify({
          company_name: formData.companyName,
          port_id: formData.selectedPort?.id,
          activities: formData.selectedActivities,
          years_experience: Number(formData.yearsExperience),
          contact_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          website: formData.website,
          certifications: formData.certifications,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert(
          t.becomeAgent.successTitle,
          t.becomeAgent.successMessage,
          [
            {
              text: "OK",
              onPress: () => {
                setShowForm(false);
                setFormData({
                  companyName: "",
                  contactName: "",
                  email: "",
                  phone: "",
                  whatsapp: "",
                  website: "",
                  selectedPort: null,
                  selectedActivities: [],
                  yearsExperience: "",
                  certifications: "",
                  message: "",
                });
              },
            },
          ]
        );
      } else {
        throw new Error(result.error || "Submission failed");
      }
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
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.formScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>
              {t.becomeAgent.companyInfo}
            </Text>

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
                {t.becomeAgent.contactName} *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: errors.contactName ? "#ff4444" : colors.border }]}
                placeholder={t.becomeAgent.contactNamePlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={formData.contactName}
                onChangeText={(text) => setFormData({ ...formData, contactName: text })}
              />
              {errors.contactName && <Text style={styles.errorText}>{errors.contactName}</Text>}
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
                {t.becomeAgent.phone} *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: errors.phone ? "#ff4444" : colors.border }]}
                placeholder={t.becomeAgent.phonePlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
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
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>
              {t.becomeAgent.portSelection}
            </Text>

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
                {t.becomeAgent.yearsExperience} *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: errors.yearsExperience ? "#ff4444" : colors.border }]}
                placeholder="5"
                placeholderTextColor={colors.textSecondary}
                value={formData.yearsExperience}
                onChangeText={(text) => setFormData({ ...formData, yearsExperience: text })}
                keyboardType="number-pad"
              />
              {errors.yearsExperience && <Text style={styles.errorText}>{errors.yearsExperience}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t.becomeAgent.certifications}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: colors.border }]}
                placeholder={t.becomeAgent.certificationsPlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={formData.certifications}
                onChangeText={(text) => setFormData({ ...formData, certifications: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                {t.becomeAgent.message}
              </Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: colors.border }]}
                placeholder={t.becomeAgent.messagePlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
                multiline
                numberOfLines={4}
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
                  {loading ? t.becomeAgent.submitting : t.becomeAgent.submitApplication}
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

        {/* Port Picker Modal */}
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

        {/* Activity Picker Modal */}
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
          {t.becomeAgent.title}
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
            ios_icon_name="handshake"
            android_material_icon_name="handshake"
            size={80}
            color={colors.accent}
          />
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            {t.becomeAgent.subtitle}
          </Text>
          <Text style={styles.description}>
            Partner with 3S Global and expand your business opportunities in the maritime and logistics industry
          </Text>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.becomeAgent.benefits}
          </Text>
          <View style={styles.benefitsContainer}>
            {benefits.map((benefit, index) => (
              <React.Fragment key={index}>
                <View style={[styles.benefitCard, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.benefitIconContainer, { backgroundColor: colors.accent }]}>
                    <IconSymbol
                      ios_icon_name={benefit.icon}
                      android_material_icon_name={benefit.icon as any}
                      size={28}
                      color="#ffffff"
                    />
                  </View>
                  <View style={styles.benefitContent}>
                    <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>
                      {benefit.title}
                    </Text>
                    <Text style={styles.benefitDescription}>{benefit.description}</Text>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.requirementsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Requirements
          </Text>
          <View style={[styles.requirementsCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.requirementItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.requirementText, { color: theme.colors.text }]}>
                Established business in logistics or maritime industry
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.requirementText, { color: theme.colors.text }]}>
                Strong local market knowledge and network
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.requirementText, { color: theme.colors.text }]}>
                Commitment to quality service and customer satisfaction
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.requirementText, { color: theme.colors.text }]}>
                Financial stability and professional credentials
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
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  requirementsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  requirementsCard: {
    padding: 20,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  requirementText: {
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
  formSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
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
    minHeight: 100,
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
});
