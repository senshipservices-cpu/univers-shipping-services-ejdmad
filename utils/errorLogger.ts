
/**
 * Enhanced Error Logger
 * Centralized error logging with categorization and context
 * Platform-agnostic implementation for React Native
 */

import { Platform } from 'react-native';

export interface ErrorContext {
  userId?: string;
  clientId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  type?: 'validation' | 'network' | 'database' | 'authentication' | 'authorization' | 'react_error_boundary' | 'unknown';
  componentStack?: string;
  platform?: string;
}

export interface ErrorLog {
  timestamp: string;
  error: Error | string;
  context?: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stack?: string;
  platform: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // Keep last 100 errors in memory
  private lastErrorTime: number = 0;
  private lastErrorMessage: string = '';
  private debounceMs: number = 1000; // Prevent duplicate errors within 1 second

  /**
   * Log an error with context
   */
  log(error: Error | string, context?: ErrorContext, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const now = Date.now();
      
      // Debounce duplicate errors
      if (errorMessage === this.lastErrorMessage && (now - this.lastErrorTime) < this.debounceMs) {
        return;
      }
      
      this.lastErrorMessage = errorMessage;
      this.lastErrorTime = now;
      
      const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        error,
        context: {
          ...context,
          platform: Platform.OS,
        },
        severity,
        stack: error instanceof Error ? error.stack : undefined,
        platform: Platform.OS,
      };

      // Add to in-memory logs
      this.logs.push(errorLog);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift(); // Remove oldest log
      }

      // Console log based on severity
      const contextStr = context ? JSON.stringify(context, null, 2) : '';
      const platformInfo = `[${Platform.OS.toUpperCase()}]`;

      switch (severity) {
        case 'critical':
          console.error(`🔴 ${platformInfo} CRITICAL ERROR:`, errorMessage, contextStr);
          if (error instanceof Error && error.stack) {
            console.error('Stack:', error.stack);
          }
          break;
        case 'high':
          console.error(`🟠 ${platformInfo} HIGH SEVERITY ERROR:`, errorMessage, contextStr);
          if (error instanceof Error && error.stack) {
            console.error('Stack:', error.stack);
          }
          break;
        case 'medium':
          console.warn(`🟡 ${platformInfo} MEDIUM SEVERITY ERROR:`, errorMessage, contextStr);
          break;
        case 'low':
          console.log(`🟢 ${platformInfo} LOW SEVERITY ERROR:`, errorMessage, contextStr);
          break;
      }

      // In production, you would send this to a logging service
      // Example: Sentry, LogRocket, or custom backend
      if (!__DEV__) {
        this.sendToLoggingService(errorLog);
      }
    } catch (loggingError) {
      // Fail silently to prevent infinite error loops
      console.error('Error in error logger:', loggingError);
    }
  }

  /**
   * Log a validation error
   */
  logValidation(field: string, message: string, context?: ErrorContext): void {
    this.log(
      `Validation error in ${field}: ${message}`,
      { ...context, type: 'validation' },
      'low'
    );
  }

  /**
   * Log a network error
   */
  logNetwork(error: Error, endpoint?: string, context?: ErrorContext): void {
    this.log(
      error,
      { ...context, type: 'network', metadata: { endpoint, ...context?.metadata } },
      'medium'
    );
  }

  /**
   * Log a database error
   */
  logDatabase(error: Error, operation?: string, table?: string, context?: ErrorContext): void {
    this.log(
      error,
      { ...context, type: 'database', metadata: { operation, table, ...context?.metadata } },
      'high'
    );
  }

  /**
   * Log an authentication error
   */
  logAuth(error: Error, context?: ErrorContext): void {
    this.log(
      error,
      { ...context, type: 'authentication' },
      'high'
    );
  }

  /**
   * Log an authorization error
   */
  logAuthz(userId: string, resource: string, action: string, context?: ErrorContext): void {
    this.log(
      `Unauthorized access attempt: User ${userId} tried to ${action} ${resource}`,
      { ...context, type: 'authorization', userId },
      'high'
    );
  }

  /**
   * Get all logs
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity);
  }

  /**
   * Get logs by type
   */
  getLogsByType(type: string): ErrorLog[] {
    return this.logs.filter(log => log.context?.type === type);
  }

  /**
   * Get logs by platform
   */
  getLogsByPlatform(platform: string): ErrorLog[] {
    return this.logs.filter(log => log.platform === platform);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Send error to logging service (placeholder)
   */
  private sendToLoggingService(errorLog: ErrorLog): void {
    // In production, implement actual logging service integration
    // Examples:
    // - Sentry.captureException(errorLog.error, { contexts: errorLog.context })
    // - LogRocket.captureException(errorLog.error)
    // - Custom backend API call
    
    // For now, just log that we would send it
    if (__DEV__) {
      console.log('[ErrorLogger] Would send to logging service:', {
        timestamp: errorLog.timestamp,
        severity: errorLog.severity,
        platform: errorLog.platform,
        type: errorLog.context?.type,
      });
    }
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Export convenience function
export function logError(error: Error | string, context?: ErrorContext, severity?: 'low' | 'medium' | 'high' | 'critical'): void {
  errorLogger.log(error, context, severity);
}

/**
 * Setup global error handlers (platform-agnostic)
 * This function is safe to call on all platforms
 */
export function setupErrorLogging(): void {
  try {
    console.log(`[ErrorLogger] Setting up error logging for ${Platform.OS}`);
    
    // Only setup web-specific error handlers on web platform
    if (Platform.OS === 'web') {
      // Web-specific error handling
      if (typeof window !== 'undefined') {
        // Override window.onerror to catch JavaScript errors
        window.onerror = (message, source, lineno, colno, error) => {
          const sourceFile = source ? source.split('/').pop() : 'unknown';
          const errorData = {
            message: String(message),
            source: sourceFile,
            line: lineno,
            column: colno,
          };
          
          console.error('🔴 [WEB] JavaScript Runtime Error:', errorData);
          
          if (error) {
            logError(error, {
              component: 'window.onerror',
              metadata: errorData,
            }, 'critical');
          }
          
          return false; // Don't prevent default error handling
        };
        
        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
          console.error('🔴 [WEB] Unhandled Promise Rejection:', event.reason);
          
          const error = event.reason instanceof Error 
            ? event.reason 
            : new Error(String(event.reason));
          
          logError(error, {
            component: 'unhandledrejection',
            metadata: {
              promise: event.promise,
            },
          }, 'critical');
        });
        
        console.log('[ErrorLogger] Web error handlers installed');
      }
    } else {
      // Native platforms (iOS, Android)
      console.log(`[ErrorLogger] Native platform (${Platform.OS}) - using React Native error handling`);
      
      // React Native has its own error handling via ErrorBoundary
      // We don't need to set up additional handlers here
    }
  } catch (error) {
    console.error('[ErrorLogger] Failed to setup error logging:', error);
  }
}
