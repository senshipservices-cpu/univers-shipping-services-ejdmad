
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
  icon: {
    ios: string;
    android: string;
  };
  color: string;
}

interface HowItWorksSectionProps {
  title: string;
  subtitle?: string;
  steps: HowItWorksStep[];
}

export function HowItWorksSection({ title, subtitle, steps }: HowItWorksSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>
      
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
      
      <View style={styles.stepsList}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <View style={[styles.stepCard, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepIconContainer, { backgroundColor: step.color + '20' }]}>
                  <IconSymbol
                    ios_icon_name={step.icon.ios}
                    android_material_icon_name={step.icon.android}
                    size={32}
                    color={step.color}
                  />
                </View>
                <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
              </View>
              
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                {step.title}
              </Text>
              
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                {step.description}
              </Text>
              
              {index < steps.length - 1 && (
                <View style={styles.stepConnector}>
                  <IconSymbol
                    ios_icon_name="arrow.down"
                    android_material_icon_name="arrow_downward"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              )}
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  stepsList: {
    gap: 0,
  },
  stepCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    marginBottom: 16,
    position: 'relative',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  stepConnector: {
    position: 'absolute',
    bottom: -28,
    left: '50%',
    marginLeft: -12,
    zIndex: 10,
  },
});
