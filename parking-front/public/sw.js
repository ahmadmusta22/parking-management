/**
 * Service Worker for Parking Management System
 */

const CACHE_NAME = 'parking-app-v1';
const CRITICAL_RESOURCES = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/assets/img/logo.svg',
  '/assets/css/bootstrap.min.css',
  '/assets/css/fontawesome.min.css'
];

const API_CACHE_NAME = 'parking-api-v1';
const API_ENDPOINTS = [
  '/api/v1/master/gates',
  '/api/v1/master/categories'
];

// Install event
self.addEventListener('install', (event) => {
  // console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // console.log('Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        // console.log('Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        // console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  // console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              // console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }
  
  // Handle static resources
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script') {
    event.respondWith(handleStaticResource(request));
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }
  
  // Default: try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Handle API requests with cache-first strategy
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Return cached response and update in background
    fetch(request)
      .then((response) => {
        if (response.ok && request.method === 'GET') {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {
        // Network failed, keep using cached version
      });
    
    return cachedResponse;
  }
  
  // No cache, fetch from network
  try {
    const response = await fetch(request);
    // Only cache GET requests (Cache API doesn't support PUT/POST/DELETE)
    if (response.ok && request.method === 'GET') {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // console.error('API request failed:', error);
    return new Response(
      JSON.stringify({ error: 'Network unavailable' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle static resources with cache-first strategy
async function handleStaticResource(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // console.error('Static resource fetch failed:', error);
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match('/');
  
  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return cached index.html for offline navigation
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('App not available offline', { status: 503 });
  }
}

// Background sync
self.addEventListener('sync', (event) => {
  // console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'parking-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  try {
    const cache = await caches.open('background-sync');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
          // console.log('Background sync successful for:', request.url);
        }
      } catch (error) {
        // console.error('Background sync failed for:', request.url, error);
      }
    }
  } catch (error) {
    // console.error('Background sync error:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  // console.log('Push notification received');
  
  const options = {
    body: 'New parking update available',
    icon: '/assets/img/logo.svg',
    badge: '/assets/img/logo.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/assets/img/icon/check.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/img/icon/close.svg'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Parking System', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  // console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling
self.addEventListener('message', (event) => {
  // console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Error handling
self.addEventListener('error', (event) => {
  // console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  // console.error('Service Worker unhandled rejection:', event.reason);
});
