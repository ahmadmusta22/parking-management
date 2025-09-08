/**
 * Production debugging and error tracking utilities
 */

import React from 'react';

// Error types
export const ERROR_TYPES = {
  JAVASCRIPT: 'javascript',
  NETWORK: 'network',
  API: 'api',
  USER_INTERACTION: 'user_interaction',
  PERFORMANCE: 'performance',
  SECURITY: 'security'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error tracking service
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.isProduction = process.env.NODE_ENV === 'production';
    this.userContext = {};
    this.sessionId = this.generateSessionId();
  }

  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Set user context
  setUserContext(user) {
    this.userContext = {
      id: user.id,
      username: user.username,
      role: user.role,
      sessionId: this.sessionId
    };
  }

  // Clear user context
  clearUserContext() {
    this.userContext = {};
  }

  // Capture error
  captureError(error, context = {}) {
    const errorData = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: context.type || ERROR_TYPES.JAVASCRIPT,
      severity: context.severity || ERROR_SEVERITY.MEDIUM,
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userContext: this.userContext,
      context: {
        ...context,
        sessionId: this.sessionId,
        timestamp: Date.now()
      },
      breadcrumbs: this.getBreadcrumbs()
    };

    // Add to local storage
    this.errors.push(errorData);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (!this.isProduction) {
      console.error('Error captured:', errorData);
    }

    // Send to error tracking service in production
    if (this.isProduction) {
      this.sendToErrorService(errorData);
    }

    return errorData.id;
  }

  // Generate unique error ID
  generateErrorId() {
    return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get breadcrumbs (recent user actions)
  getBreadcrumbs() {
    return this.breadcrumbs || [];
  }

  // Add breadcrumb
  addBreadcrumb(action, data = {}) {
    if (!this.breadcrumbs) {
      this.breadcrumbs = [];
    }

    this.breadcrumbs.push({
      action,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });

    // Keep only last 20 breadcrumbs
    if (this.breadcrumbs.length > 20) {
      this.breadcrumbs.shift();
    }
  }

  // Send error to tracking service
  async sendToErrorService(errorData) {
    try {
      // In a real application, you would send to services like:
      // - Sentry
      // - Bugsnag
      // - Rollbar
      // - LogRocket
      
      // console.log('Sending error to tracking service:', errorData);
      
      // Example: Send to custom endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });
    } catch (error) {
      console.error('Failed to send error to tracking service:', error);
    }
  }

  // Get all errors
  getErrors() {
    return this.errors;
  }

  // Clear all errors
  clearErrors() {
    this.errors = [];
  }

  // Get error statistics
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      bySeverity: {},
      recent: this.errors.slice(-10)
    };

    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }
}

// Create global error tracker instance
export const errorTracker = new ErrorTracker();

// Make errorTracker globally available for debug panel
if (typeof window !== 'undefined') {
  window.errorTracker = errorTracker;
}

// Global error handler
export const setupGlobalErrorHandling = () => {
  // JavaScript errors
  window.addEventListener('error', (event) => {
    errorTracker.captureError(event.error, {
      type: ERROR_TYPES.JAVASCRIPT,
      severity: ERROR_SEVERITY.HIGH,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.captureError(new Error(event.reason), {
      type: ERROR_TYPES.JAVASCRIPT,
      severity: ERROR_SEVERITY.HIGH,
      reason: event.reason
    });
  });

  // Network errors
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      if (!response.ok) {
        errorTracker.captureError(new Error(`HTTP ${response.status}`), {
          type: ERROR_TYPES.NETWORK,
          severity: response.status >= 500 ? ERROR_SEVERITY.HIGH : ERROR_SEVERITY.MEDIUM,
          url: args[0],
          status: response.status,
          statusText: response.statusText
        });
      }
      
      return response;
    } catch (error) {
      errorTracker.captureError(error, {
        type: ERROR_TYPES.NETWORK,
        severity: ERROR_SEVERITY.HIGH,
        url: args[0]
      });
      throw error;
    }
  };
};

// Performance monitoring
export const performanceMonitoring = {
  // Monitor long tasks
  monitorLongTasks: () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            errorTracker.captureError(new Error('Long task detected'), {
              type: ERROR_TYPES.PERFORMANCE,
              severity: ERROR_SEVERITY.MEDIUM,
              duration: entry.duration,
              startTime: entry.startTime
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    }
  },

  // Monitor memory usage
  monitorMemoryUsage: () => {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 90) {
          errorTracker.captureError(new Error('High memory usage'), {
            type: ERROR_TYPES.PERFORMANCE,
            severity: ERROR_SEVERITY.HIGH,
            memoryUsage: {
              used: memory.usedJSHeapSize,
              total: memory.totalJSHeapSize,
              limit: memory.jsHeapSizeLimit,
              percentage: usagePercent
            }
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }
};

// User interaction tracking
export const userInteractionTracking = {
  // Track clicks
  trackClicks: () => {
    document.addEventListener('click', (event) => {
      errorTracker.addBreadcrumb('click', {
        target: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        text: event.target.textContent?.substring(0, 100)
      });
    });
  },

  // Track form submissions
  trackFormSubmissions: () => {
    document.addEventListener('submit', (event) => {
      errorTracker.addBreadcrumb('form_submit', {
        formId: event.target.id,
        formClass: event.target.className,
        action: event.target.action
      });
    });
  },

  // Track navigation
  trackNavigation: () => {
    let currentUrl = window.location.href;
    
    const checkNavigation = () => {
      if (window.location.href !== currentUrl) {
        errorTracker.addBreadcrumb('navigation', {
          from: currentUrl,
          to: window.location.href
        });
        currentUrl = window.location.href;
      }
    };
    
    // Check for navigation changes
    setInterval(checkNavigation, 1000);
    
    // Listen for popstate events
    window.addEventListener('popstate', () => {
      errorTracker.addBreadcrumb('navigation', {
        type: 'popstate',
        to: window.location.href
      });
    });
  }
};

// Debug utilities - DISABLED
// export const debugUtils = {
//   // Create debug panel
//   createDebugPanel: () => {
//     if (process.env.NODE_ENV === 'production') return;
//     
//     const panel = document.createElement('div');
//     panel.id = 'debug-panel';
//     panel.style.cssText = `
//       position: fixed;
//       top: 10px;
//       right: 10px;
//       width: 300px;
//       max-height: 400px;
//       background: #000;
//       color: #fff;
//       padding: 10px;
//       font-family: monospace;
//       font-size: 12px;
//       z-index: 10000;
//       overflow-y: auto;
//       border-radius: 5px;
//       display: none;
//     `;
//     
//     const toggleButton = document.createElement('button');
//     toggleButton.textContent = 'Debug';
//     toggleButton.style.cssText = `
//       position: fixed;
//       top: 10px;
//       right: 10px;
//       z-index: 10001;
//       background: #007bff;
//       color: white;
//       border: none;
//       padding: 5px 10px;
//       border-radius: 3px;
//       cursor: pointer;
//     `;
//     
//     toggleButton.addEventListener('click', () => {
//       panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
//     });
//     
//     document.body.appendChild(toggleButton);
//     document.body.appendChild(panel);
//     
//     return panel;
//   },

//   // Update debug panel
//   updateDebugPanel: (panel) => {
//     if (!panel) return;
//     
//     const stats = errorTracker.getErrorStats();
//     const errors = errorTracker.getErrors().slice(-5);
//     
//     panel.innerHTML = `
//       <h4>Debug Panel</h4>
//       <div><strong>Session ID:</strong> ${errorTracker.sessionId}</div>
//       <div><strong>Total Errors:</strong> ${stats.total}</div>
//       <div><strong>Errors by Type:</strong> ${JSON.stringify(stats.byType)}</div>
//       <div><strong>Errors by Severity:</strong> ${JSON.stringify(stats.bySeverity)}</div>
//       <h5>Recent Errors:</h5>
//       ${errors.map(error => `
//         <div style="margin: 5px 0; padding: 5px; background: #333; border-radius: 3px;">
//           <div><strong>${error.type}</strong> - ${error.severity}</div>
//           <div>${error.message}</div>
//           <div style="font-size: 10px; color: #ccc;">${new Date(error.timestamp).toLocaleTimeString()}</div>
//         </div>
//       `).join('')}
//       <button id="clear-errors-btn" style="margin-top: 10px; padding: 5px;">Clear Errors</button>
//     `;
//     
//     // Add event listener for clear button
//     const clearBtn = panel.querySelector('#clear-errors-btn');
//     if (clearBtn) {
//       clearBtn.addEventListener('click', () => {
//         errorTracker.clearErrors();
//         debugUtils.updateDebugPanel(panel);
//       });
//     }
//   }
// };

// Initialize error tracking
export const initializeErrorTracking = () => {
  // Setup global error handling
  setupGlobalErrorHandling();
  
  // Setup performance monitoring
  performanceMonitoring.monitorLongTasks();
  performanceMonitoring.monitorMemoryUsage();
  
  // Setup user interaction tracking
  userInteractionTracking.trackClicks();
  userInteractionTracking.trackFormSubmissions();
  userInteractionTracking.trackNavigation();
  
  // Remove any existing debug panels
  const existingDebugPanel = document.getElementById('debug-panel');
  if (existingDebugPanel) {
    existingDebugPanel.remove();
  }
  
  // Remove any existing debug buttons
  const existingDebugButton = document.querySelector('button[style*="position: fixed"][style*="top: 10px"][style*="right: 10px"]');
  if (existingDebugButton && existingDebugButton.textContent === 'Debug') {
    existingDebugButton.remove();
  }
  
  // console.log('Error tracking initialized');
};

// Enhanced React Error Boundary
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    errorTracker.captureError(error, {
      type: ERROR_TYPES.JAVASCRIPT,
      severity: ERROR_SEVERITY.HIGH,
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="card border-danger">
                  <div className="card-header bg-danger text-white">
                    <h4 className="mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Something went wrong
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="text-center mb-4">
                      <i className="fas fa-bug fa-4x text-danger mb-3"></i>
                      <h5>Oops! An error occurred</h5>
                      <p className="text-muted">
                        We're sorry, but something unexpected happened. 
                        This has been logged and we'll look into it.
                      </p>
                    </div>

                    {/* Error Details (only in development) */}
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                      <div className="mb-4">
                        <h6>Error Details (Development Only):</h6>
                        <div className="alert alert-danger">
                          <strong>Error:</strong> {this.state.error.toString()}
                        </div>
                        {this.state.errorInfo && (
                          <details className="mt-2">
                            <summary>Stack Trace</summary>
                            <pre className="mt-2" style={{ fontSize: '0.8rem', maxHeight: '200px', overflow: 'auto' }}>
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 justify-content-center">
                      <button 
                        className="btn btn-primary"
                        onClick={this.handleRetry}
                      >
                        <i className="fas fa-redo me-1"></i>
                        Try Again
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={this.handleReload}
                      >
                        <i className="fas fa-refresh me-1"></i>
                        Reload Page
                      </button>
                      <button 
                        className="btn btn-outline-info"
                        onClick={() => window.history.back()}
                      >
                        <i className="fas fa-arrow-left me-1"></i>
                        Go Back
                      </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-4 text-center">
                      <small className="text-muted">
                        If this problem persists, please contact support.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
