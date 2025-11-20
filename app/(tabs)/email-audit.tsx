
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';
import PageHeader from '@/components/PageHeader';
import { useRouter } from 'expo-router';

interface EmailStats {
  email_type: string;
  status: string;
  count: number;
}

interface WorkflowStatus {
  name: string;
  trigger: string;
  emailType: string;
  status: 'active' | 'inactive';
  tested: boolean;
}

export default function EmailAuditScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [emailStats, setEmailStats] = useState<EmailStats[]>([]);
  const [processing, setProcessing] = useState(false);

  const workflows: WorkflowStatus[] = [
    { name: 'Demande de devis', trigger: 'freight_quotes INSERT', emailType: 'quote_created', status: 'active', tested: true },
    { name: 'Devis envoyé (avec prix)', trigger: 'freight_quotes UPDATE → sent_to_client', emailType: 'quote_sent_to_client', status: 'active', tested: true },
    { name: 'Candidature agent', trigger: 'global_agents INSERT', emailType: 'agent_application_received', status: 'active', tested: true },
    { name: 'Agent validé', trigger: 'global_agents UPDATE → validated', emailType: 'agent_validated', status: 'active', tested: true },
    { name: 'Création de compte', trigger: 'clients INSERT', emailType: 'account_created', status: 'active', tested: true },
    { name: 'Abonnement activé', trigger: 'subscriptions UPDATE → is_active=true', emailType: 'subscription_activated', status: 'active', tested: true },
    { name: 'Abonnement expiré', trigger: 'subscriptions UPDATE → is_active=false', emailType: 'subscription_expired', status: 'active', tested: true },
    { name: 'Expédition créée', trigger: 'shipments INSERT', emailType: 'shipment_created', status: 'active', tested: true },
    { name: 'Statut expédition', trigger: 'shipments UPDATE → current_status', emailType: 'shipment_status_changed', status: 'active', tested: true },
  ];

  useEffect(() => {
    loadEmailStats();
  }, []);

  const loadEmailStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_notifications')
        .select('email_type, status');

      if (error) throw error;

      // Group by email_type and status
      const stats: { [key: string]: EmailStats } = {};
      data?.forEach((item) => {
        const key = `${item.email_type}-${item.status}`;
        if (!stats[key]) {
          stats[key] = {
            email_type: item.email_type,
            status: item.status,
            count: 0
          };
        }
        stats[key].count++;
      });

      setEmailStats(Object.values(stats));
    } catch (error) {
      console.error('Error loading email stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const processEmails = async () => {
    try {
      setProcessing(true);
      
      // Call the Edge Function to process pending emails
      const { data, error } = await supabase.functions.invoke('process-email-notifications');

      if (error) throw error;

      alert(`Emails traités: ${data.processed}\n\nVoir les logs pour plus de détails.`);
      
      // Reload stats
      await loadEmailStats();
    } catch (error) {
      console.error('Error processing emails:', error);
      alert('Erreur lors du traitement des emails. Voir les logs.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return '#00cc66';
      case 'pending': return '#ff9900';
      case 'failed': return '#cc0000';
      default: return colors.text;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return '✓';
      case 'pending': return '⏳';
      case 'failed': return '✗';
      default: return '?';
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Audit Emails & Workflows" showBack />
      
      <ScrollView style={styles.content}>
        {/* Configuration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📧 Configuration Email</Text>
          <View style={styles.card}>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Adresse d'expédition:</Text>
              <Text style={styles.configValue}>contact@universalshipping.com</Text>
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Nom d'expéditeur:</Text>
              <Text style={styles.configValue}>Universal Shipping Services</Text>
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Statut:</Text>
              <Text style={[styles.configValue, { color: '#00cc66' }]}>✓ Configuré</Text>
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Service d'envoi:</Text>
              <Text style={[styles.configValue, { color: '#ff9900' }]}>⚠️ Mode test (logs)</Text>
            </View>
          </View>
        </View>

        {/* Workflows Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Workflows Automatiques ({workflows.length})</Text>
          {workflows.map((workflow, index) => (
            <View key={index} style={styles.workflowCard}>
              <View style={styles.workflowHeader}>
                <Text style={styles.workflowName}>
                  {workflow.status === 'active' ? '✅' : '❌'} {workflow.name}
                </Text>
              </View>
              <Text style={styles.workflowTrigger}>Déclencheur: {workflow.trigger}</Text>
              <Text style={styles.workflowType}>Type: {workflow.emailType}</Text>
            </View>
          ))}
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Statistiques des Emails</Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : emailStats.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>Aucun email dans la base de données</Text>
              <Text style={styles.emptySubtext}>Les emails seront créés automatiquement lors des événements</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {emailStats.map((stat, index) => (
                <View key={index} style={styles.statRow}>
                  <Text style={styles.statIcon}>{getStatusIcon(stat.status)}</Text>
                  <View style={styles.statInfo}>
                    <Text style={styles.statType}>{stat.email_type}</Text>
                    <Text style={styles.statStatus} style={{ color: getStatusColor(stat.status) }}>
                      {stat.status}
                    </Text>
                  </View>
                  <Text style={styles.statCount}>{stat.count}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, processing && styles.actionButtonDisabled]}
            onPress={processEmails}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.actionButtonText}>🚀 Traiter les emails en attente</Text>
                <Text style={styles.actionButtonSubtext}>Appelle l'Edge Function pour envoyer les emails</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={loadEmailStats}
          >
            <Text style={styles.actionButtonText}>🔄 Actualiser les statistiques</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#666' }]}
            onPress={() => router.push('/kpi-dashboard')}
          >
            <Text style={styles.actionButtonText}>📈 Voir le Dashboard KPI</Text>
          </TouchableOpacity>
        </View>

        {/* Documentation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Documentation</Text>
          <View style={styles.card}>
            <Text style={styles.docText}>• Audit complet: docs/EMAIL_WORKFLOWS_AUDIT_REPORT.md</Text>
            <Text style={styles.docText}>• Guide de test: docs/EMAIL_TESTING_GUIDE.md</Text>
            <Text style={styles.docText}>• Référence rapide: docs/EMAIL_QUICK_REFERENCE.md</Text>
            <Text style={styles.docText}>• Intégration: docs/EMAIL_SERVICE_INTEGRATION_GUIDE.md</Text>
          </View>
        </View>

        {/* Next Steps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Prochaines Étapes</Text>
          <View style={styles.card}>
            <Text style={styles.stepText}>1. Configurer un service d'envoi (Resend, SendGrid, AWS SES)</Text>
            <Text style={styles.stepText}>2. Vérifier le domaine universalshipping.com</Text>
            <Text style={styles.stepText}>3. Tester l'envoi réel avec une adresse personnelle</Text>
            <Text style={styles.stepText}>4. Automatiser le traitement avec un cron job</Text>
            <Text style={styles.stepText}>5. Ajouter les templates en anglais (optionnel)</Text>
          </View>
        </View>

        {/* Summary Section */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>✅ Résumé</Text>
          <View style={[styles.card, { backgroundColor: '#f0f9f4', borderLeftWidth: 4, borderLeftColor: '#00cc66' }]}>
            <Text style={styles.summaryTitle}>Workflows Implémentés: 9/9 (100%)</Text>
            <Text style={styles.summaryText}>✅ Tous les emails utilisent contact@universalshipping.com</Text>
            <Text style={styles.summaryText}>✅ Tous les sujets sont clairs et en français</Text>
            <Text style={styles.summaryText}>✅ Tous les emails contiennent un lien vers l'app</Text>
            <Text style={styles.summaryText}>✅ Templates professionnels avec branding</Text>
            <Text style={[styles.summaryText, { color: '#ff9900', marginTop: 10 }]}>
              ⚠️ Action requise: Configurer un service d'envoi pour l'envoi réel
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  configValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
  },
  workflowCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  workflowTrigger: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  workflowType: {
    fontSize: 12,
    color: colors.secondary,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonSubtext: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
  docText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  stepText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
    lineHeight: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00cc66',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
});
