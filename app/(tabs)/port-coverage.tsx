
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";

interface Port {
  name: string;
  country: string;
  code: string;
  region: string;
}

export default function PortCoverageScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const ports: Port[] = [
    { name: "Port of Shanghai", country: "China", code: "CNSHA", region: "Asia" },
    { name: "Port of Singapore", country: "Singapore", code: "SGSIN", region: "Asia" },
    { name: "Port of Rotterdam", country: "Netherlands", code: "NLRTM", region: "Europe" },
    { name: "Port of Los Angeles", country: "USA", code: "USLAX", region: "North America" },
    { name: "Port of Hamburg", country: "Germany", code: "DEHAM", region: "Europe" },
    { name: "Port of Dubai", country: "UAE", code: "AEDXB", region: "Middle East" },
    { name: "Port of Hong Kong", country: "Hong Kong", code: "HKHKG", region: "Asia" },
    { name: "Port of Antwerp", country: "Belgium", code: "BEANR", region: "Europe" },
  ];

  const filteredPorts = ports.filter(
    (port) =>
      port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {t.portCoverage.title}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol
          ios_icon_name="magnifyingglass"
          android_material_icon_name="search"
          size={20}
          color={colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t.portCoverage.searchPlaceholder}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <IconSymbol
              ios_icon_name="xmark.circle.fill"
              android_material_icon_name="cancel"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.statNumber}>150+</Text>
            <Text style={styles.statLabel}>Ports Worldwide</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
        </View>

        <View style={styles.portsContainer}>
          {filteredPorts.map((port, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[styles.portCard, { backgroundColor: theme.colors.card }]}
                onPress={() => console.log('Port selected:', port.name)}
              >
                <View style={styles.portIconContainer}>
                  <IconSymbol
                    ios_icon_name="anchor"
                    android_material_icon_name="anchor"
                    size={28}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.portInfo}>
                  <Text style={[styles.portName, { color: theme.colors.text }]}>
                    {port.name}
                  </Text>
                  <Text style={styles.portDetails}>
                    {port.country} • {port.code}
                  </Text>
                  <View style={styles.regionBadge}>
                    <Text style={styles.regionText}>{port.region}</Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron_right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  portsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  portCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  portIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portInfo: {
    flex: 1,
  },
  portName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  portDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  regionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.highlight,
    borderRadius: 6,
  },
  regionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
