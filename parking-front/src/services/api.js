import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with security configurations
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false, // Disable credentials for security
});

// Request interceptor to add auth token and security headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add security headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    
    // Add request timestamp for security
    config.headers['X-Request-Time'] = Date.now().toString();
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and security
api.interceptors.response.use(
  (response) => {
    // Log successful responses for monitoring
    console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Enhanced error handling with security considerations
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    });

    if (error.response?.status === 401) {
      // Clear sensitive data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Redirect to login with security
      window.location.replace('/login');
    } else if (error.response?.status === 403) {
      console.warn('Access forbidden - insufficient permissions');
    } else if (error.response?.status >= 500) {
      console.error('Server error - please try again later');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
};

// Master data API
export const masterAPI = {
  getGates: () => api.get('/master/gates'),
  getZones: (gateId) => api.get(`/master/zones?gateId=${gateId}`),
  getCategories: () => api.get('/master/categories'),
};

// Subscriptions API
export const subscriptionAPI = {
  getSubscription: (id) => api.get(`/subscriptions/${id}`),
};

// Tickets API
export const ticketAPI = {
  checkin: (data) => api.post('/tickets/checkin', data),
  checkout: (data) => api.post('/tickets/checkout', data),
  getTicket: (id) => api.get(`/tickets/${id}`),
};

// Admin API
export const adminAPI = {
  // Reports
  getParkingStateReport: () => api.get('/admin/reports/parking-state'),
  
  // Categories
  getCategories: () => api.get('/master/categories'),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  
  // Zones
  updateZoneOpen: (id, data) => api.put(`/admin/zones/${id}/open`, data),
  
  // Rush hours (only create is available in backend)
  createRushHour: (data) => api.post('/admin/rush-hours', data),
  
  // Vacations (only create is available in backend)
  createVacation: (data) => api.post('/admin/vacations', data),
  
  // Subscriptions
  getSubscriptions: () => api.get('/admin/subscriptions'),
  createSubscription: (data) => api.post('/admin/subscriptions', data),
  
  // Users
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
};

export default api;
