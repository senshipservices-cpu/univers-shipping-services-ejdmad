
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";

interface PageHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showHelpButton?: boolean;
  showLogo?: boolean;
}

export function PageHeader({ 
  title, 
  showBackButton = true, 
  showHelpButton = true,
  showLogo = true 
}: PageHeaderProps) {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[
      styles.header, 
      { backgroundColor: colors.primary },
      Platform.OS === 'android' && { paddingTop: 48 }
    ]}>
      <View style={styles.headerContent}>
        {/* Left: Back Button */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow_back"
                size={28}
                color={colors.secondary}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
        
        {/* Center: Logo or Title */}
        <View style={styles.centerSection}>
          {showLogo ? (
            <Logo width={120} showText={false} />
          ) : title ? (
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </View>
        
        {/* Right: Help Button */}
        <View style={styles.rightSection}>
          {showHelpButton ? (
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => router.push({
                pathname: '/(tabs)/contact',
                params: { subject: 'Demande d\'aide' }
              })}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="questionmark.circle.fill"
                android_material_icon_name="help"
                size={28}
                color={colors.secondary}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary,
    boxShadow: '0px 2px 8px rgba(0, 44, 95, 0.15)',
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerButton: {
    padding: 4,
  },
  helpButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.pureWhite,
    textAlign: 'center',
  },
});
