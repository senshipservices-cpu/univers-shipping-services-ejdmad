
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { isSupabaseConfigured } from '@/app/integrations/supabase/client';

/**
 * ConfigStatus Component
 * 
 * Shows a dismissible banner at the top of the app when Supabase is not configured.
 * This provides a non-intrusive way to inform users about configuration issues.
 */
export default function ConfigStatus() {
  const [dismissed, setDismissed] = React.useState(false);

  // Don't show if configured or dismissed
  if (isSupabaseConfigured || dismissed) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚙️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Configuration Requise</Text>
          <Text style={styles.message}>
            Ajoutez les variables d&apos;environnement dans Natively Settings
          </Text>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => Linking.openURL('https://docs.supabase.com/guides/getting-started')}
          >
            <Text style={styles.helpButtonText}>📚 Guide de Configuration</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={() => setDismissed(true)}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#fef3c7',
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 6,
  },
  helpButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 8,
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 20,
    color: '#92400e',
    fontWeight: 'bold',
  },
});
