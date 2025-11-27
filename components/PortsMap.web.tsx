
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useTheme } from '@react-navigation/native';
import { useLanguage } from '@/contexts/LanguageContext';
import Constants from 'expo-constants';

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
  const [imageError, setImageError] = useState(false);

  const googleMapsApiKey = Constants.expoConfig?.extra?.googleMapsApiKey;

  // For single port, show static map image
  const isSinglePort = ports.length === 1;
  const singlePort = isSinglePort ? ports[0] : null;

  const handleOpenInGoogleMaps = () => {
    if (singlePort) {
      const url = `https://www.google.com/maps/search/?api=1&query=${singlePort.lat},${singlePort.lng}`;
      Linking.openURL(url);
    } else if (ports.length > 0) {
      // Open Google Maps with first port
      const firstPort = ports[0];
      const url = `https://www.google.com/maps/search/?api=1&query=${firstPort.lat},${firstPort.lng}`;
      Linking.openURL(url);
    }
  };

  // Generate static map URL for single port
  const getStaticMapUrl = () => {
    if (!singlePort || !googleMapsApiKey) return null;
    
    const { lat, lng, name } = singlePort;
    const zoom = 12;
    const size = '600x400';
    const markerColor = singlePort.is_hub ? 'red' : 'blue';
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&markers=color:${markerColor}%7C${lat},${lng}&key=${googleMapsApiKey}`;
  };

  const staticMapUrl = getStaticMapUrl();

  if (isSinglePort && staticMapUrl && !imageError) {
    // Show static map image for single port
    return (
      <View style={styles.container}>
        <img
          src={staticMapUrl}
          alt={`Map of ${singlePort.name}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 16,
          }}
          onError={() => setImageError(true)}
        />
        
        <TouchableOpacity
          style={[styles.openInMapsButton, { backgroundColor: colors.primary }]}
          onPress={handleOpenInGoogleMaps}
        >
          <IconSymbol
            ios_icon_name="map.fill"
            android_material_icon_name="map"
            size={20}
            color="#ffffff"
          />
          <Text style={styles.openInMapsButtonText}>
            {language === 'en' ? 'Open in Google Maps' : 'Ouvrir dans Google Maps'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fallback UI for web
  return (
    <View style={[styles.container, { backgroundColor: colors.highlight }]}>
      <View style={styles.content}>
        <IconSymbol
          ios_icon_name="map.fill"
          android_material_icon_name="map"
          size={64}
          color={colors.primary}
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {language === 'en' ? 'Interactive Map' : 'Carte Interactive'}
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {language === 'en'
            ? 'Interactive maps with react-native-maps are not supported on web in Natively. Please use the mobile app (iOS or Android) to view the interactive port map with geolocation features.'
            : 'Les cartes interactives avec react-native-maps ne sont pas prises en charge sur le web dans Natively. Veuillez utiliser l\'application mobile (iOS ou Android) pour afficher la carte interactive des ports avec les fonctionnalités de géolocalisation.'}
        </Text>
        
        {ports.length > 0 && (
          <>
            <View style={styles.portsInfo}>
              <Text style={[styles.portsCount, { color: theme.colors.text }]}>
                {language === 'en'
                  ? `${ports.length} port${ports.length > 1 ? 's' : ''} available`
                  : `${ports.length} port${ports.length > 1 ? 's' : ''} disponible${ports.length > 1 ? 's' : ''}`}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.openInMapsButton, { backgroundColor: colors.primary }]}
              onPress={handleOpenInGoogleMaps}
            >
              <IconSymbol
                ios_icon_name="map.fill"
                android_material_icon_name="map"
                size={20}
                color="#ffffff"
              />
              <Text style={styles.openInMapsButtonText}>
                {language === 'en' ? 'Open in Google Maps' : 'Ouvrir dans Google Maps'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="my_location"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              {language === 'en' ? 'Geolocation' : 'Géolocalisation'}
            </Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="mappin.circle.fill"
              android_material_icon_name="location_on"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              {language === 'en' ? 'Port markers' : 'Marqueurs de ports'}
            </Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="arrow.triangle.2.circlepath"
              android_material_icon_name="sync"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              {language === 'en' ? 'Nearby ports' : 'Ports à proximité'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    gap: 16,
    maxWidth: 500,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  portsInfo: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  portsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  openInMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  openInMapsButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  featuresList: {
    marginTop: 16,
    gap: 12,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
