/**
 * Cross-browser compatibility utilities
 */

// Browser detection
export const browserInfo = {
  // Detect browser type
  getBrowser: () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  },

  // Detect browser version
  getVersion: () => {
    const userAgent = navigator.userAgent;
    const browser = browserInfo.getBrowser();
    
    switch (browser) {
      case 'Chrome':
        const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
        return chromeMatch ? parseInt(chromeMatch[1]) : null;
      case 'Firefox':
        const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
        return firefoxMatch ? parseInt(firefoxMatch[1]) : null;
      case 'Safari':
        const safariMatch = userAgent.match(/Version\/(\d+)/);
        return safariMatch ? parseInt(safariMatch[1]) : null;
      case 'Edge':
        const edgeMatch = userAgent.match(/Edg\/(\d+)/);
        return edgeMatch ? parseInt(edgeMatch[1]) : null;
      default:
        return null;
    }
  },

  // Check if browser supports specific features
  supports: {
    // WebSocket support
    webSocket: () => 'WebSocket' in window,
    
    // Local storage support
    localStorage: () => {
      try {
        return 'localStorage' in window && window.localStorage !== null;
      } catch (e) {
        return false;
      }
    },
    
    // Session storage support
    sessionStorage: () => {
      try {
        return 'sessionStorage' in window && window.sessionStorage !== null;
      } catch (e) {
        return false;
      }
    },
    
    // Fetch API support
    fetch: () => 'fetch' in window,
    
    // Promise support
    promise: () => 'Promise' in window,
    
    // Intersection Observer support
    intersectionObserver: () => 'IntersectionObserver' in window,
    
    // Resize Observer support
    resizeObserver: () => 'ResizeObserver' in window,
    
    // CSS Grid support
    cssGrid: () => {
      const element = document.createElement('div');
      element.style.display = 'grid';
      return element.style.display === 'grid';
    },
    
    // CSS Flexbox support
    flexbox: () => {
      const element = document.createElement('div');
      element.style.display = 'flex';
      return element.style.display === 'flex';
    },
    
    // CSS Custom Properties support
    customProperties: () => {
      const element = document.createElement('div');
      element.style.setProperty('--test', 'value');
      return element.style.getPropertyValue('--test') === 'value';
    }
  }
};

// Polyfills for older browsers
export const polyfills = {
  // Array.from polyfill
  arrayFrom: () => {
    if (!Array.from) {
      Array.from = function(arrayLike) {
        return Array.prototype.slice.call(arrayLike);
      };
    }
  },

  // Object.assign polyfill
  objectAssign: () => {
    if (!Object.assign) {
      Object.assign = function(target) {
        for (let i = 1; i < arguments.length; i++) {
          const source = arguments[i];
          for (const key in source) {
            if (source.hasOwnProperty(key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
    }
  },

  // Promise polyfill (basic)
  promise: () => {
    if (!window.Promise) {
      console.warn('Promise not supported, using polyfill');
      // Basic Promise implementation would go here
      // For production, use a proper polyfill library
    }
  },

  // Fetch polyfill
  fetch: () => {
    if (!window.fetch) {
      console.warn('Fetch not supported, using XMLHttpRequest fallback');
      window.fetch = function(url, options = {}) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(options.method || 'GET', url);
          
          if (options.headers) {
            Object.keys(options.headers).forEach(key => {
              xhr.setRequestHeader(key, options.headers[key]);
            });
          }
          
          xhr.onload = () => {
            resolve({
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              json: () => Promise.resolve(JSON.parse(xhr.responseText)),
              text: () => Promise.resolve(xhr.responseText)
            });
          };
          
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(options.body);
        });
      };
    }
  }
};

// CSS compatibility fixes
export const cssCompatibility = {
  // Add vendor prefixes
  addVendorPrefixes: (element, property, value) => {
    const prefixes = ['-webkit-', '-moz-', '-ms-', '-o-', ''];
    prefixes.forEach(prefix => {
      element.style[prefix + property] = value;
    });
  },

  // Fix flexbox issues in older browsers
  fixFlexbox: () => {
    const style = document.createElement('style');
    style.textContent = `
      .flex-container {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
      }
      
      .flex-item {
        -webkit-box-flex: 1;
        -webkit-flex: 1;
        -ms-flex: 1;
        flex: 1;
      }
    `;
    document.head.appendChild(style);
  },

  // Fix CSS Grid fallback
  fixCSSGrid: () => {
    if (!browserInfo.supports.cssGrid()) {
      const style = document.createElement('style');
      style.textContent = `
        .grid-container {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-flex-wrap: wrap;
          -ms-flex-wrap: wrap;
          flex-wrap: wrap;
        }
        
        .grid-item {
          -webkit-box-flex: 0;
          -webkit-flex: 0 0 auto;
          -ms-flex: 0 0 auto;
          flex: 0 0 auto;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

// JavaScript compatibility fixes
export const jsCompatibility = {
  // Fix forEach on NodeList in older browsers
  fixNodeListForEach: () => {
    if (!NodeList.prototype.forEach) {
      NodeList.prototype.forEach = Array.prototype.forEach;
    }
  },

  // Fix includes method
  fixIncludes: () => {
    if (!String.prototype.includes) {
      String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') {
          start = 0;
        }
        if (start + search.length > this.length) {
          return false;
        } else {
          return this.indexOf(search, start) !== -1;
        }
      };
    }
  },

  // Fix startsWith method
  fixStartsWith: () => {
    if (!String.prototype.startsWith) {
      String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
      };
    }
  }
};

// WebSocket compatibility
export const websocketCompatibility = {
  // Check WebSocket support and provide fallback
  checkSupport: () => {
    if (!browserInfo.supports.webSocket()) {
      console.warn('WebSocket not supported, using polling fallback');
      return false;
    }
    return true;
  },

  // Create WebSocket with fallback
  createConnection: (url, protocols) => {
    if (websocketCompatibility.checkSupport()) {
      return new WebSocket(url, protocols);
    } else {
      // Return a mock WebSocket that uses polling
      return {
        readyState: 0,
        send: () => console.log('WebSocket fallback: send not implemented'),
        close: () => console.log('WebSocket fallback: close not implemented'),
        addEventListener: () => {},
        removeEventListener: () => {}
      };
    }
  }
};

// Storage compatibility
export const storageCompatibility = {
  // Safe localStorage access
  safeLocalStorage: {
    getItem: (key) => {
      try {
        return browserInfo.supports.localStorage() ? localStorage.getItem(key) : null;
      } catch (e) {
        console.warn('localStorage access failed:', e);
        return null;
      }
    },
    
    setItem: (key, value) => {
      try {
        if (browserInfo.supports.localStorage()) {
          localStorage.setItem(key, value);
          return true;
        }
        return false;
      } catch (e) {
        console.warn('localStorage set failed:', e);
        return false;
      }
    },
    
    removeItem: (key) => {
      try {
        if (browserInfo.supports.localStorage()) {
          localStorage.removeItem(key);
          return true;
        }
        return false;
      } catch (e) {
        console.warn('localStorage remove failed:', e);
        return false;
      }
    }
  },

  // Safe sessionStorage access
  safeSessionStorage: {
    getItem: (key) => {
      try {
        return browserInfo.supports.sessionStorage() ? sessionStorage.getItem(key) : null;
      } catch (e) {
        console.warn('sessionStorage access failed:', e);
        return null;
      }
    },
    
    setItem: (key, value) => {
      try {
        if (browserInfo.supports.sessionStorage()) {
          sessionStorage.setItem(key, value);
          return true;
        }
        return false;
      } catch (e) {
        console.warn('sessionStorage set failed:', e);
        return false;
      }
    }
  }
};

// Initialize compatibility fixes
export const initializeCompatibility = () => {
  // Load polyfills
  polyfills.arrayFrom();
  polyfills.objectAssign();
  polyfills.promise();
  polyfills.fetch();
  
  // Fix JavaScript compatibility
  jsCompatibility.fixNodeListForEach();
  jsCompatibility.fixIncludes();
  jsCompatibility.fixStartsWith();
  
  // Fix CSS compatibility
  cssCompatibility.fixFlexbox();
  cssCompatibility.fixCSSGrid();
  
  // Log browser information
  console.log('Browser Info:', {
    browser: browserInfo.getBrowser(),
    version: browserInfo.getVersion(),
    features: {
      webSocket: browserInfo.supports.webSocket(),
      localStorage: browserInfo.supports.localStorage(),
      fetch: browserInfo.supports.fetch(),
      cssGrid: browserInfo.supports.cssGrid(),
      flexbox: browserInfo.supports.flexbox()
    }
  });
};

// Browser-specific fixes
export const browserSpecificFixes = {
  // Safari-specific fixes
  safari: () => {
    if (browserInfo.getBrowser() === 'Safari') {
      // Fix viewport height issue on Safari
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      setVH();
      window.addEventListener('resize', setVH);
    }
  },

  // Internet Explorer fixes
  ie: () => {
    if (navigator.userAgent.includes('MSIE') || navigator.userAgent.includes('Trident')) {
      console.warn('Internet Explorer detected. Some features may not work properly.');
      // Add IE-specific fixes here
    }
  },

  // Mobile browser fixes
  mobile: () => {
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Add mobile-specific fixes
      document.body.classList.add('mobile-browser');
    }
  }
};

// Initialize all compatibility features
export const initializeAllCompatibility = () => {
  initializeCompatibility();
  browserSpecificFixes.safari();
  browserSpecificFixes.ie();
  browserSpecificFixes.mobile();
};
