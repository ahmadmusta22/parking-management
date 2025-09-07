/**
 * Progressive Web App utilities and mobile optimization
 */

// Service Worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      // console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, show update notification
            showUpdateNotification();
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// PWA installation prompt
export const pwaInstallation = {
  deferredPrompt: null,
  
  // Initialize install prompt
  init: () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      pwaInstallation.deferredPrompt = e;
      showInstallButton();
    });
    
    // Track app installation
    window.addEventListener('appinstalled', () => {
      // console.log('PWA was installed');
      hideInstallButton();
    });
  },
  
  // Show install button
  showInstallButton: () => {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
    }
  },
  
  // Hide install button
  hideInstallButton: () => {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  },
  
  // Prompt installation
  promptInstall: async () => {
    if (pwaInstallation.deferredPrompt) {
      pwaInstallation.deferredPrompt.prompt();
      const { outcome } = await pwaInstallation.deferredPrompt.userChoice;
      // console.log(`User response to install prompt: ${outcome}`);
      pwaInstallation.deferredPrompt = null;
      hideInstallButton();
    }
  }
};

// Offline functionality
export const offlineSupport = {
  // Check online status
  isOnline: () => navigator.onLine,
  
  // Handle online/offline events
  init: () => {
    window.addEventListener('online', () => {
      // console.log('Connection restored');
      showOnlineNotification();
      // Sync any pending data
      syncPendingData();
    });
    
    window.addEventListener('offline', () => {
      // console.log('Connection lost');
      showOfflineNotification();
    });
  },
  
  // Cache critical resources
  cacheCriticalResources: async () => {
    if ('caches' in window) {
      const cache = await caches.open('critical-resources-v1');
      const criticalResources = [
        '/',
        '/static/css/main.css',
        '/static/js/main.js',
        '/assets/img/logo.svg'
      ];
      
      try {
        await cache.addAll(criticalResources);
        // console.log('Critical resources cached');
      } catch (error) {
        console.error('Failed to cache critical resources:', error);
      }
    }
  }
};

// Mobile optimization utilities
export const mobileOptimization = {
  // Touch event handling
  touchEvents: {
    // Prevent double-tap zoom
    preventDoubleTapZoom: () => {
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, false);
    },
    
    // Add touch feedback
    addTouchFeedback: (element) => {
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      });
      
      element.addEventListener('touchend', () => {
        setTimeout(() => {
          element.classList.remove('touch-active');
        }, 150);
      });
    }
  },
  
  // Viewport handling
  viewport: {
    // Fix viewport height on mobile browsers
    fixViewportHeight: () => {
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);
    },
    
    // Handle orientation changes
    handleOrientationChange: () => {
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          // Recalculate layout after orientation change
          window.dispatchEvent(new Event('resize'));
        }, 100);
      });
    }
  },
  
  // Performance optimizations
  performance: {
    // Lazy load images
    lazyLoadImages: () => {
      const images = document.querySelectorAll('img[data-src]');
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          });
        });
        
        images.forEach(img => imageObserver.observe(img));
      } else {
        // Fallback for older browsers
        images.forEach(img => {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
        });
      }
    },
    
    // Preload critical resources
    preloadCriticalResources: () => {
      const criticalResources = [
        { href: '/assets/css/bootstrap.min.css', as: 'style' },
        { href: '/assets/css/fontawesome.min.css', as: 'style' },
        { href: '/assets/img/logo.svg', as: 'image' }
      ];
      
      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        document.head.appendChild(link);
      });
    }
  }
};

// Push notifications
export const pushNotifications = {
  // Request notification permission
  requestPermission: async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },
  
  // Show notification
  show: (title, options = {}) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/assets/img/logo.svg',
        badge: '/assets/img/logo.svg',
        ...options
      });
    }
  },
  
  // Initialize push notifications
  init: async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          // Subscribe to push notifications
          const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'your-vapid-public-key' // Replace with actual key
          });
          // console.log('Push subscription created:', newSubscription);
        }
      } catch (error) {
        console.error('Push notification setup failed:', error);
      }
    }
  }
};

// App manifest
export const createManifest = () => {
  const manifest = {
    name: 'Parking Management System',
    short_name: 'ParkingApp',
    description: 'Smart parking solutions with real-time availability',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#dc3545',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/assets/img/logo.svg',
        sizes: '192x192',
        type: 'image/svg+xml'
      },
      {
        src: '/assets/img/logo.svg',
        sizes: '512x512',
        type: 'image/svg+xml'
      }
    ],
    categories: ['utilities', 'business'],
    lang: 'en',
    scope: '/'
  };
  
  return manifest;
};

// Background sync
export const backgroundSync = {
  // Register background sync
  register: async (tag, data) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      
      // Store data for sync
      if (data) {
        const cache = await caches.open('background-sync');
        await cache.put(tag, new Response(JSON.stringify(data)));
      }
    }
  },
  
  // Handle background sync
  handleSync: async (event) => {
    if (event.tag === 'parking-sync') {
      const cache = await caches.open('background-sync');
      const response = await cache.match('parking-sync');
      
      if (response) {
        const data = await response.json();
        // Process the data
        // console.log('Background sync data:', data);
        await cache.delete('parking-sync');
      }
    }
  }
};

// Initialize PWA features
export const initializePWA = async () => {
  // Register service worker
  await registerServiceWorker();
  
  // Initialize PWA installation
  pwaInstallation.init();
  
  // Initialize offline support
  offlineSupport.init();
  await offlineSupport.cacheCriticalResources();
  
  // Initialize mobile optimizations
  mobileOptimization.touchEvents.preventDoubleTapZoom();
  mobileOptimization.viewport.fixViewportHeight();
  mobileOptimization.viewport.handleOrientationChange();
  mobileOptimization.performance.lazyLoadImages();
  mobileOptimization.performance.preloadCriticalResources();
  
  // Initialize push notifications
  await pushNotifications.init();
  
  // console.log('PWA features initialized');
};

// Utility functions
const showUpdateNotification = () => {
  // Create update notification UI
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="update-content">
      <p>New version available!</p>
      <button onclick="window.location.reload()">Update</button>
    </div>
  `;
  document.body.appendChild(notification);
};

const showOnlineNotification = () => {
  // Show online status
  // console.log('Back online');
};

const showOfflineNotification = () => {
  // Show offline status
  // console.log('Offline mode');
};

const syncPendingData = () => {
  // Sync any data that was queued while offline
  // console.log('Syncing pending data');
};

const hideInstallButton = () => {
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'none';
  }
};

const showInstallButton = () => {
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
  }
};
