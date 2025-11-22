
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
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

      {/* Hot Reload Warning */}
      <View style={[styles.section, styles.hotReloadWarning]}>
        <Text style={styles.hotReloadTitle}>🔥 Problème de Hot Reload</Text>
        <Text style={styles.hotReloadText}>
          L&apos;écran d&apos;erreur que vous voyez apparaît souvent lors du <Text style={styles.bold}>hot reload</Text> (rechargement automatique).
          {'\n\n'}
          Cela ne signifie PAS que vos variables ne sont pas configurées !
          {'\n\n'}
          <Text style={styles.bold}>Solution :</Text> Après avoir sauvegardé les variables, vous DEVEZ faire un <Text style={styles.bold}>redémarrage complet</Text> de l&apos;application.
        </Text>
      </View>

      {/* Important Note */}
      <View style={[styles.section, styles.importantNote]}>
        <Text style={styles.importantTitle}>📌 Important - Lisez Attentivement</Text>
        <Text style={styles.importantText}>
          Vous avez ajouté les variables dans <Text style={styles.bold}>Supabase Vault</Text> ? 
          C&apos;est parfait pour les <Text style={styles.bold}>Edge Functions</Text> (code serveur) ! 
          {'\n\n'}
          Mais votre <Text style={styles.bold}>application React Native</Text> ne peut pas accéder au Vault. 
          {'\n\n'}
          Vous devez <Text style={styles.bold}>AUSSI</Text> ajouter ces variables dans <Text style={styles.bold}>Natively</Text>.
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
            <Text style={styles.stepTitle}>Ajoutez ces DEUX variables :</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeLabel}>Nom de la variable :</Text>
              <Text style={styles.codeText}>EXPO_PUBLIC_SUPABASE_URL</Text>
              <Text style={styles.codeLabel}>Valeur :</Text>
              <Text style={styles.codeValue}>https://lnfsjpuffrcyenuuoxxk.supabase.co</Text>
            </View>
            <View style={styles.codeBlock}>
              <Text style={styles.codeLabel}>Nom de la variable :</Text>
              <Text style={styles.codeText}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
              <Text style={styles.codeLabel}>Valeur :</Text>
              <Text style={styles.codeValue}>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</Text>
              <Text style={styles.codeHint}>(Copiez la clé complète depuis Supabase)</Text>
            </View>
          </View>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>4.</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>⚠️ IMPORTANT : Redémarrage Complet</Text>
            <Text style={[styles.stepText, styles.criticalText]}>
              Après avoir ajouté les variables :{'\n'}
              {'\n'}
              1. Cliquez sur <Text style={styles.bold}>STOP</Text> (arrêter l&apos;application){'\n'}
              2. Attendez <Text style={styles.bold}>10 secondes complètes</Text>{'\n'}
              3. Cliquez sur <Text style={styles.bold}>START</Text> (redémarrer){'\n'}
              {'\n'}
              ⚠️ Ne cliquez PAS sur &quot;Save&quot; pendant que l&apos;app tourne !{'\n'}
              ⚠️ Le hot reload ne suffit PAS - il faut un redémarrage complet !
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
          onPress={() => Linking.openURL('https://supabase.com/dashboard/project/lnfsjpuffrcyenuuoxxk/settings/api')}
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
        
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>🔧 Informations de Débogage</Text>
          <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
          <Text style={styles.debugText}>
            Constants.expoConfig?.extra: {Constants.expoConfig?.extra ? 'Disponible' : 'Non disponible'}
          </Text>
          {Constants.expoConfig?.extra && (
            <Text style={styles.debugText}>
              Variables trouvées: {Object.keys(Constants.expoConfig.extra).join(', ')}
            </Text>
          )}
        </View>
      </View>

      {/* Troubleshooting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Dépannage</Text>
        
        <View style={styles.troubleshootItem}>
          <Text style={styles.troubleshootTitle}>❓ L&apos;écran d&apos;erreur apparaît quand je clique sur Save</Text>
          <Text style={styles.troubleshootText}>
            C&apos;est NORMAL ! C&apos;est le hot reload qui cause ce problème.{'\n'}
            {'\n'}
            <Text style={styles.bold}>Solution :</Text>{'\n'}
            • N&apos;essayez PAS de sauvegarder pendant que l&apos;app tourne{'\n'}
            • Arrêtez l&apos;app AVANT de sauvegarder les variables{'\n'}
            • Sauvegardez les variables{'\n'}
            • Attendez 10 secondes{'\n'}
            • Redémarrez l&apos;app
          </Text>
        </View>

        <View style={styles.troubleshootItem}>
          <Text style={styles.troubleshootTitle}>❓ J&apos;ai ajouté les variables mais ça ne marche pas</Text>
          <Text style={styles.troubleshootText}>
            • Vérifiez que vous avez bien utilisé les noms EXACTS :{'\n'}
            {' '} EXPO_PUBLIC_SUPABASE_URL{'\n'}
            {' '} EXPO_PUBLIC_SUPABASE_ANON_KEY{'\n'}
            • Faites un redémarrage COMPLET (pas juste un reload){'\n'}
            • Attendez 10 secondes entre Stop et Start{'\n'}
            • Vérifiez qu&apos;il n&apos;y a pas d&apos;espaces avant/après les valeurs
          </Text>
        </View>

        <View style={styles.troubleshootItem}>
          <Text style={styles.troubleshootTitle}>❓ Différence entre Supabase Vault et Natively ?</Text>
          <Text style={styles.troubleshootText}>
            • <Text style={styles.bold}>Supabase Vault</Text> : Pour Edge Functions (serveur){'\n'}
            • <Text style={styles.bold}>Natively Variables</Text> : Pour l&apos;app React Native (client){'\n'}
            • Vous avez besoin des DEUX pour que tout fonctionne
          </Text>
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
  hotReloadWarning: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  hotReloadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 8,
  },
  hotReloadText: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 22,
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
    lineHeight: 22,
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
  criticalText: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    color: '#92400e',
    fontWeight: '500',
  },
  codeBlock: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  codeLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  codeValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#666',
  },
  codeHint: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusValue: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  statusSuccess: {
    color: '#10b981',
  },
  statusError: {
    color: '#dc2626',
  },
  debugBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 11,
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
  troubleshootItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  troubleshootTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  troubleshootText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
});
