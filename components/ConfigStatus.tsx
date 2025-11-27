
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from './IconSymbol';
import appConfig from '@/config/appConfig';
import { getConfigStatus, VerificationResult } from '@/config/configVerification';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

interface ConfigStatusProps {
  onClose?: () => void;
}

export const ConfigStatus: React.FC<ConfigStatusProps> = ({ onClose }) => {
  const theme = useTheme();
  const { user, currentUserIsAdmin } = useAuth();
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

  const getStatusColor = (status: 'success' | 'warning' | 'error', isCritical?: boolean): string => {
    // For non-critical services, never show red
    if (!isCritical && status === 'error') {
      return '#f59e0b'; // Yellow/orange for optional service issues
    }
    
    switch (status) {
      case 'success':
        return colors.success;
      case 'warning':
        return '#f59e0b';
      case 'error':
        return colors.error;
    }
  };

  const getStatusIcon = (status: 'success' | 'warning' | 'error', isCritical?: boolean): { ios: string; android: string } => {
    // For non-critical services, use warning icon instead of error
    if (!isCritical && status === 'error') {
      return { ios: 'exclamationmark.triangle.fill', android: 'warning' };
    }
    
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

  const getOverallStatusText = (): string => {
    if (!status) return 'Checking...';
    switch (status.overall) {
      case 'healthy':
        return 'Overall Status: Operational';
      case 'degraded':
        return 'Overall Status: Operational (with warnings)';
      case 'critical':
        return 'Overall Status: Critical — Database offline';
    }
  };

  const getServiceBadgeText = (result: VerificationResult): string => {
    if (result.isCritical) {
      return result.status === 'success' ? 'OK' : 'CRITICAL';
    } else {
      return result.status === 'success' ? 'OK' : 'Optional';
    }
  };

  const getServiceBadgeColor = (result: VerificationResult): string => {
    if (result.isCritical) {
      return result.status === 'success' ? colors.success : colors.error;
    } else {
      return result.status === 'success' ? colors.success : '#9ca3af'; // Gray for optional
    }
  };

  if (!appConfig.isDevelopment) {
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
            USS — Overall Status
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

      {/* Environment Badge */}
      <View style={styles.envInfo}>
        <Text style={[styles.envLabel, { color: colors.textSecondary }]}>
          Environment:
        </Text>
        <View style={[
          styles.envBadge, 
          { backgroundColor: appConfig.isProduction ? '#10b981' : '#f59e0b' }
        ]}>
          <Text style={styles.envText}>
            {appConfig.appEnv.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Security Section */}
      <View style={[styles.securitySection, { backgroundColor: theme.colors.background }]}>
        <View style={styles.securityHeader}>
          <IconSymbol
            ios_icon_name="shield.lefthalf.filled"
            android_material_icon_name="security"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.securityTitle, { color: theme.colors.text }]}>
            Sécurité
          </Text>
        </View>
        
        <View style={styles.securityContent}>
          <View style={styles.securityRow}>
            <Text style={[styles.securityLabel, { color: colors.textSecondary }]}>
              Utilisateur:
            </Text>
            <Text style={[styles.securityValue, { color: theme.colors.text }]}>
              {user?.email || 'Non connecté'}
            </Text>
          </View>
          
          <View style={styles.securityRow}>
            <Text style={[styles.securityLabel, { color: colors.textSecondary }]}>
              Statut:
            </Text>
            <View style={[
              styles.roleBadge,
              { backgroundColor: currentUserIsAdmin ? colors.primary + '20' : colors.textSecondary + '20' }
            ]}>
              <IconSymbol
                ios_icon_name={currentUserIsAdmin ? 'star.fill' : 'person.fill'}
                android_material_icon_name={currentUserIsAdmin ? 'star' : 'person'}
                size={14}
                color={currentUserIsAdmin ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.roleText,
                { color: currentUserIsAdmin ? colors.primary : colors.textSecondary }
              ]}>
                {currentUserIsAdmin ? 'Admin' : 'Client'}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.securityNote, { color: colors.textSecondary }]}>
            {currentUserIsAdmin 
              ? 'Vous avez accès à toutes les fonctionnalités administratives.'
              : 'Certaines actions sont réservées à l\'équipe Universal Shipping Services.'}
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
          <View style={[styles.overallStatus, { backgroundColor: getOverallStatusColor() + '15', borderColor: getOverallStatusColor() }]}>
            <Text style={[styles.overallStatusText, { color: getOverallStatusColor() }]}>
              {getOverallStatusText()}
            </Text>
          </View>

          <View style={styles.resultsList}>
            {status.results.map((result, index) => {
              const statusColor = getStatusColor(result.status, result.isCritical);
              const statusIcon = getStatusIcon(result.status, result.isCritical);
              const badgeText = getServiceBadgeText(result);
              const badgeColor = getServiceBadgeColor(result);

              return (
                <View key={index} style={[styles.resultItem, { borderLeftColor: statusColor }]}>
                  <View style={styles.resultHeader}>
                    <View style={styles.resultHeaderLeft}>
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
                    <View style={[styles.statusBadge, { backgroundColor: badgeColor + '20', borderColor: badgeColor }]}>
                      <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
                        {badgeText}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.resultMessage, { color: colors.textSecondary }]}>
                    {result.message}
                  </Text>
                  {result.details && appConfig.isDevelopment && (
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
  securitySection: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  securityContent: {
    gap: 8,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  securityLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  securityValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  securityNote: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 8,
    fontStyle: 'italic',
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
    borderWidth: 2,
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
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  resultService: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
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
