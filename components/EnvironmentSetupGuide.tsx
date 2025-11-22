
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useColors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';

/**
 * EnvironmentSetupGuide Component
 * Displays setup instructions when environment variables are not configured
 */
export default function EnvironmentSetupGuide() {
  const colors = useColors();
  const validation = appConfig.validateConfig();

  // Only show if there are errors
  if (validation.valid) {
    return null;
  }

  const openSupabaseDashboard = () => {
    Linking.openURL('https://supabase.com/dashboard/project/lnfsjpuffrcyenuuoxxk/settings/api');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
      paddingTop: 40,
    },
    headerIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    errorItem: {
      flexDirection: 'row',
      marginBottom: 8,
      backgroundColor: colors.error + '10',
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.error,
    },
    errorBullet: {
      color: colors.error,
      marginRight: 8,
      fontWeight: 'bold',
    },
    errorText: {
      flex: 1,
      color: colors.error,
      fontSize: 14,
    },
    warningItem: {
      flexDirection: 'row',
      marginBottom: 8,
      backgroundColor: '#FFA50010',
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#FFA500',
    },
    warningBullet: {
      color: '#FFA500',
      marginRight: 8,
      fontWeight: 'bold',
    },
    warningText: {
      flex: 1,
      color: '#FFA500',
      fontSize: 14,
    },
    instructionCard: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    instructionStep: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    instructionText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },
    linkButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
    linkButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    codeBlock: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    codeText: {
      fontFamily: 'monospace',
      fontSize: 13,
      color: colors.text,
      marginBottom: 4,
    },
    stepList: {
      marginTop: 8,
      marginBottom: 12,
    },
    stepItem: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 6,
      paddingLeft: 8,
    },
    variableCard: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    variableName: {
      fontFamily: 'monospace',
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 4,
    },
    variableValue: {
      fontFamily: 'monospace',
      fontSize: 12,
      color: colors.textSecondary,
    },
    helpSection: {
      backgroundColor: colors.primary + '10',
      padding: 16,
      borderRadius: 12,
      marginTop: 24,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    helpTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 8,
    },
    helpText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>⚙️</Text>
          <Text style={styles.headerTitle}>Configuration Required</Text>
          <Text style={styles.headerSubtitle}>
            Please set up your environment variables to continue
          </Text>
        </View>

        {/* Errors */}
        {validation.errors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❌ Required Configuration</Text>
            {validation.errors.map((error, index) => (
              <View key={index} style={styles.errorItem}>
                <Text style={styles.errorBullet}>•</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Setup Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Setup Instructions</Text>
          
          <View style={styles.instructionCard}>
            <Text style={styles.instructionStep}>Step 1: Get Your Supabase Credentials</Text>
            <TouchableOpacity style={styles.linkButton} onPress={openSupabaseDashboard}>
              <Text style={styles.linkButtonText}>Open Supabase Dashboard →</Text>
            </TouchableOpacity>
            <Text style={styles.instructionText}>
              Navigate to: Project Settings → API
            </Text>
            <Text style={styles.instructionText}>
              Copy the following values:
            </Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>• Project URL</Text>
              <Text style={styles.codeText}>• anon public key</Text>
            </View>
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionStep}>Step 2: Add to Natively Environment Variables</Text>
            <Text style={styles.instructionText}>
              In your Natively project:
            </Text>
            <View style={styles.stepList}>
              <Text style={styles.stepItem}>1. Go to Project Settings</Text>
              <Text style={styles.stepItem}>2. Navigate to Environment Variables tab</Text>
              <Text style={styles.stepItem}>3. Click "Add Variable"</Text>
              <Text style={styles.stepItem}>4. Add the following variables:</Text>
            </View>
            
            <View style={styles.variableCard}>
              <Text style={styles.variableName}>EXPO_PUBLIC_SUPABASE_URL</Text>
              <Text style={styles.variableValue}>https://lnfsjpuffrcyenuuoxxk.supabase.co</Text>
            </View>

            <View style={styles.variableCard}>
              <Text style={styles.variableName}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
              <Text style={styles.variableValue}>Your anon public key from Supabase</Text>
            </View>
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionStep}>Step 3: Restart the App</Text>
            <Text style={styles.instructionText}>
              After adding the environment variables:
            </Text>
            <View style={styles.stepList}>
              <Text style={styles.stepItem}>1. Save the variables</Text>
              <Text style={styles.stepItem}>2. Stop the development server</Text>
              <Text style={styles.stepItem}>3. Restart the app</Text>
            </View>
          </View>
        </View>

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️  Optional Configuration</Text>
            {validation.warnings.map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <Text style={styles.warningBullet}>•</Text>
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Help */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            Check the documentation in the docs/ folder for detailed setup instructions.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
