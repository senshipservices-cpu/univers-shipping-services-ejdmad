
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface ConfidenceBlock {
  icon: { ios: string; android: string };
  title: string;
  description: string;
  color: string;
}

interface ConfidenceBannerProps {
  blocks: ConfidenceBlock[];
}

export function ConfidenceBanner({ blocks }: ConfidenceBannerProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.highlight }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {blocks.map((block, index) => (
          <React.Fragment key={index}>
            <View style={[styles.block, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <View style={[styles.iconContainer, { backgroundColor: block.color + '20' }]}>
                <IconSymbol
                  ios_icon_name={block.icon.ios}
                  android_material_icon_name={block.icon.android}
                  size={32}
                  color={block.color}
                />
              </View>
              <Text style={[styles.blockTitle, { color: theme.colors.text }]}>
                {block.title}
              </Text>
              <Text style={[styles.blockDescription, { color: colors.textSecondary }]}>
                {block.description}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    marginBottom: 32,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  block: {
    width: 280,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  blockDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
