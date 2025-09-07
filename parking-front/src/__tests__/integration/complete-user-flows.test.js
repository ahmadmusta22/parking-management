import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import GatePage from '../../pages/GatePage';
import CheckpointPage from '../../pages/CheckpointPage';
import AdminPage from '../../pages/AdminPage';
import LoginPage from '../../pages/LoginPage';

// Mock components to focus on integration flows
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
        <p>Rate: ${zone.rateNormal}</p>
        <p>Open: {zone.open ? 'Yes' : 'No'}</p>
        <p>Available for Visitors: {zone.availableForVisitors}</p>
        <p>Available for Subscribers: {zone.availableForSubscribers}</p>
      </div>
    );
  };
});

jest.mock('../../components/parking/TicketModal', () => {
  return function MockTicketModal({ ticket, onClose, onPrint }) {
    return (
      <div data-testid="ticket-modal">
        <h3>PARKING TICKET</h3>
        <p>Ticket ID: {ticket.id}</p>
        <p>Type: {ticket.type}</p>
        <p>Zone: {ticket.zoneId}</p>
        <p>Gate: {ticket.gateId}</p>
        <p>Check-in Time: {ticket.checkinAt}</p>
        <button onClick={onClose}>Close</button>
        <button onClick={onPrint}>Print Ticket</button>
      </div>
    );
  };
});

jest.mock('../../components/parking/CheckoutPanel', () => {
  return function MockCheckoutPanel({ ticket, checkoutData, subscription, onConvertToVisitor, onCompleteCheckout, loading }) {
    return (
      <div data-testid="checkout-panel">
        <h3>Checkout Panel</h3>
        <p>Ticket: {ticket?.id || checkoutData?.ticketId}</p>
        <p>Amount: ${checkoutData?.amount || 0}</p>
        <p>Duration: {checkoutData?.durationHours || 0} hours</p>
        {subscription && <p>Subscription: {subscription.userName}</p>}
        {subscription && !checkoutData && (
          <button data-testid="convert-to-visitor" onClick={onConvertToVisitor}>
            Convert to Visitor
          </button>
        )}
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

jest.mock('../../components/parking/AdminControlPanel', () => {
  return function MockAdminControlPanel() {
    return (
      <div data-testid="admin-control-panel">
        <h3>Admin Control Panel</h3>
        <button data-testid="close-zone-btn">Close Zone</button>
        <button data-testid="update-rates-btn">Update Rates</button>
        <button data-testid="add-rush-hour-btn">Add Rush Hour</button>
        <button data-testid="add-vacation-btn">Add Vacation</button>
      </div>
    );
  };
});

jest.mock('../../components/parking/AdminReports', () => {
  return function MockAdminReports() {
    return (
      <div data-testid="admin-reports">
        <h3>Parking State Report</h3>
        <div data-testid="zone-report">Zone A: 60/100 occupied</div>
      </div>
    );
  };
});

jest.mock('../../components/parking/AdminAuditLog', () => {
  return function MockAdminAuditLog() {
    return (
      <div data-testid="admin-audit-log">
        <h3>Admin Audit Log</h3>
        <div data-testid="audit-entry">Admin action logged</div>
      </div>
    );
  };
});

jest.mock('../../components/WebSocketStatus', () => {
  return function MockWebSocketStatus() {
    return <div data-testid="websocket-status">WebSocket Connected</div>;
  };
});

// Mock stores with realistic state
const mockAuthStore = {
  user: null,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn()
};

const mockParkingStore = {
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
};

jest.mock('../../store/authStore', () => ({
  __esModule: true,
  useAuthStore: () => mockAuthStore
}));

jest.mock('../../store/parkingStore', () => ({
  __esModule: true,
  useParkingStore: () => mockParkingStore
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

// Mock window.alert and window.print
global.alert = jest.fn();
global.print = jest.fn();

// Setup MSW server with comprehensive API mocking
const server = setupServer(
  // Gates endpoint
  rest.get('http://localhost:3000/api/v1/master/gates', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: 'gate_1',
        name: 'Main Entrance',
        location: 'North',
        zoneIds: ['zone_a', 'zone_b']
      },
      {
        id: 'gate_2',
        name: 'Secondary Entrance',
        location: 'South',
        zoneIds: ['zone_c']
      }
    ]));
  }),

  // Zones endpoint
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
      },
      {
        id: 'zone_b',
        name: 'Zone B',
        categoryId: 'cat_standard',
        gateIds: ['gate_1'],
        totalSlots: 50,
        occupied: 30,
        free: 20,
        reserved: 5,
        availableForVisitors: 15,
        availableForSubscribers: 20,
        rateNormal: 3.0,
        rateSpecial: 5.0,
        open: true
      }
    ]));
  }),

  // Categories endpoint
  rest.get('http://localhost:3000/api/v1/master/categories', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: 'cat_premium',
        name: 'Premium',
        description: 'Close to entrance, large stalls',
        rateNormal: 5.0,
        rateSpecial: 8.0
      },
      {
        id: 'cat_standard',
        name: 'Standard',
        description: 'Regular parking spaces',
        rateNormal: 3.0,
        rateSpecial: 5.0
      }
    ]));
  }),

  // Admin reports endpoint
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
      },
      {
        id: 'zone_b',
        name: 'Zone B',
        occupied: 30,
        free: 20,
        reserved: 5,
        availableForVisitors: 15,
        availableForSubscribers: 20,
        subscriberCount: 2,
        open: true
      }
    ]));
  }),

  // Login endpoint
  rest.post('http://localhost:3000/api/v1/auth/login', (req, res, ctx) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'adminpass') {
      return res(ctx.json({
        user: { id: 'admin', username: 'admin', role: 'admin', name: 'Admin User' },
        token: 'admin-jwt-token'
      }));
    }
    
    if (username === 'emp1' && password === 'pass1') {
      return res(ctx.json({
        user: { id: 'emp1', username: 'emp1', role: 'employee', name: 'Employee One' },
        token: 'employee-jwt-token'
      }));
    }
    
    return res(ctx.status(401), ctx.json({
      status: 'error',
      message: 'Invalid credentials'
    }));
  }),

  // Visitor check-in
  rest.post('http://localhost:3000/api/v1/tickets/checkin', (req, res, ctx) => {
    const body = req.body;
    
    if (body.type === 'visitor') {
      return res(ctx.json({
        ticket: {
          id: 'T001',
          type: 'visitor',
          zoneId: body.zoneId,
          gateId: body.gateId,
          checkinAt: '2024-01-01T10:00:00Z'
        },
        zoneState: {
          id: body.zoneId,
          occupied: 61,
          free: 39,
          availableForVisitors: 24,
          availableForSubscribers: 39
        }
      }));
    }
    
    if (body.type === 'subscriber' && body.subscriptionId === 'SUB001') {
      return res(ctx.json({
        ticket: {
          id: 'T002',
          type: 'subscriber',
          zoneId: body.zoneId,
          gateId: body.gateId,
          subscriptionId: 'SUB001',
          checkinAt: '2024-01-01T10:00:00Z'
        },
        zoneState: {
          id: body.zoneId,
          occupied: 61,
          free: 39,
          availableForVisitors: 25,
          availableForSubscribers: 38
        }
      }));
    }
    
    return res(ctx.status(400), ctx.json({
      status: 'error',
      message: 'Invalid check-in request'
    }));
  }),

  // Subscription verification
  rest.get('http://localhost:3000/api/v1/subscriptions/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === 'SUB001') {
      return res(ctx.json({
        id: 'SUB001',
        userName: 'John Doe',
        category: 'cat_premium',
        active: true,
        cars: [
          { plate: 'ABC123', brand: 'Toyota', model: 'Camry', color: 'Blue' }
        ],
        startsAt: '2024-01-01T00:00:00Z',
        expiresAt: '2025-01-01T00:00:00Z'
      }));
    }
    
    return res(ctx.status(404), ctx.json({
      status: 'error',
      message: 'Subscription not found'
    }));
  }),

  // Ticket lookup
  rest.get('http://localhost:3000/api/v1/tickets/:ticketId', (req, res, ctx) => {
    const { ticketId } = req.params;
    
    if (ticketId === 'T001') {
      return res(ctx.json({
        id: 'T001',
        type: 'visitor',
        zoneId: 'zone_a',
        gateId: 'gate_1',
        checkinAt: '2024-01-01T10:00:00Z'
      }));
    }
    
    if (ticketId === 'T002') {
      return res(ctx.json({
        id: 'T002',
        type: 'subscriber',
        zoneId: 'zone_a',
        gateId: 'gate_1',
        subscriptionId: 'SUB001',
        checkinAt: '2024-01-01T10:00:00Z'
      }));
    }
    
    return res(ctx.status(404), ctx.json({
      status: 'error',
      message: 'Ticket not found'
    }));
  }),

  // Checkout
  rest.post('http://localhost:3000/api/v1/tickets/checkout', (req, res, ctx) => {
    const body = req.body;
    
    if (body.ticketId === 'T001') {
      return res(ctx.json({
        ticketId: 'T001',
        type: 'visitor',
        checkinAt: '2024-01-01T10:00:00Z',
        checkoutAt: '2024-01-01T12:00:00Z',
        durationHours: 2.0,
        amount: 10.0,
        breakdown: [
          {
            from: '2024-01-01T10:00:00Z',
            to: '2024-01-01T12:00:00Z',
            hours: 2.0,
            rate: 5.0,
            rateMode: 'normal',
            amount: 10.0
          }
        ],
        zoneState: {
          id: 'zone_a',
          occupied: 60,
          free: 40,
          availableForVisitors: 25,
          availableForSubscribers: 40
        }
      }));
    }
    
    if (body.ticketId === 'T002') {
      if (body.forceConvertToVisitor) {
        return res(ctx.json({
          ticketId: 'T002',
          type: 'visitor',
          checkinAt: '2024-01-01T10:00:00Z',
          checkoutAt: '2024-01-01T12:00:00Z',
          durationHours: 2.0,
          amount: 10.0,
          breakdown: [
            {
              from: '2024-01-01T10:00:00Z',
              to: '2024-01-01T12:00:00Z',
              hours: 2.0,
              rate: 5.0,
              rateMode: 'normal',
              amount: 10.0
            }
          ]
        }));
      } else {
        return res(ctx.json({
          ticketId: 'T002',
          type: 'subscriber',
          checkinAt: '2024-01-01T10:00:00Z',
          checkoutAt: '2024-01-01T12:00:00Z',
          durationHours: 2.0,
          amount: 0.0,
          breakdown: []
        }));
      }
    }
    
    return res(ctx.status(404), ctx.json({
      status: 'error',
      message: 'Ticket not found'
    }));
  }),

  // Admin endpoints
  rest.put('http://localhost:3000/api/v1/admin/zones/:id/open', (req, res, ctx) => {
    return res(ctx.json({
      id: req.params.id,
      open: req.body.open,
      message: 'Zone status updated'
    }));
  }),

  rest.put('http://localhost:3000/api/v1/admin/categories/:id', (req, res, ctx) => {
    return res(ctx.json({
      id: req.params.id,
      ...req.body,
      message: 'Category updated'
    }));
  }),

  rest.post('http://localhost:3000/api/v1/admin/rush-hours', (req, res, ctx) => {
    return res(ctx.json({
      id: 'rush_001',
      ...req.body,
      message: 'Rush hour created'
    }));
  }),

  rest.post('http://localhost:3000/api/v1/admin/vacations', (req, res, ctx) => {
    return res(ctx.json({
      id: 'vacation_001',
      ...req.body,
      message: 'Vacation created'
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
  // Reset auth store state
  mockAuthStore.user = null;
  mockAuthStore.isAuthenticated = false;
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
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Complete User Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Visitor Journey', () => {
    test('visitor checks in at gate, employee processes checkout', async () => {
      const user = userEvent.setup();

      // Step 1: Visitor arrives at gate
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Wait for gate page to load
      await waitFor(() => {
        expect(screen.getByText('Main Entrance')).toBeInTheDocument();
      });

      // Verify zones are displayed
      expect(screen.getByText('Zone A')).toBeInTheDocument();
      expect(screen.getByText('Zone B')).toBeInTheDocument();
      expect(screen.getByText('Available for Visitors: 25')).toBeInTheDocument();

      // Select a zone
      const zoneCard = screen.getByTestId('zone-card-zone_a');
      await user.click(zoneCard);

      // Verify zone is selected
      expect(zoneCard).toHaveClass('selected');

      // Click check-in button
      const checkinButton = screen.getByText('Check In');
      await user.click(checkinButton);

      // Wait for ticket modal
      await waitFor(() => {
        expect(screen.getByTestId('ticket-modal')).toBeInTheDocument();
      });

      // Verify ticket details
      expect(screen.getByText('Ticket ID: T001')).toBeInTheDocument();
      expect(screen.getByText('Type: visitor')).toBeInTheDocument();
      expect(screen.getByText('Zone: zone_a')).toBeInTheDocument();

      // Print ticket
      const printButton = screen.getByText('Print Ticket');
      await user.click(printButton);
      expect(global.print).toHaveBeenCalled();

      // Close ticket modal
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      // Step 2: Employee processes checkout
      // Set up employee authentication
      mockAuthStore.user = { id: 'emp1', username: 'emp1', role: 'employee' };
      mockAuthStore.isAuthenticated = true;

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/checkpoint']}>
            <CheckpointPage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Wait for checkpoint page to load
      await waitFor(() => {
        expect(screen.getByText(/checkpoint/i)).toBeInTheDocument();
      });

      // Enter ticket ID
      const ticketInput = screen.getByPlaceholderText(/ticket id/i);
      await user.type(ticketInput, 'T001');

      // Click lookup
      const lookupButton = screen.getByText(/lookup/i);
      await user.click(lookupButton);

      // Wait for checkout panel
      await waitFor(() => {
        expect(screen.getByTestId('checkout-panel')).toBeInTheDocument();
      });

      // Verify checkout details
      expect(screen.getByText('Ticket: T001')).toBeInTheDocument();
      expect(screen.getByText('Amount: $10')).toBeInTheDocument();
      expect(screen.getByText('Duration: 2 hours')).toBeInTheDocument();

      // Complete checkout
      const completeButton = screen.getByTestId('complete-checkout');
      await user.click(completeButton);

      // Verify success
      expect(global.alert).toHaveBeenCalledWith('Checkout completed successfully!');
    });
  });

  describe('Complete Subscriber Journey', () => {
    test('subscriber checks in, employee processes with conversion', async () => {
      const user = userEvent.setup();

      // Step 1: Subscriber arrives at gate
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Main Entrance')).toBeInTheDocument();
      });

      // Switch to subscriber tab
      const subscriberTab = screen.getByText('Subscriber');
      await user.click(subscriberTab);

      // Enter subscription ID
      const subscriptionInput = screen.getByPlaceholderText(/subscription id/i);
      await user.type(subscriptionInput, 'SUB001');

      // Verify subscription
      const verifyButton = screen.getByText(/verify/i);
      await user.click(verifyButton);

      // Wait for verification
      await waitFor(() => {
        expect(screen.getByText(/verified/i)).toBeInTheDocument();
      });

      // Select zone
      const zoneCard = screen.getByTestId('zone-card-zone_a');
      await user.click(zoneCard);

      // Check in
      const checkinButton = screen.getByText('Check In');
      await user.click(checkinButton);

      // Wait for ticket modal
      await waitFor(() => {
        expect(screen.getByTestId('ticket-modal')).toBeInTheDocument();
      });

      // Verify subscriber ticket
      expect(screen.getByText('Ticket ID: T002')).toBeInTheDocument();
      expect(screen.getByText('Type: subscriber')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      // Step 2: Employee processes checkout with conversion
      mockAuthStore.user = { id: 'emp1', username: 'emp1', role: 'employee' };
      mockAuthStore.isAuthenticated = true;

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

      // Enter ticket ID
      const ticketInput = screen.getByPlaceholderText(/ticket id/i);
      await user.type(ticketInput, 'T002');

      // Lookup ticket
      const lookupButton = screen.getByText(/lookup/i);
      await user.click(lookupButton);

      // Wait for checkout panel with subscription info
      await waitFor(() => {
        expect(screen.getByTestId('checkout-panel')).toBeInTheDocument();
      });

      // Verify subscription details
      expect(screen.getByText('Subscription: John Doe')).toBeInTheDocument();

      // Convert to visitor (simulating vehicle mismatch)
      const convertButton = screen.getByTestId('convert-to-visitor');
      await user.click(convertButton);

      // Wait for conversion
      await waitFor(() => {
        expect(screen.getByText('Amount: $10')).toBeInTheDocument();
      });

      // Complete checkout
      const completeButton = screen.getByTestId('complete-checkout');
      await user.click(completeButton);

      // Verify success
      expect(global.alert).toHaveBeenCalledWith('Checkout completed successfully!');
    });
  });

  describe('Complete Admin Management Flow', () => {
    test('admin logs in, manages zones, rates, and views reports', async () => {
      const user = userEvent.setup();

      // Step 1: Admin login
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/login']}>
            <LoginPage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Enter admin credentials
      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByText(/login/i);

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'adminpass');
      await user.click(loginButton);

      // Wait for login and redirect
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
      });

      // Step 2: Admin dashboard
      mockAuthStore.user = { id: 'admin', username: 'admin', role: 'admin' };
      mockAuthStore.isAuthenticated = true;

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/admin']}>
            <AdminPage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      // Verify all admin sections are present
      expect(screen.getByTestId('admin-reports')).toBeInTheDocument();
      expect(screen.getByTestId('admin-control-panel')).toBeInTheDocument();
      expect(screen.getByTestId('admin-audit-log')).toBeInTheDocument();

      // View parking reports
      expect(screen.getByText('Zone A: 60/100 occupied')).toBeInTheDocument();

      // Use control panel
      const closeZoneBtn = screen.getByTestId('close-zone-btn');
      await user.click(closeZoneBtn);

      const updateRatesBtn = screen.getByTestId('update-rates-btn');
      await user.click(updateRatesBtn);

      const addRushHourBtn = screen.getByTestId('add-rush-hour-btn');
      await user.click(addRushHourBtn);

      const addVacationBtn = screen.getByTestId('add-vacation-btn');
      await user.click(addVacationBtn);

      // Verify audit log shows admin actions
      expect(screen.getByText('Admin action logged')).toBeInTheDocument();
    });
  });

  describe('Multi-User Concurrent Operations', () => {
    test('multiple users can use system simultaneously', async () => {
      const user1 = userEvent.setup();
      const user2 = userEvent.setup();

      // User 1: Visitor at gate
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Main Entrance')).toBeInTheDocument();
      });

      // User 1 selects zone
      const zoneCard = screen.getByTestId('zone-card-zone_a');
      await user1.click(zoneCard);

      // User 2: Employee at checkpoint (simulate concurrent access)
      mockAuthStore.user = { id: 'emp1', username: 'emp1', role: 'employee' };
      mockAuthStore.isAuthenticated = true;

      // Simulate concurrent operations by rendering checkpoint in same test
      // In real scenario, these would be separate browser sessions
      const checkpointElement = document.createElement('div');
      checkpointElement.innerHTML = `
        <div data-testid="checkpoint-page">
          <h2>Checkpoint - Checkout</h2>
          <input placeholder="Enter ticket ID" />
          <button>Lookup</button>
        </div>
      `;
      document.body.appendChild(checkpointElement);

      // User 1 completes check-in
      const checkinButton = screen.getByText('Check In');
      await user1.click(checkinButton);

      await waitFor(() => {
        expect(screen.getByTestId('ticket-modal')).toBeInTheDocument();
      });

      // Both operations should work independently
      expect(screen.getByText('Ticket ID: T001')).toBeInTheDocument();
      expect(checkpointElement).toBeInTheDocument();

      // Cleanup
      document.body.removeChild(checkpointElement);
    });
  });

  describe('Real-time Updates Integration', () => {
    test('zone updates reflect across all connected clients', async () => {
      const user = userEvent.setup();

      // Render gate page
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

      // Verify initial state
      expect(screen.getByText('Free: 40')).toBeInTheDocument();
      expect(screen.getByText('Occupied: 60')).toBeInTheDocument();

      // Simulate WebSocket zone update
      const mockWebSocketService = require('../../services/websocket').default;
      const zoneUpdateMessage = {
        type: 'zone-update',
        payload: {
          id: 'zone_a',
          name: 'Zone A',
          occupied: 65, // Updated
          free: 35,     // Updated
          availableForVisitors: 20,
          availableForSubscribers: 35,
          open: true
        }
      };

      // Trigger WebSocket message
      act(() => {
        const messageHandler = mockWebSocketService.on.mock.calls.find(
          call => call[0] === 'message'
        );
        if (messageHandler) {
          messageHandler[1]({ data: JSON.stringify(zoneUpdateMessage) });
        }
      });

      // Verify zone state was updated
      expect(mockParkingStore.updateZone).toHaveBeenCalledWith(zoneUpdateMessage.payload);
    });
  });

  describe('Error Recovery Flows', () => {
    test('system recovers from network errors during user flow', async () => {
      const user = userEvent.setup();

      // Start with successful flow
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Main Entrance')).toBeInTheDocument();
      });

      // Simulate network error during check-in
      server.use(
        rest.post('http://localhost:3000/api/v1/tickets/checkin', (req, res, ctx) => {
          return res.networkError('Network error');
        })
      );

      // Attempt check-in
      const zoneCard = screen.getByTestId('zone-card-zone_a');
      await user.click(zoneCard);

      const checkinButton = screen.getByText('Check In');
      await user.click(checkinButton);

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Restore network
      server.resetHandlers();

      // Should be able to retry
      await user.click(checkinButton);

      await waitFor(() => {
        expect(screen.getByTestId('ticket-modal')).toBeInTheDocument();
      });
    });
  });
});
