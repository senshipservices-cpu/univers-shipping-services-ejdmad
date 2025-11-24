
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
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
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          language === 'en' ? 'Permission Denied' : 'Permission refusée',
          language === 'en'
            ? 'Location permission is required to find nearby ports.'
            : 'La permission de localisation est requise pour trouver les ports à proximité.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

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

      if (nearby.length === 0) {
        Alert.alert(
          language === 'en' ? 'No Nearby Ports' : 'Aucun port à proximité',
          language === 'en'
            ? 'No ports found within 500 km of your location.'
            : 'Aucun port trouvé à moins de 500 km de votre position.'
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        language === 'en' ? 'Error' : 'Erreur',
        language === 'en'
          ? 'Unable to retrieve your location.'
          : 'Impossible de récupérer votre position.'
      );
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
          />
        )}
      </MapView>

      {/* Locate button */}
      <TouchableOpacity
        style={[styles.locateButton, { backgroundColor: colors.primary }]}
        onPress={locateUser}
      >
        <IconSymbol
          ios_icon_name="location.fill"
          android_material_icon_name="my_location"
          size={24}
          color="#ffffff"
        />
      </TouchableOpacity>

      {/* Nearby ports list */}
      {nearbyPorts.length > 0 && (
        <View style={[styles.nearbyContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.nearbyTitle, { color: theme.colors.text }]}>
            {language === 'en'
              ? `Nearby Ports (≤ 500 km):`
              : `Ports proches (≤ 500 km) :`}
          </Text>
          {nearbyPorts.slice(0, 5).map((port, index) => (
            <TouchableOpacity
              key={index}
              style={styles.nearbyPortItem}
              onPress={() => {
                if (onPortPress) {
                  onPortPress(port.id);
                }
              }}
            >
              <Text style={[styles.nearbyPortName, { color: theme.colors.text }]}>
                {port.name}
              </Text>
              <Text style={[styles.nearbyPortDistance, { color: colors.textSecondary }]}>
                ~{Math.round(port.distance)} km
              </Text>
            </TouchableOpacity>
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
  },
  nearbyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  nearbyPortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nearbyPortName: {
    fontSize: 14,
    fontWeight: '600',
  },
  nearbyPortDistance: {
    fontSize: 13,
  },
});
