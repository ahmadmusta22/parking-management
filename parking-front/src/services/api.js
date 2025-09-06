import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
