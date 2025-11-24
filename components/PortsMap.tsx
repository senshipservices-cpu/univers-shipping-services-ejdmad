
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useTheme } from '@react-navigation/native';
import { useLanguage } from '@/contexts/LanguageContext';

interface Port {
  id: string;
  name: string;
  lat: number;
  lng: number;
  is_hub: boolean;
  country: string;
}

interface PortsMapProps {
  ports: Port[];
  onPortPress?: (portId: string) => void;
}

export function PortsMap({ ports, onPortPress }: PortsMapProps) {
  const theme = useTheme();
  const { language } = useLanguage();
  const [region, setRegion] = useState<Region>({
    latitude: 20,
    longitude: 0,
    latitudeDelta: 80,
    longitudeDelta: 80,
  });
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearbyPorts, setNearbyPorts] = useState<(Port & { distance: number })[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    console.log('PortsMap received ports:', ports.length);
    if (ports.length > 0) {
      console.log('First port:', ports[0]);
    }
  }, [ports]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get nearby ports within 500km
  const getNearbyPorts = (userLat: number, userLon: number) => {
    const portsWithDistance = ports
      .map((port) => ({
        ...port,
        distance: calculateDistance(userLat, userLon, port.lat, port.lng),
      }))
      .filter((port) => port.distance <= 500)
      .sort((a, b) => a.distance - b.distance);

    return portsWithDistance;
  };

  // Request location permission and get user location
  const locateUser = async () => {
    try {
      setLoadingLocation(true);
      console.log('Requesting location permission...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied');
        Alert.alert(
          language === 'en' ? 'Permission Denied' : 'Permission refusée',
          language === 'en'
            ? 'Location permission is required to find nearby ports.'
            : 'La permission de localisation est requise pour trouver les ports à proximité.'
        );
        setLoadingLocation(false);
        return;
      }

      console.log('Getting current position...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      console.log('User location:', latitude, longitude);

      setUserLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 5,
        longitudeDelta: 5,
      });

      // Calculate nearby ports
      const nearby = getNearbyPorts(latitude, longitude);
      setNearbyPorts(nearby);
      console.log('Nearby ports found:', nearby.length);

      if (nearby.length === 0) {
        Alert.alert(
          language === 'en' ? 'No Nearby Ports' : 'Aucun port à proximité',
          language === 'en'
            ? 'No ports found within 500 km of your location.'
            : 'Aucun port trouvé à moins de 500 km de votre position.'
        );
      } else {
        Alert.alert(
          language === 'en' ? 'Location Found' : 'Position trouvée',
          language === 'en'
            ? `Found ${nearby.length} port${nearby.length > 1 ? 's' : ''} within 500 km.`
            : `${nearby.length} port${nearby.length > 1 ? 's' : ''} trouvé${nearby.length > 1 ? 's' : ''} à moins de 500 km.`
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        language === 'en' ? 'Error' : 'Erreur',
        language === 'en'
          ? 'Unable to retrieve your location. Please make sure location services are enabled.'
          : 'Impossible de récupérer votre position. Veuillez vous assurer que les services de localisation sont activés.'
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  if (ports.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { backgroundColor: colors.highlight }]}>
        <IconSymbol
          ios_icon_name="map"
          android_material_icon_name="map"
          size={48}
          color={colors.textSecondary}
        />
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          {language === 'en' ? 'No ports available to display' : 'Aucun port disponible à afficher'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* Port markers */}
        {ports.map((port, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: port.lat, longitude: port.lng }}
            title={port.name}
            description={port.country}
            pinColor={port.is_hub ? colors.accent : colors.primary}
            onPress={() => {
              if (onPortPress) {
                onPortPress(port.id);
              }
            }}
          />
        ))}

        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title={language === 'en' ? 'Your Location' : 'Votre position'}
            pinColor="#007BFF"
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationDot} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Locate button */}
      <TouchableOpacity
        style={[styles.locateButton, { backgroundColor: colors.primary }]}
        onPress={locateUser}
        disabled={loadingLocation}
      >
        {loadingLocation ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <IconSymbol
            ios_icon_name="location.fill"
            android_material_icon_name="my_location"
            size={24}
            color="#ffffff"
          />
        )}
      </TouchableOpacity>

      {/* Nearby ports list */}
      {nearbyPorts.length > 0 && (
        <View style={[styles.nearbyContainer, { backgroundColor: theme.colors.card }]}>
          <View style={styles.nearbyHeader}>
            <Text style={[styles.nearbyTitle, { color: theme.colors.text }]}>
              {language === 'en'
                ? `Nearby Ports (≤ 500 km)`
                : `Ports proches (≤ 500 km)`}
            </Text>
            <TouchableOpacity
              onPress={() => setNearbyPorts([])}
              style={styles.closeNearbyButton}
            >
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {nearbyPorts.slice(0, 5).map((port, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.nearbyPortItem}
                onPress={() => {
                  if (onPortPress) {
                    onPortPress(port.id);
                  }
                }}
              >
                <View style={styles.nearbyPortInfo}>
                  <Text style={[styles.nearbyPortName, { color: theme.colors.text }]}>
                    {port.name}
                  </Text>
                  <Text style={[styles.nearbyPortCountry, { color: colors.textSecondary }]}>
                    {port.country}
                  </Text>
                </View>
                <View style={styles.nearbyPortDistance}>
                  <Text style={[styles.nearbyPortDistanceText, { color: colors.primary }]}>
                    ~{Math.round(port.distance)} km
                  </Text>
                  {port.is_hub && (
                    <View style={[styles.hubBadgeTiny, { backgroundColor: colors.accent }]}>
                      <IconSymbol
                        ios_icon_name="star.fill"
                        android_material_icon_name="star"
                        size={8}
                        color="#ffffff"
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              {index < nearbyPorts.slice(0, 5).length - 1 && (
                <View style={[styles.nearbyDivider, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  locateButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 123, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007BFF',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nearbyContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 250,
  },
  nearbyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nearbyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  closeNearbyButton: {
    padding: 4,
  },
  nearbyPortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  nearbyPortInfo: {
    flex: 1,
  },
  nearbyPortName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  nearbyPortCountry: {
    fontSize: 12,
  },
  nearbyPortDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nearbyPortDistanceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nearbyDivider: {
    height: 1,
    marginVertical: 4,
  },
  hubBadgeTiny: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
