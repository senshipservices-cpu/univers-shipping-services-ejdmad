
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/app/integrations/supabase/client";
import { colors } from "@/styles/commonStyles";

interface ShipmentDetail {
  id: string;
  tracking_number: string;
  current_status: string;
  origin_port: any;
  destination_port: any;
  eta: string | null;
  etd: string | null;
  cargo_type: string | null;
  container_type: string | null;
  incoterm: string | null;
  client_visible_notes: string | null;
  created_at: string;
  updated_at: string;
  last_update: string | null;
}

export default function ShipmentDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/(tabs)/client-space');
      return;
    }
    if (id) {
      loadShipmentDetail();
    }
  }, [user, id]);

  const loadShipmentDetail = async () => {
    try {
      setLoading(true);

      // First get client ID
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (clientError) {
        console.error('Error loading client:', clientError);
        return;
      }

      // Load shipment detail
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select(`
          *,
          origin_port:ports!shipments_origin_port_fkey(name, city, country),
          destination_port:ports!shipments_destination_port_fkey(name, city, country)
        `)
        .eq('id', id)
        .eq('client', clientData.id)
        .single();

      if (shipmentError) {
        console.error('Error loading shipment:', shipmentError);
      } else {
        setShipment(shipmentData);
      }
    } catch (error) {
      console.error('Error loading shipment detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'in_transit':
        return colors.primary;
      case 'at_port':
        return '#f59e0b';
      case 'on_hold':
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return { ios: 'checkmark.circle.fill', android: 'check_circle' };
      case 'in_transit':
        return { ios: 'shippingbox.fill', android: 'local_shipping' };
      case 'at_port':
        return { ios: 'location.fill', android: 'location_on' };
      case 'on_hold':
        return { ios: 'pause.circle.fill', android: 'pause_circle' };
      case 'cancelled':
        return { ios: 'xmark.circle.fill', android: 'cancel' };
      default:
        return { ios: 'circle.fill', android: 'circle' };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Shipment Details</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading shipment...</Text>
        </View>
      </View>
    );
  }

  if (!shipment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron_left"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Shipment Details</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="error"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>Shipment not found</Text>
        </View>
      </View>
    );
  }

  const statusIcon = getStatusIcon(shipment.current_status);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron_left"
            size={28}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Shipment Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: getStatusColor(shipment.current_status) }]}>
          <IconSymbol
            ios_icon_name={statusIcon.ios}
            android_material_icon_name={statusIcon.android}
            size={48}
            color="#ffffff"
          />
          <Text style={styles.statusTitle}>{formatStatus(shipment.current_status)}</Text>
          <Text style={styles.trackingNumber}>{shipment.tracking_number}</Text>
        </View>

        {/* Route Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Route</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routeStep}>
              <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
              <View style={styles.routeInfo}>
                <Text style={[styles.routeLabel, { color: theme.colors.text }]}>Origin</Text>
                <Text style={[styles.routeValue, { color: theme.colors.text }]}>
                  {shipment.origin_port?.name || 'Unknown'}
                </Text>
                <Text style={styles.routeSubvalue}>
                  {shipment.origin_port?.city}, {shipment.origin_port?.country}
                </Text>
                {shipment.etd && (
                  <Text style={styles.dateText}>
                    ETD: {new Date(shipment.etd).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.routeConnector} />
            <View style={styles.routeStep}>
              <View style={[styles.routeDot, { backgroundColor: colors.secondary }]} />
              <View style={styles.routeInfo}>
                <Text style={[styles.routeLabel, { color: theme.colors.text }]}>Destination</Text>
                <Text style={[styles.routeValue, { color: theme.colors.text }]}>
                  {shipment.destination_port?.name || 'Unknown'}
                </Text>
                <Text style={styles.routeSubvalue}>
                  {shipment.destination_port?.city}, {shipment.destination_port?.country}
                </Text>
                {shipment.eta && (
                  <Text style={styles.dateText}>
                    ETA: {new Date(shipment.eta).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Shipment Details */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Shipment Information</Text>
          <View style={styles.detailsGrid}>
            {shipment.cargo_type && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cargo Type</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {shipment.cargo_type}
                </Text>
              </View>
            )}
            {shipment.container_type && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Container Type</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {shipment.container_type}
                </Text>
              </View>
            )}
            {shipment.incoterm && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Incoterm</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {shipment.incoterm}
                </Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {new Date(shipment.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {shipment.client_visible_notes && (
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notes</Text>
            <Text style={[styles.notesText, { color: theme.colors.text }]}>
              {shipment.client_visible_notes}
            </Text>
          </View>
        )}

        {/* Last Update */}
        {shipment.last_update && (
          <View style={styles.updateInfo}>
            <IconSymbol
              ios_icon_name="clock"
              android_material_icon_name="schedule"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.updateText}>
              Last updated: {new Date(shipment.last_update).toLocaleString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusCard: {
    margin: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  trackingNumber: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.06)',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  routeContainer: {
    gap: 0,
  },
  routeStep: {
    flexDirection: 'row',
    gap: 16,
  },
  routeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  routeConnector: {
    width: 2,
    height: 32,
    backgroundColor: colors.border,
    marginLeft: 7,
    marginVertical: 8,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  routeSubvalue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  updateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
