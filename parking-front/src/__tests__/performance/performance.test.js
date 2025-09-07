import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import GatePage from '../../pages/GatePage';
import CheckpointPage from '../../pages/CheckpointPage';
import AdminPage from '../../pages/AdminPage';
import { masterAPI, ticketAPI, authAPI, adminAPI } from '../../services/api';

// Performance testing utilities
const measureRenderTime = (renderFunction) => {
  const start = performance.now();
  const result = renderFunction();
  const end = performance.now();
  return {
    result,
    renderTime: end - start
  };
};

const measureMemoryUsage = () => {
  if (performance.memory) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    };
  }
  return null;
};

// Mock components with performance considerations
jest.mock('../../components/HeaderOne', () => {
  return React.memo(function MockHeaderOne() {
    return <div data-testid="header">Header</div>;
  });
});

jest.mock('../../components/FooterAreaOne', () => {
  return React.memo(function MockFooterAreaOne() {
    return <div data-testid="footer">Footer</div>;
  });
});

jest.mock('../../components/parking/ZoneCard', () => {
  return React.memo(function MockZoneCard({ zone, isSelected, onSelect, disabled }) {
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
  });
});

jest.mock('../../components/parking/TicketModal', () => {
  return React.memo(function MockTicketModal({ ticket, onClose, onPrint }) {
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
  });
});

jest.mock('../../components/parking/CheckoutPanel', () => {
  return React.memo(function MockCheckoutPanel({ ticket, checkoutData, subscription, onConvertToVisitor, onCompleteCheckout, loading }) {
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
          {loading ? 'Processing...' : 'Complete Checkout'}
        </button>
      </div>
    );
  });
});

jest.mock('../../components/WebSocketStatus', () => {
  return React.memo(function MockWebSocketStatus() {
    return <div data-testid="websocket-status">WebSocket Connected</div>;
  });
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

// Mock useNavigate and useParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ gateId: 'gate_1' })
}));

// Setup MSW server with performance test data
const server = setupServer(
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

  rest.get('http://localhost:3000/api/v1/master/zones', (req, res, ctx) => {
    // Generate large dataset for performance testing
    const zones = Array.from({ length: 100 }, (_, i) => ({
      id: `zone_${i}`,
      name: `Zone ${i}`,
      categoryId: `cat_${i % 3}`,
      gateIds: ['gate_1'],
      totalSlots: 100,
      occupied: Math.floor(Math.random() * 100),
      free: Math.floor(Math.random() * 100),
      reserved: Math.floor(Math.random() * 20),
      availableForVisitors: Math.floor(Math.random() * 50),
      availableForSubscribers: Math.floor(Math.random() * 50),
      rateNormal: 5.0 + (i % 3),
      rateSpecial: 8.0 + (i % 3),
      open: i % 10 !== 0 // Some zones closed
    }));

    return res(ctx.json(zones));
  }),

  rest.get('http://localhost:3000/api/v1/admin/reports/parking-state', (req, res, ctx) => {
    const reports = Array.from({ length: 100 }, (_, i) => ({
      id: `zone_${i}`,
      name: `Zone ${i}`,
      occupied: Math.floor(Math.random() * 100),
      free: Math.floor(Math.random() * 100),
      reserved: Math.floor(Math.random() * 20),
      availableForVisitors: Math.floor(Math.random() * 50),
      availableForSubscribers: Math.floor(Math.random() * 50),
      subscriberCount: Math.floor(Math.random() * 10),
      open: i % 10 !== 0
    }));

    return res(ctx.json(reports));
  }),

  rest.post('http://localhost:3000/api/v1/tickets/checkin', (req, res, ctx) => {
    return res(ctx.json({
      ticket: {
        id: 'T001',
        type: 'visitor',
        zoneId: 'zone_a',
        gateId: 'gate_1',
        checkinAt: '2024-01-01T10:00:00Z'
      },
      zoneState: {
        id: 'zone_a',
        occupied: 61,
        free: 39,
        availableForVisitors: 24,
        availableForSubscribers: 39
      }
    }));
  }),

  rest.get('http://localhost:3000/api/v1/tickets/:ticketId', (req, res, ctx) => {
    return res(ctx.json({
      id: 'T001',
      type: 'visitor',
      zoneId: 'zone_a',
      gateId: 'gate_1',
      checkinAt: '2024-01-01T10:00:00Z'
    }));
  }),

  rest.post('http://localhost:3000/api/v1/tickets/checkout', (req, res, ctx) => {
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
      queries: { retry: false, staleTime: 5000 },
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

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering Performance', () => {
    test('GatePage renders within acceptable time limit', async () => {
      const { result, renderTime } = measureRenderTime(() => {
        return render(
          <TestWrapper>
            <MemoryRouter initialEntries={['/gate/gate_1']}>
              <GatePage />
            </MemoryRouter>
          </TestWrapper>
        );
      });

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);

      await waitFor(() => {
        expect(screen.getByText('Main Entrance')).toBeInTheDocument();
      });
    });

    test('CheckpointPage renders within acceptable time limit', async () => {
      const { result, renderTime } = measureRenderTime(() => {
        return render(
          <TestWrapper>
            <MemoryRouter initialEntries={['/checkpoint']}>
              <CheckpointPage />
            </MemoryRouter>
          </TestWrapper>
        );
      });

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);

      await waitFor(() => {
        expect(screen.getByText(/checkpoint/i)).toBeInTheDocument();
      });
    });

    test('AdminPage renders within acceptable time limit', async () => {
      const { result, renderTime } = measureRenderTime(() => {
        return render(
          <TestWrapper>
            <MemoryRouter initialEntries={['/admin']}>
              <AdminPage />
            </MemoryRouter>
          </TestWrapper>
        );
      });

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    test('large dataset rendering performance', async () => {
      const startTime = performance.now();

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Wait for all zones to load
      await waitFor(() => {
        expect(screen.getByText('Zone 0')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should handle 100 zones within 500ms
      expect(loadTime).toBeLessThan(500);

      // Verify all zones are rendered
      for (let i = 0; i < 10; i++) { // Check first 10 zones
        expect(screen.getByTestId(`zone-card-zone_${i}`)).toBeInTheDocument();
      }
    });
  });

  describe('Memory Usage Performance', () => {
    test('memory usage remains stable during component lifecycle', async () => {
      const initialMemory = measureMemoryUsage();

      const { unmount } = render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Main Entrance')).toBeInTheDocument();
      });

      const afterRenderMemory = measureMemoryUsage();

      // Unmount component
      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const afterUnmountMemory = measureMemoryUsage();

      if (initialMemory && afterRenderMemory && afterUnmountMemory) {
        // Memory should not increase significantly after unmount
        const memoryIncrease = afterUnmountMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB increase
      }
    });

    test('memory usage with large datasets', async () => {
      const initialMemory = measureMemoryUsage();

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Zone 0')).toBeInTheDocument();
      });

      const afterLargeDatasetMemory = measureMemoryUsage();

      if (initialMemory && afterLargeDatasetMemory) {
        const memoryIncrease = afterLargeDatasetMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        // Should handle 100 zones without excessive memory usage
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
      }
    });
  });

  describe('API Performance', () => {
    test('API calls complete within acceptable time', async () => {
      const startTime = performance.now();

      const gates = await masterAPI.getGates();
      const zones = await masterAPI.getZones('gate_1');

      const endTime = performance.now();
      const apiTime = endTime - startTime;

      // API calls should complete within 200ms
      expect(apiTime).toBeLessThan(200);
      expect(gates.data).toBeDefined();
      expect(zones.data).toBeDefined();
    });

    test('concurrent API calls performance', async () => {
      const startTime = performance.now();

      // Make multiple concurrent API calls
      const promises = [
        masterAPI.getGates(),
        masterAPI.getZones('gate_1'),
        masterAPI.getZones('gate_2'),
        masterAPI.getZones('gate_3')
      ];

      const results = await Promise.all(promises);
      const endTime = performance.now();
      const concurrentTime = endTime - startTime;

      // Concurrent calls should be faster than sequential
      expect(concurrentTime).toBeLessThan(300);
      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result.data).toBeDefined();
      });
    });

    test('API caching performance', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 5000 }
        }
      });

      const TestCachingComponent = () => {
        const { data, isLoading } = useQuery({
          queryKey: ['gates'],
          queryFn: () => masterAPI.getGates()
        });

        if (isLoading) return <div>Loading...</div>;
        return <div data-testid="gates-count">{data?.data?.length}</div>;
      };

      // First render
      const startTime1 = performance.now();
      render(
        <QueryClientProvider client={queryClient}>
          <TestCachingComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('gates-count')).toBeInTheDocument();
      });
      const endTime1 = performance.now();
      const firstRenderTime = endTime1 - startTime1;

      // Second render (should use cache)
      const startTime2 = performance.now();
      render(
        <QueryClientProvider client={queryClient}>
          <TestCachingComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('gates-count')).toBeInTheDocument();
      });
      const endTime2 = performance.now();
      const secondRenderTime = endTime2 - startTime2;

      // Second render should be significantly faster due to caching
      expect(secondRenderTime).toBeLessThan(firstRenderTime);
    });
  });

  describe('User Interaction Performance', () => {
    test('zone selection response time', async () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Zone 0')).toBeInTheDocument();
      });

      const startTime = performance.now();
      
      // Select a zone
      const zoneCard = screen.getByTestId('zone-card-zone_0');
      fireEvent.click(zoneCard);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Zone selection should respond within 16ms (60fps)
      expect(responseTime).toBeLessThan(16);
    });

    test('modal opening performance', async () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Zone 0')).toBeInTheDocument();
      });

      // Select zone first
      const zoneCard = screen.getByTestId('zone-card-zone_0');
      fireEvent.click(zoneCard);

      const startTime = performance.now();
      
      // Open modal
      const checkinButton = screen.getByText('Check In');
      fireEvent.click(checkinButton);

      await waitFor(() => {
        expect(screen.getByTestId('ticket-modal')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const modalOpenTime = endTime - startTime;

      // Modal should open within 100ms
      expect(modalOpenTime).toBeLessThan(100);
    });

    test('form submission performance', async () => {
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

      const startTime = performance.now();

      // Fill form and submit
      const ticketInput = screen.getByPlaceholderText(/ticket id/i);
      fireEvent.change(ticketInput, { target: { value: 'T001' } });

      const lookupButton = screen.getByText(/lookup/i);
      fireEvent.click(lookupButton);

      await waitFor(() => {
        expect(screen.getByTestId('checkout-panel')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const formSubmissionTime = endTime - startTime;

      // Form submission should complete within 200ms
      expect(formSubmissionTime).toBeLessThan(200);
    });
  });

  describe('WebSocket Performance', () => {
    test('WebSocket message processing performance', async () => {
      const mockWebSocketService = require('../../services/websocket').default;
      
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Zone 0')).toBeInTheDocument();
      });

      const startTime = performance.now();

      // Simulate rapid WebSocket messages
      const messages = Array.from({ length: 10 }, (_, i) => ({
        type: 'zone-update',
        payload: {
          id: `zone_${i}`,
          name: `Zone ${i}`,
          occupied: Math.floor(Math.random() * 100),
          free: Math.floor(Math.random() * 100),
          availableForVisitors: Math.floor(Math.random() * 50),
          availableForSubscribers: Math.floor(Math.random() * 50),
          open: true
        }
      }));

      act(() => {
        messages.forEach(message => {
          const messageHandler = mockWebSocketService.on.mock.calls.find(
            call => call[0] === 'message'
          );
          if (messageHandler) {
            messageHandler[1]({ data: JSON.stringify(message) });
          }
        });
      });

      const endTime = performance.now();
      const messageProcessingTime = endTime - startTime;

      // Should process 10 messages within 50ms
      expect(messageProcessingTime).toBeLessThan(50);
    });
  });

  describe('Bundle Size and Loading Performance', () => {
    test('component lazy loading performance', async () => {
      // Test that components can be lazy loaded efficiently
      const LazyGatePage = React.lazy(() => Promise.resolve({ default: GatePage }));

      const startTime = performance.now();

      render(
        <TestWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <MemoryRouter initialEntries={['/gate/gate_1']}>
              <LazyGatePage />
            </MemoryRouter>
          </React.Suspense>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Main Entrance')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const lazyLoadTime = endTime - startTime;

      // Lazy loading should complete within 200ms
      expect(lazyLoadTime).toBeLessThan(200);
    });
  });

  describe('Performance Regression Tests', () => {
    test('performance does not degrade with repeated renders', async () => {
      const renderTimes = [];

      for (let i = 0; i < 5; i++) {
        const { result, renderTime } = measureRenderTime(() => {
          return render(
            <TestWrapper>
              <MemoryRouter initialEntries={['/gate/gate_1']}>
                <GatePage />
              </MemoryRouter>
            </TestWrapper>
          );
        });

        renderTimes.push(renderTime);

        await waitFor(() => {
          expect(screen.getByText('Main Entrance')).toBeInTheDocument();
        });

        result.unmount();
      }

      // Performance should not degrade significantly
      const firstRender = renderTimes[0];
      const lastRender = renderTimes[renderTimes.length - 1];
      const performanceDegradation = (lastRender - firstRender) / firstRender;

      expect(performanceDegradation).toBeLessThan(0.5); // Less than 50% degradation
    });

    test('memory usage does not increase with repeated operations', async () => {
      const memoryReadings = [];

      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <TestWrapper>
            <MemoryRouter initialEntries={['/gate/gate_1']}>
              <GatePage />
            </MemoryRouter>
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText('Main Entrance')).toBeInTheDocument();
        });

        const memory = measureMemoryUsage();
        if (memory) {
          memoryReadings.push(memory.usedJSHeapSize);
        }

        unmount();

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      // Memory usage should not continuously increase
      const firstMemory = memoryReadings[0];
      const lastMemory = memoryReadings[memoryReadings.length - 1];
      const memoryIncrease = (lastMemory - firstMemory) / firstMemory;

      expect(memoryIncrease).toBeLessThan(0.2); // Less than 20% increase
    });
  });
});
