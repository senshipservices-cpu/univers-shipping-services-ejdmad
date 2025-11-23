
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from './IconSymbol';
import appConfig from '@/config/appConfig';
import { getConfigStatus, VerificationResult } from '@/config/configVerification';
import { colors } from '@/styles/commonStyles';

interface ConfigStatusProps {
  onClose?: () => void;
}

export const ConfigStatus: React.FC<ConfigStatusProps> = ({ onClose }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{
    overall: 'healthy' | 'degraded' | 'critical';
    results: VerificationResult[];
  } | null>(null);

  useEffect(() => {
    checkConfig();
  }, []);

  const checkConfig = async () => {
    setLoading(true);
    try {
      const configStatus = await getConfigStatus();
      setStatus(configStatus);
    } catch (error) {
      appConfig.logger.error('Failed to check config status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: 'success' | 'warning' | 'error'): string => {
    switch (status) {
      case 'success':
        return colors.success;
      case 'warning':
        return '#f59e0b';
      case 'error':
        return colors.error;
    }
  };

  const getStatusIcon = (status: 'success' | 'warning' | 'error'): { ios: string; android: string } => {
    switch (status) {
      case 'success':
        return { ios: 'checkmark.circle.fill', android: 'check_circle' };
      case 'warning':
        return { ios: 'exclamationmark.triangle.fill', android: 'warning' };
      case 'error':
        return { ios: 'xmark.circle.fill', android: 'error' };
    }
  };

  const getOverallStatusColor = (): string => {
    if (!status) return colors.textSecondary;
    switch (status.overall) {
      case 'healthy':
        return colors.success;
      case 'degraded':
        return '#f59e0b';
      case 'critical':
        return colors.error;
    }
  };

  if (!appConfig.isDev) {
    return null; // Only show in development mode
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol
            ios_icon_name="gear"
            android_material_icon_name="settings"
            size={24}
            color={theme.colors.text}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Configuration Status
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol
              ios_icon_name="xmark"
              android_material_icon_name="close"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.envInfo}>
        <Text style={[styles.envLabel, { color: colors.textSecondary }]}>
          Environment:
        </Text>
        <View style={[styles.envBadge, { backgroundColor: appConfig.isProduction ? colors.error : colors.primary }]}>
          <Text style={styles.envText}>
            {appConfig.appEnv.toUpperCase()}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Checking configuration...
          </Text>
        </View>
      ) : status ? (
        <>
          <View style={[styles.overallStatus, { backgroundColor: getOverallStatusColor() + '15' }]}>
            <Text style={[styles.overallStatusText, { color: getOverallStatusColor() }]}>
              Overall Status: {status.overall.toUpperCase()}
            </Text>
          </View>

          <View style={styles.resultsList}>
            {status.results.map((result, index) => {
              const statusColor = getStatusColor(result.status);
              const statusIcon = getStatusIcon(result.status);

              return (
                <View key={index} style={[styles.resultItem, { borderLeftColor: statusColor }]}>
                  <View style={styles.resultHeader}>
                    <IconSymbol
                      ios_icon_name={statusIcon.ios}
                      android_material_icon_name={statusIcon.android}
                      size={20}
                      color={statusColor}
                    />
                    <Text style={[styles.resultService, { color: theme.colors.text }]}>
                      {result.service}
                    </Text>
                  </View>
                  <Text style={[styles.resultMessage, { color: colors.textSecondary }]}>
                    {result.message}
                  </Text>
                  {result.details && appConfig.isDev && (
                    <View style={styles.resultDetails}>
                      <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
                        {JSON.stringify(result.details, null, 2)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={checkConfig}
          >
            <IconSymbol
              ios_icon_name="arrow.clockwise"
              android_material_icon_name="refresh"
              size={18}
              color="#ffffff"
            />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  envInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  envLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  envBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  envText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
  },
  overallStatus: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  overallStatusText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultsList: {
    gap: 12,
    marginBottom: 16,
  },
  resultItem: {
    padding: 12,
    borderLeftWidth: 4,
    backgroundColor: colors.background + '50',
    borderRadius: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultService: {
    fontSize: 15,
    fontWeight: '700',
  },
  resultMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  resultDetails: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  detailsText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
