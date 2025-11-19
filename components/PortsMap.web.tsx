
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

export function PortsMap({ ports }: PortsMapProps) {
  const theme = useTheme();
  const { language } = useLanguage();

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
        <View style={styles.portsInfo}>
          <Text style={[styles.portsCount, { color: theme.colors.text }]}>
            {language === 'en'
              ? `${ports.length} active ports worldwide`
              : `${ports.length} ports actifs dans le monde`}
          </Text>
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
});
