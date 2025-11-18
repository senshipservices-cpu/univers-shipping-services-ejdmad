
/**
 * Empty State Component
 * Reusable component for displaying empty states
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useTheme } from '@react-navigation/native';

interface EmptyStateProps {
  icon?: {
    ios: string;
    android: string;
  };
  title: string;
  message?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({ icon, title, message, action, style }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
      {icon && (
        <IconSymbol
          ios_icon_name={icon.ios}
          android_material_icon_name={icon.android}
          size={48}
          color={colors.textSecondary}
        />
      )}
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 8,
  },
});
