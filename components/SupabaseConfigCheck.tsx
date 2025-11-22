
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
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
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Check configuration on mount and periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount(prev => prev + 1);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // If Supabase is properly configured, render children normally
  if (isSupabaseConfigured) {
    return <>{children}</>;
  }

  const handleRefresh = () => {
    Alert.alert(
      '🔄 Rafraîchissement',
      'Pour que les variables soient chargées, vous devez :\n\n1. ARRÊTER l\'application (bouton STOP)\n2. Attendre 10 secondes\n3. REDÉMARRER l\'application (bouton START)\n\nUn simple rafraîchissement ne suffit pas !',
      [{ text: 'OK' }]
    );
  };

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

      {/* CRITICAL: Hot Reload Warning - Most Important Section */}
      <View style={[styles.section, styles.criticalSection]}>
        <Text style={styles.criticalIcon}>🔥</Text>
        <Text style={styles.criticalTitle}>IMPORTANT : Procédure de Configuration</Text>
        <Text style={styles.criticalText}>
          L&apos;écran d&apos;erreur que vous voyez après &quot;Sauvegarder&quot; est NORMAL !
          {'\n\n'}
          C&apos;est le <Text style={styles.bold}>hot reload</Text> qui cause ce problème.
          {'\n\n'}
          <Text style={styles.bold}>✅ PROCÉDURE CORRECTE :</Text>
        </Text>
        
        <View style={styles.procedureBox}>
          <View style={styles.procedureStep}>
            <Text style={styles.procedureNumber}>1️⃣</Text>
            <View style={styles.procedureContent}>
              <Text style={styles.procedureText}>
                <Text style={styles.bold}>ARRÊTEZ</Text> l&apos;application
              </Text>
              <Text style={styles.procedureHint}>
                Cliquez sur le bouton STOP dans Natively (en haut à droite)
              </Text>
            </View>
          </View>
          
          <View style={styles.procedureStep}>
            <Text style={styles.procedureNumber}>2️⃣</Text>
            <View style={styles.procedureContent}>
              <Text style={styles.procedureText}>
                Allez dans Settings ⚙️ → Environment Variables
              </Text>
              <Text style={styles.procedureHint}>
                Dans le menu de Natively
              </Text>
            </View>
          </View>
          
          <View style={styles.procedureStep}>
            <Text style={styles.procedureNumber}>3️⃣</Text>
            <View style={styles.procedureContent}>
              <Text style={styles.procedureText}>
                Ajoutez vos variables (voir ci-dessous)
              </Text>
              <Text style={styles.procedureHint}>
                EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY
              </Text>
            </View>
          </View>
          
          <View style={styles.procedureStep}>
            <Text style={styles.procedureNumber}>4️⃣</Text>
            <View style={styles.procedureContent}>
              <Text style={styles.procedureText}>
                Cliquez sur <Text style={styles.bold}>SAVE</Text>
              </Text>
              <Text style={styles.procedureHint}>
                L&apos;écran d&apos;erreur qui apparaît est NORMAL
              </Text>
            </View>
          </View>
          
          <View style={styles.procedureStep}>
            <Text style={styles.procedureNumber}>5️⃣</Text>
            <View style={styles.procedureContent}>
              <Text style={styles.procedureText}>
                Attendez <Text style={styles.bold}>10 secondes</Text>
              </Text>
              <Text style={styles.procedureHint}>
                Laissez le temps au système de sauvegarder
              </Text>
            </View>
          </View>
          
          <View style={styles.procedureStep}>
            <Text style={styles.procedureNumber}>6️⃣</Text>
            <View style={styles.procedureContent}>
              <Text style={styles.procedureText}>
                Cliquez sur <Text style={styles.bold}>START</Text> pour redémarrer
              </Text>
              <Text style={styles.procedureHint}>
                Les variables seront maintenant chargées !
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningBoxText}>
            <Text style={styles.bold}>ATTENTION :</Text>
            {'\n\n'}
            • <Text style={styles.bold}>NE PAS</Text> sauvegarder pendant que l&apos;app tourne
            {'\n'}
            • <Text style={styles.bold}>TOUJOURS</Text> arrêter l&apos;app AVANT de sauvegarder
            {'\n'}
            • <Text style={styles.bold}>ATTENDRE</Text> 10 secondes après la sauvegarde
            {'\n'}
            • <Text style={styles.bold}>REDÉMARRER</Text> complètement l&apos;application
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>
            🔄 Pourquoi je vois toujours cet écran ?
          </Text>
        </TouchableOpacity>
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

      {/* Important Note about Vault vs Natively */}
      <View style={[styles.section, styles.importantNote]}>
        <Text style={styles.importantTitle}>📌 Supabase Vault vs Natively Variables</Text>
        <Text style={styles.importantText}>
          <Text style={styles.bold}>Supabase Vault</Text> = Pour Edge Functions (code serveur)
          {'\n\n'}
          <Text style={styles.bold}>Natively Variables</Text> = Pour l&apos;app React Native (code client)
          {'\n\n'}
          Vous avez besoin des <Text style={styles.bold}>DEUX</Text> !
          {'\n\n'}
          Si vous avez déjà ajouté les variables dans Supabase Vault, c&apos;est parfait pour les Edge Functions.
          Maintenant, vous devez <Text style={styles.bold}>AUSSI</Text> les ajouter dans Natively.
        </Text>
      </View>

      {/* Setup Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Variables à Ajouter dans Natively</Text>
        
        <View style={styles.variableCard}>
          <Text style={styles.variableTitle}>Variable 1 :</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeLabel}>Nom :</Text>
            <Text style={styles.codeText}>EXPO_PUBLIC_SUPABASE_URL</Text>
            <Text style={styles.codeLabel}>Valeur :</Text>
            <Text style={styles.codeValue}>https://lnfsjpuffrcyenuuoxxk.supabase.co</Text>
          </View>
        </View>

        <View style={styles.variableCard}>
          <Text style={styles.variableTitle}>Variable 2 :</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeLabel}>Nom :</Text>
            <Text style={styles.codeText}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
            <Text style={styles.codeLabel}>Valeur :</Text>
            <Text style={styles.codeValue}>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</Text>
            <Text style={styles.codeHint}>(Copiez la clé complète depuis Supabase)</Text>
          </View>
        </View>
      </View>

      {/* Where to find values */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Où Trouver Ces Valeurs ?</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Dans Supabase Dashboard :</Text>
          <Text style={styles.infoText}>
            1. Allez sur votre projet Supabase{'\n'}
            2. Cliquez sur Settings (⚙️){'\n'}
            3. Allez dans API{'\n'}
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
        <Text style={styles.sectionTitle}>📊 État Actuel (Refresh #{refreshCount})</Text>
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
        
        <View style={styles.statusNote}>
          <Text style={styles.statusNoteText}>
            ℹ️ Si les variables sont toujours &quot;Non défini&quot; après avoir suivi la procédure,
            cela signifie que l&apos;application n&apos;a pas été redémarrée correctement.
            {'\n\n'}
            Assurez-vous de :
            {'\n'}
            1. Cliquer sur STOP (pas juste fermer l&apos;app)
            {'\n'}
            2. Attendre que l&apos;app soit complètement arrêtée
            {'\n'}
            3. Cliquer sur START pour un nouveau démarrage
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.debugToggle}
          onPress={() => setShowDebugInfo(!showDebugInfo)}
        >
          <Text style={styles.debugToggleText}>
            {showDebugInfo ? '▼' : '▶'} Informations de Débogage Avancées
          </Text>
        </TouchableOpacity>

        {showDebugInfo && (
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>🔧 Debug Info</Text>
            <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
            <Text style={styles.debugText}>
              Constants.expoConfig?.extra: {Constants.expoConfig?.extra ? 'Disponible' : 'Non disponible'}
            </Text>
            {Constants.expoConfig?.extra && (
              <>
                <Text style={styles.debugText}>
                  Variables trouvées: {Object.keys(Constants.expoConfig.extra).length}
                </Text>
                <Text style={styles.debugText}>
                  Noms: {Object.keys(Constants.expoConfig.extra).join(', ')}
                </Text>
                <Text style={styles.debugText}>
                  Valeurs (premières lettres):
                </Text>
                {Object.entries(Constants.expoConfig.extra).map(([key, value]) => (
                  <Text key={key} style={styles.debugText}>
                    • {key}: {typeof value === 'string' ? value.substring(0, 20) + '...' : typeof value}
                  </Text>
                ))}
              </>
            )}
            {!Constants.expoConfig?.extra && (
              <Text style={styles.debugText}>
                ⚠️ Constants.expoConfig.extra n&apos;est pas disponible.
                {'\n'}
                Cela signifie que les variables d&apos;environnement ne sont pas chargées.
                {'\n'}
                Suivez la procédure ci-dessus pour les ajouter.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Troubleshooting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Questions Fréquentes</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>❓ Pourquoi l&apos;écran d&apos;erreur apparaît quand je clique sur Save ?</Text>
          <Text style={styles.faqAnswer}>
            C&apos;est le <Text style={styles.bold}>hot reload</Text> qui essaie de recharger l&apos;app immédiatement.
            Les nouvelles variables ne sont pas encore disponibles dans le processus en cours.
            {'\n\n'}
            <Text style={styles.bold}>Solution :</Text> Arrêtez l&apos;app AVANT de sauvegarder, puis redémarrez après.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>❓ J&apos;ai suivi la procédure mais ça ne marche toujours pas</Text>
          <Text style={styles.faqAnswer}>
            Vérifiez :{'\n'}
            • Les noms sont EXACTS (avec EXPO_PUBLIC_){'\n'}
            • Pas d&apos;espaces avant/après les valeurs{'\n'}
            • Vous avez bien attendu 10 secondes entre Stop et Start{'\n'}
            • Vous avez fait un redémarrage COMPLET (pas juste un reload){'\n'}
            • Regardez les logs ci-dessus pour voir si les variables sont détectées{'\n'}
            • Vérifiez que vous êtes dans Settings → Environment Variables (pas dans Supabase Vault)
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>❓ Où se trouve le bouton STOP dans Natively ?</Text>
          <Text style={styles.faqAnswer}>
            Le bouton STOP se trouve en haut à droite de l&apos;interface Natively, à côté du bouton de rafraîchissement.
            {'\n\n'}
            Si vous ne le voyez pas, essayez de :
            {'\n'}
            • Regarder dans la barre d&apos;outils en haut
            {'\n'}
            • Chercher un bouton rouge ou un icône d&apos;arrêt
            {'\n'}
            • Utiliser le menu principal de Natively
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>❓ Quelle est la différence entre Vault et Natively ?</Text>
          <Text style={styles.faqAnswer}>
            • <Text style={styles.bold}>Supabase Vault</Text> : Variables pour Edge Functions (serveur){'\n'}
            • <Text style={styles.bold}>Natively Variables</Text> : Variables pour React Native (client){'\n'}
            {'\n'}
            Les deux sont nécessaires pour une application complète.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>❓ Comment savoir si ça a marché ?</Text>
          <Text style={styles.faqAnswer}>
            Après le redémarrage, vous devriez voir dans les logs :{'\n'}
            {'\n'}
            <Text style={styles.successLog}>✓ Supabase client initialized successfully</Text>
            {'\n\n'}
            Et cet écran de configuration disparaîtra automatiquement ! 🎉
            {'\n\n'}
            Dans la section &quot;État Actuel&quot; ci-dessus, les deux variables devraient afficher &quot;✓ Défini&quot;.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>❓ Je vois toujours cet écran après avoir tout fait</Text>
          <Text style={styles.faqAnswer}>
            Si vous voyez toujours cet écran après avoir suivi TOUTES les étapes :
            {'\n\n'}
            1. Vérifiez la section &quot;État Actuel&quot; ci-dessus
            {'\n'}
            2. Si les variables sont &quot;Non défini&quot;, elles n&apos;ont pas été chargées
            {'\n'}
            3. Assurez-vous d&apos;avoir cliqué sur STOP (pas juste fermé l&apos;app)
            {'\n'}
            4. Attendez 10-15 secondes après STOP
            {'\n'}
            5. Cliquez sur START pour un redémarrage complet
            {'\n'}
            6. Si ça ne marche toujours pas, essayez de redémarrer Natively complètement
          </Text>
        </View>
      </View>

      {/* Help Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Besoin d&apos;Aide ?</Text>
        <Text style={styles.helpText}>
          Si vous avez des questions, consultez la documentation :
        </Text>
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => Linking.openURL('https://docs.supabase.com/guides/getting-started')}
        >
          <Text style={styles.linkButtonText}>📚 Documentation Supabase</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerEmoji}>🎯</Text>
        <Text style={styles.footerText}>
          Suivez la procédure ci-dessus et tout fonctionnera parfaitement !
          {'\n\n'}
          <Text style={styles.bold}>Rappel :</Text> STOP → Sauvegarder → Attendre → START
        </Text>
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
  criticalSection: {
    backgroundColor: '#fef2f2',
    borderWidth: 3,
    borderColor: '#dc2626',
  },
  criticalIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  criticalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 12,
    textAlign: 'center',
  },
  criticalText: {
    fontSize: 15,
    color: '#991b1b',
    lineHeight: 24,
    marginBottom: 16,
  },
  procedureBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  procedureStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fee2e2',
  },
  procedureNumber: {
    fontSize: 24,
    marginRight: 12,
    width: 40,
  },
  procedureContent: {
    flex: 1,
  },
  procedureText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  procedureHint: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    marginBottom: 12,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningBoxText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  importantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  importantText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  variableCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  variableTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
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
    marginBottom: 16,
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
  statusNote: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  statusNoteText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  debugToggle: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  debugToggleText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  debugBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
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
  faqItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  successLog: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    color: '#16a34a',
    fontWeight: 'bold',
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 8,
  },
  footerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
