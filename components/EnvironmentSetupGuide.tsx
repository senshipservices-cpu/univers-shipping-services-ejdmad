
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import appConfig from '@/config/appConfig';

/**
 * EnvironmentSetupGuide Component
 * 
 * A comprehensive visual guide for setting up environment variables in Natively.
 * This component is shown when Supabase configuration is missing.
 */
export default function EnvironmentSetupGuide() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Configuration Rapide</Text>
        <Text style={styles.subtitle}>
          Configurez votre application en 3 étapes simples
        </Text>
      </View>

      {/* Important Notice */}
      <View style={styles.noticeBox}>
        <Text style={styles.noticeIcon}>💡</Text>
        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>Vous avez ajouté les variables dans Supabase Vault ?</Text>
          <Text style={styles.noticeText}>
            C&apos;est parfait pour les Edge Functions ! Mais votre app React Native a besoin 
            des mêmes variables dans <Text style={styles.bold}>Natively Settings</Text>.
          </Text>
        </View>
      </View>

      {/* Step 1 */}
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepTitle}>Trouvez vos valeurs Supabase</Text>
        </View>
        
        <View style={styles.stepContent}>
          <Text style={styles.stepDescription}>
            Allez dans votre Supabase Dashboard pour copier les valeurs nécessaires :
          </Text>
          
          <View style={styles.instructionBox}>
            <Text style={styles.instructionStep}>1. Ouvrez Supabase Dashboard</Text>
            <Text style={styles.instructionStep}>2. Sélectionnez votre projet</Text>
            <Text style={styles.instructionStep}>3. Settings ⚙️ → API</Text>
            <Text style={styles.instructionStep}>4. Copiez les valeurs ci-dessous</Text>
          </View>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Linking.openURL('https://supabase.com/dashboard/project/lnfsjpuffrcyenuuoxxk/settings/api')}
          >
            <Text style={styles.actionButtonText}>🔗 Ouvrir Supabase Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Step 2 */}
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepTitle}>Ajoutez dans Natively</Text>
        </View>
        
        <View style={styles.stepContent}>
          <Text style={styles.stepDescription}>
            Dans Natively, ajoutez ces deux variables d&apos;environnement :
          </Text>
          
          <View style={styles.variableCard}>
            <View style={styles.variableHeader}>
              <Text style={styles.variableLabel}>Variable 1</Text>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>Requis</Text>
              </View>
            </View>
            <View style={styles.variableContent}>
              <Text style={styles.variableName}>EXPO_PUBLIC_SUPABASE_URL</Text>
              <Text style={styles.variableExample}>
                Exemple : https://lnfsjpuffrcyenuuoxxk.supabase.co
              </Text>
              <Text style={styles.variableNote}>
                📍 Trouvez dans : Supabase → Settings → API → Project URL
              </Text>
            </View>
          </View>

          <View style={styles.variableCard}>
            <View style={styles.variableHeader}>
              <Text style={styles.variableLabel}>Variable 2</Text>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>Requis</Text>
              </View>
            </View>
            <View style={styles.variableContent}>
              <Text style={styles.variableName}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
              <Text style={styles.variableExample}>
                Exemple : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
              </Text>
              <Text style={styles.variableNote}>
                📍 Trouvez dans : Supabase → Settings → API → anon/public
              </Text>
            </View>
          </View>

          <View style={styles.howToBox}>
            <Text style={styles.howToTitle}>Comment ajouter dans Natively :</Text>
            <Text style={styles.howToStep}>1. Cliquez sur ⚙️ Settings (en haut à droite)</Text>
            <Text style={styles.howToStep}>2. Allez dans &quot;Environment Variables&quot;</Text>
            <Text style={styles.howToStep}>3. Cliquez &quot;Add New Variable&quot;</Text>
            <Text style={styles.howToStep}>4. Collez le nom et la valeur</Text>
            <Text style={styles.howToStep}>5. Répétez pour la deuxième variable</Text>
          </View>
        </View>
      </View>

      {/* Step 3 */}
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepTitle}>Redémarrez l&apos;application</Text>
        </View>
        
        <View style={styles.stepContent}>
          <Text style={styles.stepDescription}>
            Après avoir ajouté les variables, redémarrez l&apos;application pour que les 
            changements prennent effet.
          </Text>
          
          <View style={styles.restartBox}>
            <Text style={styles.restartIcon}>🔄</Text>
            <Text style={styles.restartText}>
              Stop → Start dans Natively
            </Text>
          </View>

          <Text style={styles.verifyText}>
            ✅ Vous devriez voir dans les logs :{'\n'}
            <Text style={styles.successLog}>
              ✓ Supabase client initialized successfully
            </Text>
          </Text>
        </View>
      </View>

      {/* Current Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>📊 État Actuel de Configuration</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>SUPABASE_URL</Text>
          <View style={[styles.statusBadge, appConfig.env.SUPABASE_URL ? styles.statusSuccess : styles.statusError]}>
            <Text style={styles.statusBadgeText}>
              {appConfig.env.SUPABASE_URL ? '✓ Configuré' : '✗ Manquant'}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>SUPABASE_ANON_KEY</Text>
          <View style={[styles.statusBadge, appConfig.env.SUPABASE_ANON_KEY ? styles.statusSuccess : styles.statusError]}>
            <Text style={styles.statusBadgeText}>
              {appConfig.env.SUPABASE_ANON_KEY ? '✓ Configuré' : '✗ Manquant'}
            </Text>
          </View>
        </View>

        {appConfig.env.SUPABASE_URL && (
          <View style={styles.currentValueBox}>
            <Text style={styles.currentValueLabel}>URL actuelle :</Text>
            <Text style={styles.currentValueText}>{appConfig.env.SUPABASE_URL}</Text>
          </View>
        )}
      </View>

      {/* Help Section */}
      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>💬 Besoin d&apos;Aide ?</Text>
        <Text style={styles.helpText}>
          Si vous rencontrez des difficultés, consultez la documentation complète :
        </Text>
        
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => Linking.openURL('https://docs.supabase.com/guides/getting-started')}
        >
          <Text style={styles.helpButtonText}>📚 Documentation Supabase</Text>
        </TouchableOpacity>

        <Text style={styles.helpNote}>
          Ou consultez le fichier <Text style={styles.code}>docs/SUPABASE_VAULT_VS_ENV_VARS.md</Text> 
          {' '}pour comprendre la différence entre Supabase Vault et les variables d&apos;environnement.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Une fois configuré, cette page disparaîtra automatiquement 🎉
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noticeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6,
  },
  noticeText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3b82f6',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  stepTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepContent: {
    padding: 20,
  },
  stepDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  instructionBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  instructionStep: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  variableCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  variableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  variableLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requiredBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requiredText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  variableContent: {
    gap: 8,
  },
  variableName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  variableExample: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  variableNote: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
  },
  howToBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  howToTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  howToStep: {
    fontSize: 13,
    color: '#1e40af',
    marginBottom: 6,
    lineHeight: 18,
  },
  restartBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  restartIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  restartText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  verifyText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  successLog: {
    fontFamily: 'monospace',
    color: '#16a34a',
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statusLabel: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusSuccess: {
    backgroundColor: '#dcfce7',
  },
  statusError: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentValueBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  currentValueLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  currentValueText: {
    fontSize: 11,
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  helpCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  helpNote: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
