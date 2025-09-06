import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { secureStorage, sanitizeInput, validateEmail } from '../utils/security';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // Input validation and sanitization
          const sanitizedCredentials = {
            username: sanitizeInput(credentials.username),
            password: sanitizeInput(credentials.password)
          };
          
          // Basic validation
          if (!sanitizedCredentials.username || !sanitizedCredentials.password) {
            throw new Error('Username and password are required');
          }
          
          const { authAPI } = await import('../services/api');
          const response = await authAPI.login(sanitizedCredentials);
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          // Store token and user securely
          secureStorage.setItem('authToken', token);
          secureStorage.setItem('user', user);
          
          // Also store in localStorage for API interceptor compatibility
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          console.log('AuthStore: Login successful, returning user:', user);
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage
          });
          console.log('AuthStore: Login failed:', errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        
        // Clear all storage securely
        secureStorage.clear();
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.clear();
      },

      clearError: () => set({ error: null }),

      // Initialize auth state from localStorage
      initializeAuth: () => {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          try {
            const parsedUser = JSON.parse(user);
            set({
              user: parsedUser,
              token,
              isAuthenticated: true
            });
          } catch (error) {
            // Invalid stored data, clear it
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
