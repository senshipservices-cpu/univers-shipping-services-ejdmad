
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import appConfig from '@/config/appConfig';
import { colors } from '@/styles/commonStyles';

/**
 * ConfigStatus Component
 * Displays the current configuration status and helps debug environment variable issues
 * Only visible in development mode
 */
export default function ConfigStatus() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development
  if (appConfig.isProduction) {
    return null;
  }

  const validation = appConfig.validateConfig();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.header,
          validation.valid ? styles.headerSuccess : styles.headerError,
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.headerText}>
          {validation.valid ? '✓' : '⚠'} Configuration Status
        </Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView style={styles.content}>
          {/* Errors */}
          {validation.errors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>❌ Errors ({validation.errors.length})</Text>
              {validation.errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  • {error}
                </Text>
              ))}
            </View>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Warnings ({validation.warnings.length})</Text>
              {validation.warnings.map((warning, index) => (
                <Text key={index} style={styles.warningText}>
                  • {warning}
                </Text>
              ))}
            </View>
          )}

          {/* Environment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌍 Environment</Text>
            <ConfigItem label="APP_ENV" value={appConfig.env.APP_ENV} />
            <ConfigItem label="Is Production" value={appConfig.isProduction ? 'Yes' : 'No'} />
          </View>

          {/* Supabase */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗄️ Supabase</Text>
            <ConfigItem
              label="URL"
              value={appConfig.env.SUPABASE_URL}
              isSet={!!appConfig.env.SUPABASE_URL}
            />
            <ConfigItem
              label="Anon Key"
              value={appConfig.env.SUPABASE_ANON_KEY ? '••••••••' : 'Not set'}
              isSet={!!appConfig.env.SUPABASE_ANON_KEY}
            />
          </View>

          {/* Payment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Payment</Text>
            <ConfigItem label="Provider" value={appConfig.env.PAYMENT_PROVIDER} />
            {appConfig.env.PAYMENT_PROVIDER === 'paypal' && (
              <>
                <ConfigItem label="PayPal Environment" value={appConfig.env.PAYPAL_ENV} />
                <ConfigItem
                  label="PayPal Client ID"
                  value={appConfig.env.PAYPAL_CLIENT_ID ? '••••••••' : 'Not set'}
                  isSet={!!appConfig.env.PAYPAL_CLIENT_ID}
                />
              </>
            )}
          </View>

          {/* Google Maps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗺️ Google Maps</Text>
            <ConfigItem
              label="API Key"
              value={appConfig.env.GOOGLE_MAPS_API_KEY ? '••••••••' : 'Not set'}
              isSet={!!appConfig.env.GOOGLE_MAPS_API_KEY}
            />
          </View>

          {/* SMTP */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📧 SMTP</Text>
            <ConfigItem
              label="Configured"
              value={appConfig.smtp.isConfigured() ? 'Yes' : 'No'}
              isSet={appConfig.smtp.isConfigured()}
            />
            {appConfig.smtp.isConfigured() && (
              <>
                <ConfigItem label="Host" value={appConfig.env.SMTP_HOST} />
                <ConfigItem label="Port" value={appConfig.env.SMTP_PORT} />
              </>
            )}
          </View>

          {/* Admin */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Admin</Text>
            <ConfigItem
              label="Admin Emails"
              value={appConfig.env.ADMIN_EMAILS.length > 0 ? appConfig.env.ADMIN_EMAILS.join(', ') : 'None'}
              isSet={appConfig.env.ADMIN_EMAILS.length > 0}
            />
          </View>

          {/* Help */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ Help</Text>
            <Text style={styles.helpText}>
              To fix configuration issues:
            </Text>
            <Text style={styles.helpText}>
              1. Go to Natively → Environment Variables tab
            </Text>
            <Text style={styles.helpText}>
              2. Add missing variables (see .env.example)
            </Text>
            <Text style={styles.helpText}>
              3. Restart the app
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

interface ConfigItemProps {
  label: string;
  value: string;
  isSet?: boolean;
}

function ConfigItem({ label, value, isSet }: ConfigItemProps) {
  const status = isSet !== undefined ? (isSet ? '✓' : '✗') : '';
  const statusColor = isSet !== undefined ? (isSet ? colors.success : colors.error) : colors.text;

  return (
    <View style={styles.configItem}>
      <Text style={styles.configLabel}>
        {status && <Text style={[styles.configStatus, { color: statusColor }]}>{status} </Text>}
        {label}:
      </Text>
      <Text style={styles.configValue} numberOfLines={1}>
        {value || 'Not set'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerSuccess: {
    backgroundColor: colors.success + '20',
  },
  headerError: {
    backgroundColor: colors.error + '20',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    maxHeight: 400,
    padding: 12,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    marginBottom: 4,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  configLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  configStatus: {
    fontWeight: '600',
  },
  configValue: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  helpText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
