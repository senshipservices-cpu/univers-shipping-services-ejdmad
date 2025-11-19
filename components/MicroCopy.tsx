
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface MicroCopyProps {
  text: string;
  icon?: { ios: string; android: string };
  color?: string;
}

export function MicroCopy({ text, icon, color = colors.textSecondary }: MicroCopyProps) {
  return (
    <View style={styles.container}>
      {icon && (
        <IconSymbol
          ios_icon_name={icon.ios}
          android_material_icon_name={icon.android}
          size={14}
          color={color}
        />
      )}
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
});
