
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface EnvironmentSetupGuideProps {
  missingVariables: string[];
}

export default function EnvironmentSetupGuide({ missingVariables }: EnvironmentSetupGuideProps) {
  const openSupabaseDashboard = () => {
    Linking.openURL('https://supabase.com/dashboard/project/lnfsjpuffrcyenuuoxxk/settings/api');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>⚠️ Configuration Required</Text>
        
        <Text style={styles.description}>
          The following environment variables are missing or invalid:
        </Text>
        
        <View style={styles.variablesList}>
          {missingVariables.map((variable, index) => (
            <Text key={index} style={styles.variableItem}>• {variable}</Text>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Setup Instructions</Text>
          
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1.</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Open Natively Environment Variables</Text>
              <Text style={styles.stepDescription}>
                Go to the Environment Variables tab in Natively
              </Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2.</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Add Required Variables</Text>
              <Text style={styles.stepDescription}>
                Click "Add Variable" and enter the following:
              </Text>
            </View>
          </View>
          
          {missingVariables.includes('EXPO_PUBLIC_SUPABASE_URL') && (
            <View style={styles.variableCard}>
              <Text style={styles.variableName}>EXPO_PUBLIC_SUPABASE_URL</Text>
              <Text style={styles.variableValue}>https://lnfsjpuffrcyenuuoxxk.supabase.co</Text>
            </View>
          )}
          
          {missingVariables.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY') && (
            <View style={styles.variableCard}>
              <Text style={styles.variableName}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
              <Text style={styles.variableValue}>Your Supabase anonymous key</Text>
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={openSupabaseDashboard}
              >
                <Text style={styles.linkButtonText}>
                  Get key from Supabase Dashboard →
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3.</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Save and Restart</Text>
              <Text style={styles.stepDescription}>
                Click "Save" and restart the app to apply changes
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            Check the .env.example file in the project root for detailed setup instructions.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    lineHeight: 24,
  },
  variablesList: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  variableItem: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 12,
    width: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  variableCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginLeft: 36,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  variableName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  variableValue: {
    fontSize: 13,
    color: colors.text,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 6,
  },
  linkButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  linkButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
