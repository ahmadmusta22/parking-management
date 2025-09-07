import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import OfflineIndicator from './components/OfflineIndicator';
import { initializePerformanceMonitoring } from './utils/performance';
import { initializeAccessibility } from './utils/accessibility';
import { initializeAllCompatibility } from './utils/browserCompatibility';
import { initializePWA } from './utils/pwa';
import { initializeErrorTracking, ErrorBoundary } from './utils/errorTracking';
import HomePageOne from "./pages/HomePageOne";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import AnimatedScrollToTop from "./components/AnimatedScrollToTop";
import ToastProvider from "./components/ToastProvider";
// Parking System Pages
import LoginPage from "./pages/LoginPage";
import GatePage from "./pages/GatePage";
import CheckpointPage from "./pages/CheckpointPage";
import AdminPage from "./pages/AdminPage";
import ProtectedAdminRoute from "./components/parking/ProtectedAdminRoute";
// Additional Pages
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { initializeAuth } = useAuthStore();

  // Initialize authentication state on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Initialize all advanced features
  useEffect(() => {
    // Initialize core features
    initializePerformanceMonitoring();
    initializeAccessibility();
    initializeAllCompatibility();
    initializeErrorTracking();
    
    // Initialize PWA features
    initializePWA();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OfflineIndicator />
          <RouteScrollToTop />
          <AnimatedScrollToTop />
          <ToastProvider />
          <Routes>
          {/* Main Landing Page */}
          <Route exact path="/" element={<HomePageOne />} />
          
          {/* Additional Pages */}
          <Route exact path="/about" element={<AboutPage />} />
          <Route exact path="/contact" element={<ContactPage />} />
          
          {/* Parking System Routes */}
          <Route exact path="/login" element={<LoginPage />} />
          <Route exact path="/gate/:gateId" element={<GatePage />} />
          <Route exact path="/checkpoint" element={<CheckpointPage />} />
          <Route exact path="/admin" element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          } />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
