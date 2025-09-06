import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPage from '../../pages/AdminPage';

// Mock the API services
jest.mock('../../../services/api', () => ({
  adminAPI: {
    getParkingStateReport: jest.fn(),
    updateZoneOpen: jest.fn(),
    updateCategory: jest.fn(),
    createRushHour: jest.fn(),
    createVacation: jest.fn()
  },
  masterAPI: {
    getZones: jest.fn(),
    getCategories: jest.fn()
  }
}));

// Mock WebSocket service
jest.mock('../../../services/websocket', () => ({
  connect: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
}));

// Mock auth store
jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: () => ({
    user: { id: 'admin', username: 'admin', role: 'admin' },
    isAuthenticated: true,
    logout: jest.fn()
  })
}));

// Mock parking store
jest.mock('../../../store/parkingStore', () => ({
  __esModule: true,
  default: () => ({
    adminAuditLog: [],
    addAdminAuditEntry: jest.fn()
  })
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders admin dashboard with navigation tabs', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Check for navigation tabs
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('Parking Reports')).toBeInTheDocument();
    expect(screen.getByText('Control Panel')).toBeInTheDocument();
    expect(screen.getByText('Audit Log')).toBeInTheDocument();
  });

  test('shows employees tab by default', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Should show employees content
    expect(screen.getByText('Employee Management')).toBeInTheDocument();
    expect(screen.getByText('Available Users (from seed data)')).toBeInTheDocument();
  });

  test('switches to parking reports tab', async () => {
    const mockAdminAPI = require('../../../services/api').adminAPI;
    
    mockAdminAPI.getParkingStateReport.mockResolvedValueOnce({
      data: {
        zones: [
          {
            id: 'zone_a',
            name: 'Zone A',
            categoryId: 'premium',
            totalSlots: 100,
            occupied: 60,
            free: 40,
            reserved: 15,
            availableForVisitors: 25,
            availableForSubscribers: 40,
            subscriberCount: 5,
            rateNormal: 5.0,
            rateSpecial: 8.0,
            open: true
          }
        ]
      }
    });

    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Click on parking reports tab
    const reportsTab = screen.getByText('Parking Reports');
    fireEvent.click(reportsTab);

    // Should show parking reports
    await waitFor(() => {
      expect(screen.getByText('Parking State Report')).toBeInTheDocument();
      expect(screen.getByText('Zone Status Overview')).toBeInTheDocument();
    });

    // Check for zone data
    expect(screen.getByText('Zone A')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // Total slots
    expect(screen.getByText('60')).toBeInTheDocument(); // Occupied
    expect(screen.getByText('40')).toBeInTheDocument(); // Free
  });

  test('switches to control panel tab', async () => {
    const mockMasterAPI = require('../../../services/api').masterAPI;
    
    mockMasterAPI.getZones.mockResolvedValueOnce({
      data: [
        {
          id: 'zone_a',
          name: 'Zone A',
          totalSlots: 100,
          occupied: 60,
          open: true
        }
      ]
    });

    mockMasterAPI.getCategories.mockResolvedValueOnce({
      data: [
        {
          id: 'premium',
          name: 'Premium',
          rateNormal: 5.0,
          rateSpecial: 8.0
        }
      ]
    });

    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Click on control panel tab
    const controlTab = screen.getByText('Control Panel');
    fireEvent.click(controlTab);

    // Should show control panel
    await waitFor(() => {
      expect(screen.getByText('Control Panel')).toBeInTheDocument();
      expect(screen.getByText('Zone Control')).toBeInTheDocument();
      expect(screen.getByText('Category Rates')).toBeInTheDocument();
    });

    // Check for zone and category data
    expect(screen.getByText('Zone A')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  test('switches to audit log tab', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Click on audit log tab
    const auditTab = screen.getByText('Audit Log');
    fireEvent.click(auditTab);

    // Should show audit log
    await waitFor(() => {
      expect(screen.getByText('Admin Audit Log')).toBeInTheDocument();
    });

    // Should show empty state
    expect(screen.getByText('No admin actions yet')).toBeInTheDocument();
  });

  test('shows admin user information in header', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Check for admin user info
    expect(screen.getByText('Administrator: admin')).toBeInTheDocument();
  });

  test('has logout functionality', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Check for logout button
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('shows subscriptions tab content', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Click on subscriptions tab
    const subscriptionsTab = screen.getByText('Subscriptions');
    fireEvent.click(subscriptionsTab);

    // Should show subscriptions content
    await waitFor(() => {
      expect(screen.getByText('Subscription Management')).toBeInTheDocument();
    });
  });
});

