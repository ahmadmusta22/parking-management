/**
 * Performance monitoring utilities
 */

// Core Web Vitals monitoring
export const measureWebVitals = () => {
  // Largest Contentful Paint (LCP)
  const measureLCP = () => {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      // console.log('LCP:', lastEntry.startTime);
      
      // Report to analytics
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          name: 'LCP',
          value: Math.round(lastEntry.startTime),
          event_category: 'Web Vitals'
        });
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  };

  // First Input Delay (FID)
  const measureFID = () => {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        // console.log('FID:', entry.processingStart - entry.startTime);
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'FID',
            value: Math.round(entry.processingStart - entry.startTime),
            event_category: 'Web Vitals'
          });
        }
      });
    }).observe({ entryTypes: ['first-input'] });
  };

  // Cumulative Layout Shift (CLS)
  const measureCLS = () => {
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      // console.log('CLS:', clsValue);
      
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          name: 'CLS',
          value: Math.round(clsValue * 1000),
          event_category: 'Web Vitals'
        });
      }
    }).observe({ entryTypes: ['layout-shift'] });
  };

  // Initialize measurements
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    measureLCP();
    measureFID();
    measureCLS();
  }
};

// Bundle size monitoring
export const measureBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      // console.log('Performance Metrics:', {
      //   loadTime: Math.round(loadTime),
      //   domContentLoaded: Math.round(domContentLoaded),
      //   totalTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
      // });
      
      // Report to analytics
      if (window.gtag) {
        window.gtag('event', 'performance', {
          load_time: Math.round(loadTime),
          dom_content_loaded: Math.round(domContentLoaded),
          event_category: 'Performance'
        });
      }
    }
  }
};

// Memory usage monitoring
export const measureMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = performance.memory;
    // console.log('Memory Usage:', {
    //   used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
    //   total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
    //   limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
    // });
    
    // Alert if memory usage is high
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    if (usagePercent > 80) {
      // console.warn('High memory usage detected:', usagePercent.toFixed(2) + '%');
    }
  }
};

// API performance monitoring
export const measureAPIPerformance = (url, startTime, endTime) => {
  const duration = endTime - startTime;
  // console.log(`API Call: ${url} - ${Math.round(duration)}ms`);
  
  // Report slow API calls
  if (duration > 3000) {
    // console.warn(`Slow API call detected: ${url} - ${Math.round(duration)}ms`);
  }
  
  // Report to analytics
  if (window.gtag) {
    window.gtag('event', 'api_performance', {
      url: url,
      duration: Math.round(duration),
      event_category: 'API Performance'
    });
  }
};

// Component render performance
export const measureComponentRender = (componentName, startTime, endTime) => {
  const duration = endTime - startTime;
  // console.log(`Component Render: ${componentName} - ${Math.round(duration)}ms`);
  
  // Report slow renders
  if (duration > 100) {
    // console.warn(`Slow component render: ${componentName} - ${Math.round(duration)}ms`);
  }
};

// Network performance monitoring
export const measureNetworkPerformance = () => {
  if (typeof window !== 'undefined' && 'connection' in navigator) {
    const connection = navigator.connection;
    // console.log('Network Info:', {
    //   effectiveType: connection.effectiveType,
    //   downlink: connection.downlink + ' Mbps',
    //   rtt: connection.rtt + ' ms',
    //   saveData: connection.saveData
    // });
    
    // Report to analytics
    if (window.gtag) {
      window.gtag('event', 'network_info', {
        effective_type: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        event_category: 'Network'
      });
    }
  }
};

// Performance budget monitoring
export const checkPerformanceBudget = () => {
  const budget = {
    lcp: 2500, // 2.5 seconds
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    loadTime: 3000 // 3 seconds
  };
  
  // Check against budget and report violations
  const violations = [];
  
  // This would be populated by actual measurements
  // For now, just return the budget structure
  return { budget, violations };
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    // Measure Web Vitals
    measureWebVitals();
    
    // Measure bundle size after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        measureBundleSize();
        measureMemoryUsage();
        measureNetworkPerformance();
      }, 1000);
    });
    
    // Monitor memory usage periodically
    setInterval(measureMemoryUsage, 30000); // Every 30 seconds
  }
};

// Performance reporting service
export const reportPerformanceMetrics = (metrics) => {
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to monitoring service
    // console.log('Reporting performance metrics:', metrics);
    
    // You could integrate with services like:
    // - Google Analytics
    // - Sentry
    // - New Relic
    // - DataDog
  }
};
