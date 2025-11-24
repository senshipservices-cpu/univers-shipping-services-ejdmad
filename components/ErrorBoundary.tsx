
/**
 * Error Boundary Component
 * Catches and handles React errors gracefully
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
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 Error caught by ErrorBoundary:', error);
    console.error('🔴 Component Stack:', errorInfo.componentStack);
    
    // Log the full error details
    logError(error, {
      component: 'ErrorBoundary',
      type: 'react_error_boundary',
      metadata: {
        componentStack: errorInfo.componentStack,
        platform: Platform.OS,
      },
    }, 'critical');

    // Update state with error info
    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
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
              
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>🔍 Error Details (Dev Only):</Text>
                  <View style={styles.errorBox}>
                    <Text style={styles.errorLabel}>Error Message:</Text>
                    <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                  </View>
                  
                  {this.state.error.stack && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorLabel}>Stack Trace:</Text>
                      <Text style={styles.errorText}>{this.state.error.stack}</Text>
                    </View>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorLabel}>Component Stack:</Text>
                      <Text style={styles.errorText}>
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.errorBox}>
                    <Text style={styles.errorLabel}>Platform:</Text>
                    <Text style={styles.errorText}>{Platform.OS}</Text>
                  </View>
                  
                  <Text style={styles.debugHint}>
                    💡 Check the console for more detailed logs
                  </Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
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
  debugHint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
