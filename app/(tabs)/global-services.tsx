
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors, commonStyles } from "@/styles/commonStyles";

interface Service {
  title: string;
  icon: string;
  description: string;
  color: string;
}

export default function GlobalServicesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();

  const services: Service[] = [
    {
      title: t.globalServices.maritime,
      icon: "directions_boat",
      description: "Ocean freight, vessel chartering, and maritime operations",
      color: colors.primary,
    },
    {
      title: t.globalServices.logistics,
      icon: "local_shipping",
      description: "End-to-end supply chain and transportation solutions",
      color: colors.secondary,
    },
    {
      title: t.globalServices.customs,
      icon: "gavel",
      description: "Customs clearance and regulatory compliance",
      color: colors.accent,
    },
    {
      title: t.globalServices.warehousing,
      icon: "warehouse",
      description: "Storage, distribution, and inventory management",
      color: colors.primary,
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
          {t.globalServices.title}
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
            ios_icon_name="globe"
            android_material_icon_name="public"
            size={80}
            color={colors.primary}
          />
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            {t.globalServices.subtitle}
          </Text>
          <Text style={styles.description}>
            Comprehensive maritime and logistics solutions for businesses worldwide
          </Text>
        </View>

        <View style={styles.servicesContainer}>
          {services.map((service, index) => (
            <React.Fragment key={index}>
              <View style={[styles.serviceCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.serviceIconContainer, { backgroundColor: service.color }]}>
                  <IconSymbol
                    ios_icon_name={service.icon}
                    android_material_icon_name={service.icon as any}
                    size={40}
                    color="#ffffff"
                  />
                </View>
                <Text style={[styles.serviceTitle, { color: theme.colors.text }]}>
                  {service.title}
                </Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            onPress={() => console.log('Contact us pressed')}
          >
            <Text style={styles.ctaButtonText}>Contact Us</Text>
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
  servicesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  serviceCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
