
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import appConfig from '@/config/appConfig';
import { getConfigStatus, VerificationResult } from '@/config/configVerification';

export default function AdminConfigScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<{
    overall: 'healthy' | 'degraded' | 'critical';
    results: VerificationResult[];
  } | null>(null);

  const loadConfigStatus = useCallback(async () => {
    try {
      setLoading(true);
      const configStatus = await getConfigStatus();
      setStatus(configStatus);
    } catch (error) {
      console.error('Error loading config status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadConfigStatus();
    }
  }, [user, isAdmin, loadConfigStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConfigStatus();
  }, [loadConfigStatus]);

  // Redirect non-authenticated users to login
  if (!authLoading && !user) {
    return <Redirect href="/(tabs)/login" />;
  }

  // Redirect non-admin users to pricing screen
  if (!authLoading && user && !isAdmin) {
    console.log('[ADMIN-CONFIG] Non-admin user attempting to access admin screen, redirecting to pricing');
    return <Redirect href="/(tabs)/pricing" />;
  }

  if (authLoading || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Chargement de la configuration...
          </Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: 'success' | 'warning' | 'error'): string => {
    switch (status) {
      case 'success':
        return '#10b981';
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
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      case 'critical':
        return colors.error;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow_back"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Configuration
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          onPress={onRefresh}
        >
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Environment Info */}
        <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Environnement
            </Text>
          </View>

          <View style={styles.envRow}>
            <Text style={[styles.envLabel, { color: colors.textSecondary }]}>
              APP_ENV:
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
        </View>

        {/* Overall Status */}
        {status && (
          <View style={[styles.overallStatusCard, { backgroundColor: getOverallStatusColor() + '15', borderColor: getOverallStatusColor() }]}>
            <View style={styles.overallStatusHeader}>
              <IconSymbol
                ios_icon_name={status.overall === 'healthy' ? 'checkmark.shield.fill' : 'exclamationmark.shield.fill'}
                android_material_icon_name={status.overall === 'healthy' ? 'verified' : 'warning'}
                size={32}
                color={getOverallStatusColor()}
              />
              <View style={styles.overallStatusText}>
                <Text style={[styles.overallStatusTitle, { color: getOverallStatusColor() }]}>
                  Statut global
                </Text>
                <Text style={[styles.overallStatusValue, { color: getOverallStatusColor() }]}>
                  {status.overall === 'healthy' ? 'Opérationnel' : status.overall === 'degraded' ? 'Dégradé' : 'Critique'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Services Status */}
        <View style={styles.servicesSection}>
          <Text style={[styles.servicesSectionTitle, { color: theme.colors.text }]}>
            État des services
          </Text>

          {status?.results.map((result, index) => {
            const statusColor = getStatusColor(result.status);
            const statusIcon = getStatusIcon(result.status);

            return (
              <View
                key={index}
                style={[styles.serviceCard, { backgroundColor: theme.colors.card, borderColor: colors.border, borderLeftColor: statusColor }]}
              >
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceHeaderLeft}>
                    <IconSymbol
                      ios_icon_name={statusIcon.ios}
                      android_material_icon_name={statusIcon.android}
                      size={24}
                      color={statusColor}
                    />
                    <Text style={[styles.serviceName, { color: theme.colors.text }]}>
                      {result.service}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {result.status === 'success' ? 'OK' : result.status === 'warning' ? 'Attention' : 'KO'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.serviceMessage, { color: colors.textSecondary }]}>
                  {result.message}
                </Text>

                {result.details && appConfig.isDevelopment && (
                  <View style={[styles.detailsContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
                      {JSON.stringify(result.details, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={[styles.legendSection, { backgroundColor: theme.colors.card, borderColor: colors.border }]}>
          <Text style={[styles.legendTitle, { color: theme.colors.text }]}>
            Légende
          </Text>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              OK - Service opérationnel
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Attention - Configuration incomplète ou problème mineur
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              KO - Service non disponible ou erreur critique
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  envRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  envLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  envBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  envText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overallStatusCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  overallStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  overallStatusText: {
    flex: 1,
    gap: 4,
  },
  overallStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  overallStatusValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  servicesSection: {
    gap: 12,
  },
  servicesSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  serviceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  legendSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    flex: 1,
  },
});
