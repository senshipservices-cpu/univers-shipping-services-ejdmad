
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';
import appConfig from '@/config/appConfig';
import { colors } from '@/styles/commonStyles';

/**
 * SupabaseConnectionTest Component
 * Tests the Supabase connection and displays the result
 * Only visible in development mode
 */
export default function SupabaseConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Test 1: Check configuration
      const validation = appConfig.validateConfig();
      if (!validation.valid) {
        setResult({
          success: false,
          message: 'Configuration validation failed',
          details: validation.errors,
        });
        setTesting(false);
        return;
      }

      // Test 2: Try to query the database
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .limit(1);

      if (error) {
        // Check if it's a "table doesn't exist" error (which is OK for now)
        if (error.message.includes('does not exist')) {
          setResult({
            success: true,
            message: '✓ Supabase connection successful! (Table not created yet)',
            details: {
              url: appConfig.env.SUPABASE_URL,
              hasAnonKey: !!appConfig.env.SUPABASE_ANON_KEY,
            },
          });
        } else {
          setResult({
            success: false,
            message: 'Connection error',
            details: error,
          });
        }
      } else {
        setResult({
          success: true,
          message: '✓ Supabase connection successful!',
          details: {
            url: appConfig.env.SUPABASE_URL,
            hasAnonKey: !!appConfig.env.SUPABASE_ANON_KEY,
            recordsFound: data?.length || 0,
          },
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: 'Unexpected error',
        details: error.message || error,
      });
    } finally {
      setTesting(false);
    }
  };

  // Auto-test on mount (moved before early return to fix React Hooks rules)
  useEffect(() => {
    if (!appConfig.isProduction) {
      testConnection();
    }
  }, []);

  // Only show in development
  if (appConfig.isProduction) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔌 Supabase Connection Test</Text>
      </View>

      <View style={styles.content}>
        {/* Configuration Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>URL:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {appConfig.env.SUPABASE_URL || 'Not set'}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Anon Key:</Text>
          <Text style={styles.infoValue}>
            {appConfig.env.SUPABASE_ANON_KEY ? '••••••••' : 'Not set'}
          </Text>
        </View>

        {/* Test Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={testConnection}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.testButtonText}>Test Connection</Text>
          )}
        </TouchableOpacity>

        {/* Result */}
        {result && (
          <View
            style={[
              styles.resultContainer,
              result.success ? styles.resultSuccess : styles.resultError,
            ]}
          >
            <Text
              style={[
                styles.resultMessage,
                result.success ? styles.resultMessageSuccess : styles.resultMessageError,
              ]}
            >
              {result.message}
            </Text>

            {result.details && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsText}>
                  {typeof result.details === 'string'
                    ? result.details
                    : JSON.stringify(result.details, null, 2)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
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
    padding: 12,
    backgroundColor: colors.primary + '20',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    padding: 12,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  testButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultContainer: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  resultSuccess: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success,
  },
  resultError: {
    backgroundColor: colors.error + '10',
    borderColor: colors.error,
  },
  resultMessage: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultMessageSuccess: {
    color: colors.success,
  },
  resultMessageError: {
    color: colors.error,
  },
  detailsContainer: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 4,
  },
  detailsText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
});
