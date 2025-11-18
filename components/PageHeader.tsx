
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { colors } from "@/styles/commonStyles";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  showQuoteButton?: boolean;
  showLanguageSwitcher?: boolean;
}

export function PageHeader({ 
  title, 
  showBackButton = true, 
  showQuoteButton = true,
  showLanguageSwitcher = true 
}: PageHeaderProps) {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
      <View style={styles.topRow}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
        
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        
        {showQuoteButton ? (
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
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>
      
      {showLanguageSwitcher && (
        <View style={styles.languageSwitcherRow}>
          <LanguageSwitcher />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  headerButton: {
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
  languageSwitcherRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
