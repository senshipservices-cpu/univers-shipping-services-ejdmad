
/**
 * Error Boundary Component
 * 
 * Catches and handles React errors gracefully across all platforms.
 * This component prevents the entire app from crashing when an error occurs.
 * 
 * Features:
 * - Catches all React component errors
 * - Displays user-friendly error UI
 * - Logs detailed error information for debugging
 * - Provides retry functionality
 * - Shows detailed error info in development mode
 * - Platform-agnostic implementation
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { logError } from '@/utils/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
  errorMessage: string;
  errorStack: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      errorMessage: '',
      errorStack: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorCount = this.state.errorCount + 1;
    
    // Enhanced logging for debugging
    console.error('═══════════════════════════════════════════════════════');
    console.error('🔴 ERROR BOUNDARY CAUGHT AN ERROR');
    console.error('═══════════════════════════════════════════════════════');
    console.error('Platform:', Platform.OS);
    console.error('Error Count:', errorCount);
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('───────────────────────────────────────────────────────');
    console.error('Error Stack:');
    console.error(error.stack || 'No stack trace available');
    console.error('───────────────────────────────────────────────────────');
    console.error('Component Stack:');
    console.error(errorInfo.componentStack || 'No component stack available');
    console.error('═══════════════════════════════════════════════════════');
    
    // Log the full error details using error logger
    logError(error, {
      component: 'ErrorBoundary',
      type: 'react_error_boundary',
      componentStack: errorInfo.componentStack,
      metadata: {
        platform: Platform.OS,
        errorCount,
        errorName: error.name,
        timestamp: new Date().toISOString(),
      },
    }, 'critical');

    // Update state with error info
    this.setState({
      hasError: true,
      errorMessage: error?.message ?? String(error),
      errorStack: error?.stack ?? '',
      errorInfo,
      errorCount,
    });
  }

  handleReset = () => {
    console.log('🔄 [ERROR_BOUNDARY] Resetting ErrorBoundary...');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorMessage: '',
      errorStack: '',
    });
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.content}>
              {/* Error Icon */}
              <Text style={styles.emoji}>⚠️</Text>
              
              {/* Error Title */}
              <Text style={styles.title}>Oups! Une erreur est survenue</Text>
              
              {/* Error Message */}
              <Text style={styles.message}>
                Nous sommes désolés pour ce désagrément. L&apos;erreur a été enregistrée et nous allons l&apos;examiner.
              </Text>
              
              {/* Error Details (Always visible for debugging) */}
              {this.state.errorMessage && (
                <View style={styles.errorDetailsBox}>
                  <Text style={styles.errorDetailsTitle}>Détails de l&apos;erreur:</Text>
                  <Text style={styles.errorDetailsText}>
                    {this.state.errorMessage}
                  </Text>
                  {this.state.errorStack && (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={true}
                      style={styles.stackScrollView}
                    >
                      <Text style={styles.errorStackText} numberOfLines={8}>
                        {this.state.errorStack}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              )}
              
              {/* Development Mode Details */}
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>🔍 Informations de débogage (Dev uniquement):</Text>
                  
                  <View style={styles.errorBox}>
                    <Text style={styles.errorLabel}>Plateforme:</Text>
                    <Text style={styles.errorText}>{Platform.OS}</Text>
                  </View>
                  
                  <View style={styles.errorBox}>
                    <Text style={styles.errorLabel}>Nombre d&apos;erreurs:</Text>
                    <Text style={styles.errorText}>{this.state.errorCount}</Text>
                  </View>
                  
                  <View style={styles.errorBox}>
                    <Text style={styles.errorLabel}>Type d&apos;erreur:</Text>
                    <Text style={styles.errorText}>{this.state.error.name}</Text>
                  </View>
                  
                  {this.state.errorInfo?.componentStack && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorLabel}>Component Stack:</Text>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={true}
                        style={styles.stackScrollView}
                      >
                        <Text style={styles.errorText}>
                          {this.state.errorInfo.componentStack}
                        </Text>
                      </ScrollView>
                    </View>
                  )}
                  
                  <Text style={styles.debugHint}>
                    💡 Consultez la console pour le log complet de l&apos;erreur
                  </Text>
                  
                  <Text style={styles.debugHint}>
                    📱 Sur iOS: Ouvrez Safari → Développement → [Votre appareil] → [Votre app] pour voir les logs
                  </Text>
                </View>
              )}
              
              {/* Retry Button */}
              <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                <Text style={styles.buttonText}>Réessayer</Text>
              </TouchableOpacity>
              
              {/* Dev Note */}
              {__DEV__ && (
                <Text style={styles.devNote}>
                  Mode Développement: Les détails de l&apos;erreur sont visibles ci-dessus
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 600,
    width: '100%',
  },
  emoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorDetailsBox: {
    backgroundColor: '#fff5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 8,
  },
  errorDetailsText: {
    fontSize: 13,
    color: '#c53030',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    lineHeight: 20,
    marginBottom: 8,
  },
  errorStackText: {
    fontSize: 11,
    color: '#666',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    lineHeight: 16,
  },
  errorDetails: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  errorBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    lineHeight: 18,
  },
  stackScrollView: {
    maxHeight: 200,
  },
  debugHint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  devNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
