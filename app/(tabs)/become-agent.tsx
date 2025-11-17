
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";

interface Benefit {
  title: string;
  description: string;
  icon: string;
}

export default function BecomeAgentScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();

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
            onPress={() => console.log('Apply pressed')}
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
});
