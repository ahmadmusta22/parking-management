import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import GatePage from '../../pages/GatePage';
import CheckpointPage from '../../pages/CheckpointPage';

// Mock the auth store for different user types
const mockAuthStore = {
  admin: {
    user: { id: 'admin', username: 'admin', role: 'admin', name: 'Admin User' },
    isAuthenticated: true,
    logout: jest.fn()
  },
  employee: {
    user: { id: 'emp1', username: 'emp1', role: 'employee', name: 'Employee One' },
    isAuthenticated: true,
    logout: jest.fn()
  },
  unauthenticated: {
    user: null,
    isAuthenticated: false,
    logout: jest.fn()
  }
};

// Mock the parking store
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
  addAdminAuditEntry: jest.fn()
};

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
        <p>Rate: ${zone.rateNormal}</p>
        <p>Open: {zone.open ? 'Yes' : 'No'}</p>
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
        <p>Type: {ticket.type}</p>
        <p>Zone: {ticket.zoneId}</p>
        <p>Gate: {ticket.gateId}</p>
        <button onClick={onClose}>Close</button>
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
        {subscription && <p>Subscription: {subscription.userName}</p>}
        {subscription && !checkoutData && (
          <button data-testid="convert-to-visitor" onClick={onConvertToVisitor}>
            Convert to Visitor
          </button>
        )}
        <button data-testid="complete-checkout" onClick={onCompleteCheckout} disabled={loading}>
          Complete Checkout
        </button>
      </div>
    );
  };
});

jest.mock('../../helper/Preloader', () => {
  return function MockPreloader() {
    return <div data-testid="preloader">Loading...</div>;
  };
});

// Mock WebSocket service
jest.mock('../../services/websocket', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn()
  }
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock window.alert
global.alert = jest.fn();

// Setup MSW server for API mocking
const server = setupServer(
  // Mock gates endpoint
  rest.get('http://localhost:3000/api/v1/master/gates', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: 'gate_1',
        name: 'Main Entrance',
        location: 'North',
        zoneIds: ['zone_a', 'zone_b']
      }
    ]));
  }),

  // Mock zones endpoint
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

  // Mock visitor check-in
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
          availableForVisitors: 24
        }
      }));
    }
    return res(ctx.status(400));
  }),

  // Mock subscriber check-in
  rest.post('http://localhost:3000/api/v1/tickets/checkin', (req, res, ctx) => {
    const body = req.body;
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
          availableForSubscribers: 39
        }
      }));
    }
    return res(ctx.status(400));
  }),

  // Mock ticket lookup
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
    return res(ctx.status(404), ctx.json({ message: 'Ticket not found' }));
  }),

  // Mock subscription lookup
  rest.get('http://localhost:3000/api/v1/subscriptions/:id', (req, res, ctx) => {
    const { id } = req.params;
    if (id === 'SUB001') {
      return res(ctx.json({
        id: 'SUB001',
        userName: 'John Doe',
        category: 'premium',
        active: true,
        cars: [
          { plate: 'ABC123', brand: 'Toyota', model: 'Camry', color: 'Blue' }
        ]
      }));
    }
    return res(ctx.status(404), ctx.json({ message: 'Subscription not found' }));
  }),

  // Mock checkout
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
        ]
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
    return res(ctx.status(404), ctx.json({ message: 'Ticket not found' }));
  })
);

// Setup and teardown
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());

const TestWrapper = ({ children, userType = 'unauthenticated' }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  // Mock the auth store based on user type
  jest.doMock('../../store/authStore', () => ({
    __esModule: true,
    default: () => mockAuthStore[userType]
  }));

  // Mock the parking store
  jest.doMock('../../store/parkingStore', () => ({
    __esModule: true,
    default: () => mockParkingStore
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Checkout Flow Integration Tests', () => {
  describe('Complete Visitor Checkout Flow', () => {
    test('visitor checks in at gate and employee processes checkout', async () => {
      // Step 1: Visitor checks in at gate
      render(
        <TestWrapper userType="unauthenticated">
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Wait for gate page to load
      await waitFor(() => {
        expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
      });

      // Verify gate page loaded
      expect(screen.getByText('Main Entrance')).toBeInTheDocument();
      expect(screen.getByText('Zone A')).toBeInTheDocument();

      // Select visitor tab (should be default)
      expect(screen.getByText('Visitor')).toBeInTheDocument();

      // Select a zone
      const zoneCard = screen.getByTestId('zone-card-zone_a');
      fireEvent.click(zoneCard);

      // Click check-in button
      const checkinButton = screen.getByText('Check In');
      fireEvent.click(checkinButton);

      // Wait for ticket modal
      await waitFor(() => {
        expect(screen.getByTestId('ticket-modal')).toBeInTheDocument();
      });

      // Verify ticket details
      expect(screen.getByText('Ticket ID: T001')).toBeInTheDocument();
      expect(screen.getByText('Type: visitor')).toBeInTheDocument();

      // Close ticket modal
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      // Step 2: Employee processes checkout
      render(
        <TestWrapper userType="employee">
          <MemoryRouter initialEntries={['/checkpoint']}>
            <CheckpointPage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Wait for checkpoint page to load
      await waitFor(() => {
        expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
      });

      // Verify checkpoint page loaded
      expect(screen.getByText('Checkpoint - Checkout')).toBeInTheDocument();
      expect(screen.getByText('Employee: Employee One')).toBeInTheDocument();

      // Enter ticket ID
      const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
      fireEvent.change(ticketInput, { target: { value: 'T001' } });

      // Click lookup
      const lookupButton = screen.getByText('Lookup');
      fireEvent.click(lookupButton);

      // Wait for checkout panel
      await waitFor(() => {
        expect(screen.getByTestId('checkout-panel')).toBeInTheDocument();
      });

      // Verify checkout details
      expect(screen.getByText('Ticket: T001')).toBeInTheDocument();
      expect(screen.getByText('Amount: $10')).toBeInTheDocument();

      // Complete checkout
      const completeButton = screen.getByTestId('complete-checkout');
      fireEvent.click(completeButton);

      // Verify success message
      expect(global.alert).toHaveBeenCalledWith('Checkout completed successfully!');
    });
  });

  describe('Complete Subscriber Checkout Flow', () => {
    test('subscriber checks in and employee processes checkout with conversion', async () => {
      // Step 1: Subscriber checks in at gate
      render(
        <TestWrapper userType="unauthenticated">
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Wait for gate page to load
      await waitFor(() => {
        expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
      });

      // Switch to subscriber tab
      const subscriberTab = screen.getByText('Subscriber');
      fireEvent.click(subscriberTab);

      // Enter subscription ID
      const subscriptionInput = screen.getByPlaceholderText('Enter your subscription ID');
      fireEvent.change(subscriptionInput, { target: { value: 'SUB001' } });

      // Verify subscription
      const verifyButton = screen.getByText('Verify Subscription');
      fireEvent.click(verifyButton);

      // Wait for subscription verification
      await waitFor(() => {
        expect(screen.getByText('Subscription Verified')).toBeInTheDocument();
      });

      // Select a zone
      const zoneCard = screen.getByTestId('zone-card-zone_a');
      fireEvent.click(zoneCard);

      // Click check-in button
      const checkinButton = screen.getByText('Check In');
      fireEvent.click(checkinButton);

      // Wait for ticket modal
      await waitFor(() => {
        expect(screen.getByTestId('ticket-modal')).toBeInTheDocument();
      });

      // Verify ticket details
      expect(screen.getByText('Ticket ID: T002')).toBeInTheDocument();
      expect(screen.getByText('Type: subscriber')).toBeInTheDocument();

      // Close ticket modal
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      // Step 2: Employee processes checkout
      render(
        <TestWrapper userType="employee">
          <MemoryRouter initialEntries={['/checkpoint']}>
            <CheckpointPage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Wait for checkpoint page to load
      await waitFor(() => {
        expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
      });

      // Enter ticket ID
      const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
      fireEvent.change(ticketInput, { target: { value: 'T002' } });

      // Click lookup
      const lookupButton = screen.getByText('Lookup');
      fireEvent.click(lookupButton);

      // Wait for checkout panel with subscription info
      await waitFor(() => {
        expect(screen.getByTestId('checkout-panel')).toBeInTheDocument();
      });

      // Verify subscription details
      expect(screen.getByText('Subscription: John Doe')).toBeInTheDocument();

      // Convert to visitor (simulating vehicle mismatch)
      const convertButton = screen.getByTestId('convert-to-visitor');
      fireEvent.click(convertButton);

      // Wait for conversion
      await waitFor(() => {
        expect(screen.getByText('Amount: $10')).toBeInTheDocument();
      });

      // Complete checkout
      const completeButton = screen.getByTestId('complete-checkout');
      fireEvent.click(completeButton);

      // Verify success message
      expect(global.alert).toHaveBeenCalledWith('Checkout completed successfully!');
    });
  });

  describe('Error Handling in Checkout Flow', () => {
    test('handles invalid ticket ID at checkpoint', async () => {
      // Mock server to return 404 for invalid ticket
      server.use(
        rest.get('http://localhost:3000/api/v1/tickets/INVALID', (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({ message: 'Ticket not found' }));
        })
      );

      render(
        <TestWrapper userType="employee">
          <MemoryRouter initialEntries={['/checkpoint']}>
            <CheckpointPage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Wait for checkpoint page to load
      await waitFor(() => {
        expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
      });

      // Enter invalid ticket ID
      const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
      fireEvent.change(ticketInput, { target: { value: 'INVALID' } });

      // Click lookup
      const lookupButton = screen.getByText('Lookup');
      fireEvent.click(lookupButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText('Ticket not found')).toBeInTheDocument();
      });

      // Verify checkout panel is not shown
      expect(screen.queryByTestId('checkout-panel')).not.toBeInTheDocument();
    });

    test('handles zone unavailable for visitors', async () => {
      // Mock server to return zone with no visitor availability
      server.use(
        rest.get('http://localhost:3000/api/v1/master/zones', (req, res, ctx) => {
          return res(ctx.json([
            {
              id: 'zone_a',
              name: 'Zone A',
              categoryId: 'cat_premium',
              gateIds: ['gate_1'],
              totalSlots: 100,
              occupied: 95,
              free: 5,
              reserved: 5,
              availableForVisitors: 0, // No availability for visitors
              availableForSubscribers: 5,
              rateNormal: 5.0,
              rateSpecial: 8.0,
              open: true
            }
          ]));
        })
      );

      render(
        <TestWrapper userType="unauthenticated">
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Wait for gate page to load
      await waitFor(() => {
        expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
      });

      // Verify zone is disabled for visitors
      const zoneCard = screen.getByTestId('zone-card-zone_a');
      expect(zoneCard).toHaveClass('disabled');

      // Try to click on disabled zone
      fireEvent.click(zoneCard);

      // Verify no check-in button appears
      expect(screen.queryByText('Check In')).not.toBeInTheDocument();
    });
  });

  describe('Real-time Updates Integration', () => {
    test('zone availability updates after check-in', async () => {
      const mockUpdateZone = jest.fn();
      mockParkingStore.updateZone = mockUpdateZone;

      render(
        <TestWrapper userType="unauthenticated">
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Wait for gate page to load
      await waitFor(() => {
        expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
      });

      // Verify initial zone state
      expect(screen.getByText('Free: 40')).toBeInTheDocument();
      expect(screen.getByText('Occupied: 60')).toBeInTheDocument();

      // Select zone and check in
      const zoneCard = screen.getByTestId('zone-card-zone_a');
      fireEvent.click(zoneCard);

      const checkinButton = screen.getByText('Check In');
      fireEvent.click(checkinButton);

      // Wait for check-in to complete
      await waitFor(() => {
        expect(screen.getByTestId('ticket-modal')).toBeInTheDocument();
      });

      // Verify zone state was updated (this would happen via WebSocket in real app)
      // In this test, we're verifying the updateZone function was called
      expect(mockUpdateZone).toHaveBeenCalled();
    });
  });
});


