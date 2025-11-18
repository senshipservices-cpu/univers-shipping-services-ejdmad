
/**
 * Enhanced Error Logger
 * Centralized error logging with categorization and context
 */

export interface ErrorContext {
  userId?: string;
  clientId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  type?: 'validation' | 'network' | 'database' | 'authentication' | 'authorization' | 'react_error_boundary' | 'unknown';
}

export interface ErrorLog {
  timestamp: string;
  error: Error | string;
  context?: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stack?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // Keep last 100 errors in memory

  /**
   * Log an error with context
   */
  log(error: Error | string, context?: ErrorContext, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error,
      context,
      severity,
      stack: error instanceof Error ? error.stack : undefined,
    };

    // Add to in-memory logs
    this.logs.push(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console log based on severity
    const errorMessage = error instanceof Error ? error.message : error;
    const contextStr = context ? JSON.stringify(context, null, 2) : '';

    switch (severity) {
      case 'critical':
        console.error('🔴 CRITICAL ERROR:', errorMessage, contextStr);
        break;
      case 'high':
        console.error('🟠 HIGH SEVERITY ERROR:', errorMessage, contextStr);
        break;
      case 'medium':
        console.warn('🟡 MEDIUM SEVERITY ERROR:', errorMessage, contextStr);
        break;
      case 'low':
        console.log('🟢 LOW SEVERITY ERROR:', errorMessage, contextStr);
        break;
    }

    // In production, you would send this to a logging service
    // Example: Sentry, LogRocket, or custom backend
    if (!__DEV__) {
      this.sendToLoggingService(errorLog);
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
      { ...context, type: 'network', metadata: { endpoint } },
      'medium'
    );
  }

  /**
   * Log a database error
   */
  logDatabase(error: Error, operation?: string, table?: string, context?: ErrorContext): void {
    this.log(
      error,
      { ...context, type: 'database', metadata: { operation, table } },
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
    console.log('Would send to logging service:', errorLog);
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Export convenience function
export function logError(error: Error | string, context?: ErrorContext, severity?: 'low' | 'medium' | 'high' | 'critical'): void {
  errorLogger.log(error, context, severity);
}
