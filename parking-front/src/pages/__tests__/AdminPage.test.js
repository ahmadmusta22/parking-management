import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPage from '../AdminPage';

// Mock the auth store
const mockLogout = jest.fn();
jest.mock('../../store/authStore', () => ({
  __esModule: true,
  default: () => ({
    user: { id: 'admin', username: 'admin', role: 'admin', name: 'Admin User' },
    isAuthenticated: true,
    logout: mockLogout
  })
}));

// Mock the parking store
const mockAddAdminAuditEntry = jest.fn();
jest.mock('../../store/parkingStore', () => ({
  __esModule: true,
  default: () => ({
    adminAuditLog: [
      {
        id: 'audit1',
        adminId: 'admin',
        action: 'zone-open',
        targetType: 'zone',
        targetId: 'zone_a',
        timestamp: '2024-01-01T10:00:00Z',
        details: { open: true }
      },
      {
        id: 'audit2',
        adminId: 'admin',
        action: 'category-update',
        targetType: 'category',
        targetId: 'cat_premium',
        timestamp: '2024-01-01T09:00:00Z',
        details: { rateNormal: 5.0, rateSpecial: 8.0 }
      }
    ],
    addAdminAuditEntry: mockAddAdminAuditEntry
  })
}));

// Mock WebSocket service
jest.mock('../../services/websocket', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    on: jest.fn(),
    off: jest.fn()
  }
}));

// Mock the HeaderOne and FooterAreaOne components
jest.mock('../../components/HeaderOne', () => {
  return function MockHeaderOne() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../../components/FooterAreaOne', () => {
  return function MockFooterAreaOne() {
    return <div data-testid="footer">Footer</div>;
  };
});

// Mock the admin sub-components
jest.mock('../../components/parking/AdminEmployees', () => {
  return function MockAdminEmployees() {
    return <div data-testid="admin-employees">Admin Employees Component</div>;
  };
});

jest.mock('../../components/parking/AdminSubscriptions', () => {
  return function MockAdminSubscriptions() {
    return <div data-testid="admin-subscriptions">Admin Subscriptions Component</div>;
  };
});

jest.mock('../../components/parking/AdminReports', () => {
  return function MockAdminReports() {
    return <div data-testid="admin-reports">Admin Reports Component</div>;
  };
});

jest.mock('../../components/parking/AdminControlPanel', () => {
  return function MockAdminControlPanel() {
    return <div data-testid="admin-control-panel">Admin Control Panel Component</div>;
  };
});

jest.mock('../../helper/Preloader', () => {
  return function MockPreloader() {
    return <div data-testid="preloader">Loading...</div>;
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

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

  test('renders admin page with header and navigation tabs', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    // Wait for preloader to finish
    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Check for main elements
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Administrator: Admin User')).toBeInTheDocument();
    
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
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Check that employees tab is active and component is rendered
    const employeesTab = screen.getByText('Employees');
    expect(employeesTab.closest('button')).toHaveClass('active');
    expect(screen.getByTestId('admin-employees')).toBeInTheDocument();
  });

  test('switches between tabs correctly', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Click on Subscriptions tab
    const subscriptionsTab = screen.getByText('Subscriptions');
    fireEvent.click(subscriptionsTab);

    await waitFor(() => {
      expect(subscriptionsTab.closest('button')).toHaveClass('active');
      expect(screen.getByTestId('admin-subscriptions')).toBeInTheDocument();
    });

    // Click on Reports tab
    const reportsTab = screen.getByText('Parking Reports');
    fireEvent.click(reportsTab);

    await waitFor(() => {
      expect(reportsTab.closest('button')).toHaveClass('active');
      expect(screen.getByTestId('admin-reports')).toBeInTheDocument();
    });

    // Click on Control Panel tab
    const controlTab = screen.getByText('Control Panel');
    fireEvent.click(controlTab);

    await waitFor(() => {
      expect(controlTab.closest('button')).toHaveClass('active');
      expect(screen.getByTestId('admin-control-panel')).toBeInTheDocument();
    });
  });

  test('displays audit log with entries', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Click on Audit Log tab
    const auditTab = screen.getByText('Audit Log');
    fireEvent.click(auditTab);

    await waitFor(() => {
      expect(auditTab.closest('button')).toHaveClass('active');
    });

    // Check for audit log content
    expect(screen.getByText('Admin Audit Log')).toBeInTheDocument();
    expect(screen.getByText('Real-time updates from admin actions')).toBeInTheDocument();
    
    // Check for audit entries
    expect(screen.getByText('ZONE OPEN')).toBeInTheDocument();
    expect(screen.getByText('CATEGORY UPDATE')).toBeInTheDocument();
    expect(screen.getByText('zone: zone_a')).toBeInTheDocument();
    expect(screen.getByText('category: cat_premium')).toBeInTheDocument();
    expect(screen.getByText('Admin: admin')).toBeInTheDocument();
  });

  test('shows audit log badge with count', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Check for audit log badge
    const auditTab = screen.getByText('Audit Log');
    const badge = auditTab.parentElement.querySelector('.badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('2'); // Mock has 2 audit entries
  });

  test('handles logout functionality', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Click logout button
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Check that logout was called and navigation occurred
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('sets up WebSocket connection for admin updates', async () => {
    const wsService = require('../../services/websocket').default;
    
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Check that WebSocket service was called
    expect(wsService.connect).toHaveBeenCalled();
    expect(wsService.on).toHaveBeenCalledWith('admin-update', expect.any(Function));
  });

  test('handles admin update WebSocket messages', async () => {
    const wsService = require('../../services/websocket').default;
    
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Get the admin-update handler
    const adminUpdateHandler = wsService.on.mock.calls.find(
      call => call[0] === 'admin-update'
    )[1];

    // Simulate an admin update message
    const mockAdminData = {
      adminId: 'admin',
      action: 'zone-close',
      targetType: 'zone',
      targetId: 'zone_b',
      details: { open: false }
    };

    adminUpdateHandler(mockAdminData);

    // Check that addAdminAuditEntry was called
    expect(mockAddAdminAuditEntry).toHaveBeenCalledWith(mockAdminData);
  });

  test('redirects non-admin users to login', async () => {
    // Mock non-admin user
    jest.doMock('../../store/authStore', () => ({
      __esModule: true,
      default: () => ({
        user: { id: 'emp1', username: 'emp1', role: 'employee' },
        isAuthenticated: true,
        logout: mockLogout
      })
    }));

    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    // Check that navigation to login occurred
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('redirects unauthenticated users to login', async () => {
    // Mock unauthenticated user
    jest.doMock('../../store/authStore', () => ({
      __esModule: true,
      default: () => ({
        user: null,
        isAuthenticated: false,
        logout: mockLogout
      })
    }));

    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    // Check that navigation to login occurred
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows preloader initially', () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    // Check that preloader is shown initially
    expect(screen.getByTestId('preloader')).toBeInTheDocument();
  });

  test('displays audit log details correctly', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Click on Audit Log tab
    const auditTab = screen.getByText('Audit Log');
    fireEvent.click(auditTab);

    await waitFor(() => {
      expect(auditTab.closest('button')).toHaveClass('active');
    });

    // Check for specific audit details
    expect(screen.getByText('open: true')).toBeInTheDocument();
    expect(screen.getByText('rateNormal: 5')).toBeInTheDocument();
    expect(screen.getByText('rateSpecial: 8')).toBeInTheDocument();
  });

  test('formats timestamps correctly in audit log', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Click on Audit Log tab
    const auditTab = screen.getByText('Audit Log');
    fireEvent.click(auditTab);

    await waitFor(() => {
      expect(auditTab.closest('button')).toHaveClass('active');
    });

    // Check that timestamps are displayed (format will depend on locale)
    const timestamps = screen.getAllByText(/1\/1\/2024/);
    expect(timestamps.length).toBeGreaterThan(0);
  });

  test('shows correct badge colors for different action types', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Click on Audit Log tab
    const auditTab = screen.getByText('Audit Log');
    fireEvent.click(auditTab);

    await waitFor(() => {
      expect(auditTab.closest('button')).toHaveClass('active');
    });

    // Check for badge classes
    const zoneBadge = screen.getByText('ZONE OPEN');
    const categoryBadge = screen.getByText('CATEGORY UPDATE');
    
    expect(zoneBadge).toHaveClass('bg-primary');
    expect(categoryBadge).toHaveClass('bg-info');
  });
});


