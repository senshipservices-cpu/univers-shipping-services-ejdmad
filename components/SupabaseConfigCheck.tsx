
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { isSupabaseConfigured, supabaseConfigErrors, supabaseConfigWarnings } from '@/app/integrations/supabase/client';
import appConfig from '@/config/appConfig';

/**
 * SupabaseConfigCheck Component
 * 
 * Displays the current Supabase configuration status and provides
 * helpful guidance if configuration is missing or invalid.
 */
export default function SupabaseConfigCheck({ children }: { children: React.ReactNode }) {
  // If Supabase is properly configured, render children normally
  if (isSupabaseConfigured) {
    return <>{children}</>;
  }

  // Otherwise, show configuration guide
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.emoji}>⚙️</Text>
        <Text style={styles.title}>Configuration Requise</Text>
        <Text style={styles.subtitle}>
          Votre application nécessite une configuration Supabase
        </Text>
      </View>

      {/* Errors Section */}
      {supabaseConfigErrors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❌ Erreurs de Configuration</Text>
          {supabaseConfigErrors.map((error, index) => (
            <View key={index} style={styles.errorItem}>
              <Text style={styles.errorBullet}>•</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Warnings Section */}
      {supabaseConfigWarnings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Avertissements</Text>
          {supabaseConfigWarnings.map((warning, index) => (
            <View key={index} style={styles.warningItem}>
              <Text style={styles.warningBullet}>•</Text>
              <Text style={styles.warningText}>{warning}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Important Note */}
      <View style={[styles.section, styles.importantNote]}>
        <Text style={styles.importantTitle}>📌 Important</Text>
        <Text style={styles.importantText}>
          Vous avez ajouté les variables dans <Text style={styles.bold}>Supabase Vault</Text>, 
          mais ces variables sont uniquement pour les <Text style={styles.bold}>Edge Functions</Text> (code serveur).
        </Text>
        <Text style={styles.importantText}>
          {'\n'}Pour votre application React Native, vous devez ajouter les variables dans 
          <Text style={styles.bold}> Natively</Text> ou dans votre <Text style={styles.bold}>environnement local</Text>.
        </Text>
      </View>

      {/* Setup Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Configuration dans Natively</Text>
        
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Ouvrez les Paramètres du Projet</Text>
            <Text style={styles.stepText}>
              Dans Natively, cliquez sur l&apos;icône ⚙️ (Settings) en haut à droite
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>2.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Allez dans &quot;Environment Variables&quot;</Text>
            <Text style={styles.stepText}>
              Trouvez la section des variables d&apos;environnement
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>3.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Ajoutez ces variables :</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>EXPO_PUBLIC_SUPABASE_URL</Text>
              <Text style={styles.codeValue}>
                {appConfig.env.SUPABASE_URL || 'https://votre-projet.supabase.co'}
              </Text>
            </View>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
              <Text style={styles.codeValue}>
                {appConfig.env.SUPABASE_ANON_KEY || 'votre-anon-key'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>4.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Redémarrez l&apos;application</Text>
            <Text style={styles.stepText}>
              Après avoir ajouté les variables, redémarrez l&apos;application pour que les changements prennent effet
            </Text>
          </View>
        </View>
      </View>

      {/* Where to find values */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Où trouver ces valeurs ?</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Dans Supabase Dashboard :</Text>
          <Text style={styles.infoText}>
            1. Allez sur votre projet Supabase{'\n'}
            2. Cliquez sur &quot;Settings&quot; (⚙️) dans la barre latérale{'\n'}
            3. Allez dans &quot;API&quot;{'\n'}
            4. Copiez :
          </Text>
          <Text style={styles.infoItem}>   • Project URL → EXPO_PUBLIC_SUPABASE_URL</Text>
          <Text style={styles.infoItem}>   • anon/public key → EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
        </View>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => Linking.openURL('https://supabase.com/dashboard/project/_/settings/api')}
        >
          <Text style={styles.linkButtonText}>📱 Ouvrir Supabase Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* Current Configuration Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 État Actuel</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>SUPABASE_URL:</Text>
            <Text style={[styles.statusValue, appConfig.env.SUPABASE_URL ? styles.statusSuccess : styles.statusError]}>
              {appConfig.env.SUPABASE_URL || '❌ Non défini'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>SUPABASE_ANON_KEY:</Text>
            <Text style={[styles.statusValue, appConfig.env.SUPABASE_ANON_KEY ? styles.statusSuccess : styles.statusError]}>
              {appConfig.env.SUPABASE_ANON_KEY ? '✓ Défini' : '❌ Non défini'}
            </Text>
          </View>
        </View>
      </View>

      {/* Help Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Besoin d&apos;aide ?</Text>
        <Text style={styles.helpText}>
          Si vous avez des questions, consultez la documentation ou contactez le support.
        </Text>
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => Linking.openURL('https://docs.supabase.com/guides/getting-started')}
        >
          <Text style={styles.linkButtonText}>📚 Documentation Supabase</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  errorItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  errorBullet: {
    color: '#dc2626',
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  errorText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 14,
    lineHeight: 20,
  },
  warningItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  warningBullet: {
    color: '#f59e0b',
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  warningText: {
    flex: 1,
    color: '#f59e0b',
    fontSize: 14,
    lineHeight: 20,
  },
  importantNote: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  importantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  importantText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginRight: 12,
    width: 30,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  codeValue: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  linkButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  statusGrid: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusLabel: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'monospace',
  },
  statusValue: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  statusSuccess: {
    color: '#10b981',
  },
  statusError: {
    color: '#dc2626',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
});
