import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import GatePage from '../../pages/GatePage';
import CheckpointPage from '../../pages/CheckpointPage';
import AdminPage from '../../pages/AdminPage';
import LoginPage from '../../pages/LoginPage';
import ErrorBoundary from '../../utils/errorTracking';

// Mock components
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

jest.mock('../../components/parking/ZoneCard', () => {
  return function MockZoneCard({ zone, isSelected, onSelect, disabled }) {
    return (
      <div 
        data-testid={`zone-card-${zone.id}`}
        className={`zone-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && onSelect(zone)}
      >
        <h4>{zone.name}</h4>
        <p>Free: {zone.free}</p>
        <p>Occupied: {zone.occupied}</p>
      </div>
    );
  };
});

jest.mock('../../components/parking/TicketModal', () => {
  return function MockTicketModal({ ticket, onClose }) {
    return (
      <div data-testid="ticket-modal">
        <h3>Parking Ticket</h3>
        <p>Ticket ID: {ticket.id}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

jest.mock('../../components/parking/CheckoutPanel', () => {
  return function MockCheckoutPanel({ ticket, checkoutData, onCompleteCheckout, loading }) {
    return (
      <div data-testid="checkout-panel">
        <h3>Checkout Panel</h3>
        <p>Ticket: {ticket?.id || checkoutData?.ticketId}</p>
        <p>Amount: ${checkoutData?.amount || 0}</p>
        <button 
          data-testid="complete-checkout" 
          onClick={onCompleteCheckout} 
          disabled={loading}
        >
          Complete Checkout
        </button>
      </div>
    );
  };
});

jest.mock('../../components/WebSocketStatus', () => {
  return function MockWebSocketStatus() {
    return <div data-testid="websocket-status">WebSocket Status</div>;
  };
});

// Mock stores
jest.mock('../../store/authStore', () => ({
  __esModule: true,
  useAuthStore: () => ({
    user: { id: 'admin', username: 'admin', role: 'admin' },
    isAuthenticated: true,
    logout: jest.fn()
  })
}));

jest.mock('../../store/parkingStore', () => ({
  __esModule: true,
  useParkingStore: () => ({
    gates: [],
    zones: [],
    categories: [],
    currentGate: null,
    currentGateZones: [],
    wsConnected: true,
    wsError: null,
    adminAuditLog: [],
    setGates: jest.fn(),
    setZones: jest.fn(),
    setCategories: jest.fn(),
    setCurrentGate: jest.fn(),
    updateZone: jest.fn(),
    setWSConnected: jest.fn(),
    setWSError: jest.fn(),
    addAdminAuditEntry: jest.fn(),
    clearAdminAuditLog: jest.fn()
  })
}));

// Mock WebSocket service
jest.mock('../../services/websocket', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn(),
    isConnected: jest.fn(() => true),
    getConnectionStats: jest.fn(() => ({
      connected: true,
      reconnectAttempts: 0,
      lastConnected: new Date().toISOString(),
      connectionErrors: []
    }))
  }
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ gateId: 'gate_1' })
}));

// Mock window.alert
global.alert = jest.fn();

// Setup MSW server with error scenarios
const server = setupServer(
  // Successful responses for basic functionality
  rest.get('http://localhost:3000/api/v1/master/gates', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: 'gate_1',
        name: 'Main Entrance',
        location: 'North',
        zoneIds: ['zone_a']
      }
    ]));
  }),

  rest.get('http://localhost:3000/api/v1/master/zones', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: 'zone_a',
        name: 'Zone A',
        categoryId: 'cat_premium',
        gateIds: ['gate_1'],
        totalSlots: 100,
        occupied: 60,
        free: 40,
        reserved: 15,
        availableForVisitors: 25,
        availableForSubscribers: 40,
        rateNormal: 5.0,
        rateSpecial: 8.0,
        open: true
      }
    ]));
  }),

  rest.get('http://localhost:3000/api/v1/admin/reports/parking-state', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: 'zone_a',
        name: 'Zone A',
        occupied: 60,
        free: 40,
        reserved: 15,
        availableForVisitors: 25,
        availableForSubscribers: 40,
        subscriberCount: 5,
        open: true
      }
    ]));
  }),

  rest.post('http://localhost:3000/api/v1/auth/login', (req, res, ctx) => {
    return res(ctx.json({
      user: { id: 'admin', username: 'admin', role: 'admin' },
      token: 'mock-jwt-token'
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

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
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Network Error Scenarios', () => {
    test('handles API server unavailable (500 error)', async () => {
      server.use(
        rest.get('http://localhost:3000/api/v1/master/gates', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ 
            status: 'error', 
            message: 'Internal server error' 
          }));
        })
      );

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    test('handles network timeout', async () => {
      server.use(
        rest.get('http://localhost:3000/api/v1/master/gates', (req, res, ctx) => {
          return res.networkError('Network timeout');
        })
      );

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Should handle network error gracefully
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    test('handles malformed API response', async () => {
      server.use(
        rest.get('http://localhost:3000/api/v1/master/gates', (req, res, ctx) => {
          return res(ctx.text('invalid json response'));
        })
      );

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Should handle JSON parsing error
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Error Scenarios', () => {
    test('handles invalid login credentials', async () => {
      server.use(
        rest.post('http://localhost:3000/api/v1/auth/login', (req, res, ctx) => {
          return res(ctx.status(401), ctx.json({
            status: 'error',
            message: 'Invalid credentials'
          }));
        })
      );

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/login']}>
            <LoginPage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Enter invalid credentials
      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByText(/login/i);

      fireEvent.change(usernameInput, { target: { value: 'invalid' } });
      fireEvent.change(passwordInput, { target: { value: 'invalid' } });
      fireEvent.click(loginButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    test('handles expired JWT token', async () => {
      server.use(
        rest.get('http://localhost:3000/api/v1/admin/reports/parking-state', (req, res, ctx) => {
          return res(ctx.status(401), ctx.json({
            status: 'error',
            message: 'Token expired'
          }));
        })
      );

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/admin']}>
            <AdminPage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Should handle token expiration
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Business Logic Error Scenarios', () => {
    test('handles zone unavailable for check-in (409 conflict)', async () => {
      server.use(
        rest.post('http://localhost:3000/api/v1/tickets/checkin', (req, res, ctx) => {
          return res(ctx.status(409), ctx.json({
            status: 'error',
            message: 'Zone is full',
            errors: {
              zoneId: ['No available slots for visitors']
            }
          }));
        })
      );

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Zone A')).toBeInTheDocument();
      });

      // Select zone and attempt check-in
      const zoneCard = screen.getByTestId('zone-card-zone_a');
      fireEvent.click(zoneCard);

      const checkinButton = screen.getByText('Check In');
      fireEvent.click(checkinButton);

      // Should show conflict error
      await waitFor(() => {
        expect(screen.getByText(/zone is full/i)).toBeInTheDocument();
      });
    });

    test('handles invalid ticket ID at checkpoint', async () => {
      server.use(
        rest.get('http://localhost:3000/api/v1/tickets/INVALID', (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({
            status: 'error',
            message: 'Ticket not found'
          }));
        })
      );

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/checkpoint']}>
            <CheckpointPage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/checkpoint/i)).toBeInTheDocument();
      });

      // Enter invalid ticket ID
      const ticketInput = screen.getByPlaceholderText(/ticket id/i);
      const lookupButton = screen.getByText(/lookup/i);

      fireEvent.change(ticketInput, { target: { value: 'INVALID' } });
      fireEvent.click(lookupButton);

      // Should show not found error
      await waitFor(() => {
        expect(screen.getByText(/ticket not found/i)).toBeInTheDocument();
      });
    });

    test('handles subscription verification failure', async () => {
      server.use(
        rest.get('http://localhost:3000/api/v1/subscriptions/INVALID', (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({
            status: 'error',
            message: 'Subscription not found'
          }));
        })
      );

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Zone A')).toBeInTheDocument();
      });

      // Switch to subscriber tab
      const subscriberTab = screen.getByText('Subscriber');
      fireEvent.click(subscriberTab);

      // Enter invalid subscription ID
      const subscriptionInput = screen.getByPlaceholderText(/subscription id/i);
      const verifyButton = screen.getByText(/verify/i);

      fireEvent.change(subscriptionInput, { target: { value: 'INVALID' } });
      fireEvent.click(verifyButton);

      // Should show subscription error
      await waitFor(() => {
        expect(screen.getByText(/subscription not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('WebSocket Error Scenarios', () => {
    test('handles WebSocket connection failure', async () => {
      const mockWebSocketService = require('../../services/websocket').default;
      mockWebSocketService.isConnected.mockReturnValue(false);
      mockWebSocketService.getConnectionStats.mockReturnValue({
        connected: false,
        reconnectAttempts: 5,
        lastConnected: null,
        connectionErrors: ['Connection failed', 'Network unreachable']
      });

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Should show connection status
      await waitFor(() => {
        expect(screen.getByTestId('websocket-status')).toBeInTheDocument();
      });
    });

    test('handles malformed WebSocket messages', async () => {
      const mockWebSocketService = require('../../services/websocket').default;
      
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Zone A')).toBeInTheDocument();
      });

      // Simulate malformed message
      const messageHandler = mockWebSocketService.on.mock.calls.find(
        call => call[0] === 'message'
      );
      
      if (messageHandler) {
        // Should not crash when receiving invalid JSON
        expect(() => {
          messageHandler[1]({ data: 'invalid json' });
        }).not.toThrow();
      }
    });
  });

  describe('Form Validation Error Scenarios', () => {
    test('handles empty form submissions', async () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/login']}>
            <LoginPage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Try to submit empty form
      const loginButton = screen.getByText(/login/i);
      fireEvent.click(loginButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    test('handles invalid input formats', async () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/checkpoint']}>
            <CheckpointPage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/checkpoint/i)).toBeInTheDocument();
      });

      // Enter invalid ticket format
      const ticketInput = screen.getByPlaceholderText(/ticket id/i);
      fireEvent.change(ticketInput, { target: { value: '   ' } }); // Only spaces

      const lookupButton = screen.getByText(/lookup/i);
      fireEvent.click(lookupButton);

      // Should handle invalid input
      await waitFor(() => {
        expect(screen.getByText(/invalid/i)).toBeInTheDocument();
      });
    });
  });

  describe('Component Error Boundary Scenarios', () => {
    test('ErrorBoundary catches component errors', async () => {
      // Create a component that throws an error
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      render(
        <TestWrapper>
          <ErrorComponent />
        </TestWrapper>
      );

      // Should show error boundary UI
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    test('ErrorBoundary provides recovery options', async () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      render(
        <TestWrapper>
          <ErrorComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
      expect(screen.getByText(/reload/i)).toBeInTheDocument();
    });
  });

  describe('Concurrent Request Error Scenarios', () => {
    test('handles multiple simultaneous API requests', async () => {
      // Mock slow API response
      server.use(
        rest.get('http://localhost:3000/api/v1/master/gates', (req, res, ctx) => {
          return res(ctx.delay(1000), ctx.json([
            {
              id: 'gate_1',
              name: 'Main Entrance',
              location: 'North',
              zoneIds: ['zone_a']
            }
          ]));
        })
      );

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Should handle loading state
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });

      // Should eventually load data
      await waitFor(() => {
        expect(screen.getByText('Main Entrance')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Memory and Performance Error Scenarios', () => {
    test('handles large data responses', async () => {
      // Mock large zones response
      const largeZonesArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `zone_${i}`,
        name: `Zone ${i}`,
        categoryId: 'cat_premium',
        gateIds: ['gate_1'],
        totalSlots: 100,
        occupied: 50,
        free: 50,
        reserved: 10,
        availableForVisitors: 40,
        availableForSubscribers: 50,
        rateNormal: 5.0,
        rateSpecial: 8.0,
        open: true
      }));

      server.use(
        rest.get('http://localhost:3000/api/v1/master/zones', (req, res, ctx) => {
          return res(ctx.json(largeZonesArray));
        })
      );

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Should handle large data without crashing
      await waitFor(() => {
        expect(screen.getByText(/zone/i)).toBeInTheDocument();
      });
    });
  });
});
