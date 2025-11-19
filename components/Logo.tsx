
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface LogoProps {
  width?: number;
  showText?: boolean;
  textSize?: 'small' | 'medium' | 'large';
}

export function Logo({ width = 120, showText = false, textSize = 'medium' }: LogoProps) {
  // Note: The logo image should be placed at assets/images/uss-logo.png
  // For now, we'll show a placeholder with the company initials
  const logoSource = require('@/assets/images/uss-logo.png');
  
  const textSizes = {
    small: { title: 14, subtitle: 10 },
    medium: { title: 18, subtitle: 12 },
    large: { title: 24, subtitle: 14 },
  };

  return (
    <View style={styles.container}>
      {/* Logo Image - Replace with actual logo when available */}
      <View style={[styles.logoPlaceholder, { width, height: width * 0.6 }]}>
        <Text style={[styles.logoText, { fontSize: width * 0.25 }]}>USS</Text>
      </View>
      
      {/* Optional Text Below Logo */}
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.companyName, { fontSize: textSizes[textSize].title }]}>
            Universal Shipping Services
          </Text>
          <Text style={[styles.tagline, { fontSize: textSizes[textSize].subtitle }]}>
            Global Maritime & Logistics Solutions
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(0, 44, 95, 0.2)',
    elevation: 4,
  },
  logoText: {
    color: colors.secondary,
    fontWeight: '900',
    letterSpacing: 2,
  },
  textContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  companyName: {
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
