
/**
 * Error Boundary Component
 * Catches and handles React errors gracefully
 * Enhanced with detailed logging for iOS debugging
 * NOW DISPLAYS ERROR DETAILS IN PRODUCTION FOR DEBUGGING
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
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorCount = this.state.errorCount + 1;
    
    // Enhanced logging for iOS debugging
    console.error('[GLOBAL_ERROR_BOUNDARY]', error, errorInfo);
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
    
    // Log the full error details
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

    // Update state with error info INCLUDING errorMessage and errorStack
    this.setState({
      hasError: true,
      errorMessage: error?.message ?? String(error),
      errorStack: error?.stack ?? '',
      errorInfo,
      errorCount,
    });
  }

  handleReset = () => {
    console.log('🔄 Resetting ErrorBoundary...');
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.content}>
              <Text style={styles.emoji}>⚠️</Text>
              <Text style={styles.title}>Oops! Something went wrong</Text>
              <Text style={styles.message}>
                We&apos;re sorry for the inconvenience. The error has been logged and we&apos;ll look into it.
              </Text>
              
              {/* Bloc debug pour voir l'erreur réelle sur iOS / Android / Web */}
              {(true) && this.state.errorMessage ? (
                <View
                  style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: '#f8f8f8',
                    borderRadius: 8,
                    marginHorizontal: 24,
                    width: '100%',
                    maxWidth: 600,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#b00020', marginBottom: 8 }}>
                    {this.state.errorMessage}
                  </Text>
                  {this.state.errorStack ? (
                    <Text
                      style={{ fontSize: 10, color: '#555' }}
                      numberOfLines={6}
                    >
                      {this.state.errorStack}
                    </Text>
                  ) : null}
                </View>
              ) : null}
              
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>🔍 Error Details (Dev Only):</Text>
                  
                  <View style={styles.errorBox}>
                    <Text style={styles.errorLabel}>Platform:</Text>
                    <Text style={styles.errorText}>{Platform.OS}</Text>
                  </View>
                  
                  <View style={styles.errorBox}>
                    <Text style={styles.errorLabel}>Error Count:</Text>
                    <Text style={styles.errorText}>{this.state.errorCount}</Text>
                  </View>
                  
                  <View style={styles.errorBox}>
                    <Text style={styles.errorLabel}>Error Name:</Text>
                    <Text style={styles.errorText}>{this.state.error.name}</Text>
                  </View>
                  
                  <View style={styles.errorBox}>
                    <Text style={styles.errorLabel}>Error Message:</Text>
                    <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                  </View>
                  
                  {this.state.error.stack && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorLabel}>Stack Trace:</Text>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={true}
                        style={styles.stackScrollView}
                      >
                        <Text style={styles.errorText}>{this.state.error.stack}</Text>
                      </ScrollView>
                    </View>
                  )}
                  
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
                    💡 Check the console for the complete error log with detailed information
                  </Text>
                  
                  <Text style={styles.debugHint}>
                    📱 On iOS: Open Safari → Develop → [Your Device] → [Your App] to see console logs
                  </Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
              
              {__DEV__ && (
                <Text style={styles.devNote}>
                  Development Mode: Error details are visible above
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
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorDetails: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
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
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  devNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
