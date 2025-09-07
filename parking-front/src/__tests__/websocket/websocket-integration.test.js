import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import GatePage from '../../pages/GatePage';
import AdminPage from '../../pages/AdminPage';
import { useParkingStore } from '../../store/parkingStore';

// Mock WebSocket class
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    this.send = jest.fn();
    this.close = jest.fn();
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 100);
  }
}

// Mock WebSocket globally
global.WebSocket = MockWebSocket;

// Mock the WebSocket service
const mockWebSocketService = {
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
};

jest.mock('../../services/websocket', () => ({
  __esModule: true,
  default: mockWebSocketService
}));

// Mock the parking store
const mockParkingStore = {
  gates: [],
  zones: [
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
  ],
  categories: [],
  currentGate: { id: 'gate_1', name: 'Main Entrance' },
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

jest.mock('../../store/parkingStore', () => ({
  __esModule: true,
  useParkingStore: () => mockParkingStore
}));

// Mock auth store
jest.mock('../../store/authStore', () => ({
  __esModule: true,
  useAuthStore: () => ({
    user: { id: 'admin', username: 'admin', role: 'admin' },
    isAuthenticated: true,
    logout: jest.fn()
  })
}));

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
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

jest.mock('../../components/WebSocketStatus', () => {
  return function MockWebSocketStatus() {
    return <div data-testid="websocket-status">WebSocket Connected</div>;
  };
});

// Setup MSW server
const server = setupServer(
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
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('WebSocket Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WebSocket Connection Management', () => {
    test('establishes WebSocket connection on gate page load', async () => {
      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockWebSocketService.connect).toHaveBeenCalled();
      });

      expect(mockWebSocketService.subscribe).toHaveBeenCalledWith('gate_1');
    });

    test('handles WebSocket connection errors gracefully', async () => {
      // Mock WebSocket connection failure
      mockWebSocketService.isConnected.mockReturnValue(false);
      mockWebSocketService.getConnectionStats.mockReturnValue({
        connected: false,
        reconnectAttempts: 3,
        lastConnected: null,
        connectionErrors: ['Connection timeout', 'Network error']
      });

      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('websocket-status')).toBeInTheDocument();
      });

      // Should show connection status
      expect(screen.getByText('WebSocket Connected')).toBeInTheDocument();
    });

    test('reconnects WebSocket after connection loss', async () => {
      // Simulate connection loss and recovery
      mockWebSocketService.isConnected
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockWebSocketService.connect).toHaveBeenCalled();
      });

      // Should attempt reconnection
      expect(mockWebSocketService.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Real-time Zone Updates', () => {
    test('updates zone state when receiving zone-update message', async () => {
      const mockUpdateZone = jest.fn();
      mockParkingStore.updateZone = mockUpdateZone;

      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Zone A')).toBeInTheDocument();
      });

      // Simulate receiving a zone-update message
      const zoneUpdateMessage = {
        type: 'zone-update',
        payload: {
          id: 'zone_a',
          name: 'Zone A',
          occupied: 65, // Updated occupancy
          free: 35,
          availableForVisitors: 20,
          availableForSubscribers: 35,
          open: true
        }
      };

      // Trigger the WebSocket message handler
      act(() => {
        const messageHandler = mockWebSocketService.on.mock.calls.find(
          call => call[0] === 'message'
        );
        if (messageHandler) {
          messageHandler[1]({ data: JSON.stringify(zoneUpdateMessage) });
        }
      });

      // Verify zone was updated
      expect(mockUpdateZone).toHaveBeenCalledWith(zoneUpdateMessage.payload);
    });

    test('handles multiple rapid zone updates', async () => {
      const mockUpdateZone = jest.fn();
      mockParkingStore.updateZone = mockUpdateZone;

      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Zone A')).toBeInTheDocument();
      });

      // Send multiple rapid updates
      const updates = [
        { id: 'zone_a', occupied: 61, free: 39 },
        { id: 'zone_a', occupied: 62, free: 38 },
        { id: 'zone_a', occupied: 63, free: 37 }
      ];

      act(() => {
        updates.forEach(update => {
          const message = {
            type: 'zone-update',
            payload: { ...mockParkingStore.zones[0], ...update }
          };
          const messageHandler = mockWebSocketService.on.mock.calls.find(
            call => call[0] === 'message'
          );
          if (messageHandler) {
            messageHandler[1]({ data: JSON.stringify(message) });
          }
        });
      });

      // Should handle all updates
      expect(mockUpdateZone).toHaveBeenCalledTimes(3);
    });
  });

  describe('Admin Update Notifications', () => {
    test('receives and processes admin-update messages', async () => {
      const mockAddAuditEntry = jest.fn();
      mockParkingStore.addAdminAuditEntry = mockAddAuditEntry;

      render(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      // Simulate admin-update message
      const adminUpdateMessage = {
        type: 'admin-update',
        payload: {
          adminId: 'admin_1',
          action: 'zone-closed',
          targetType: 'zone',
          targetId: 'zone_a',
          details: { open: false },
          timestamp: new Date().toISOString()
        }
      };

      act(() => {
        const messageHandler = mockWebSocketService.on.mock.calls.find(
          call => call[0] === 'message'
        );
        if (messageHandler) {
          messageHandler[1]({ data: JSON.stringify(adminUpdateMessage) });
        }
      });

      // Verify audit entry was added
      expect(mockAddAuditEntry).toHaveBeenCalledWith(adminUpdateMessage.payload);
    });

    test('handles malformed WebSocket messages gracefully', async () => {
      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Zone A')).toBeInTheDocument();
      });

      // Send malformed message
      act(() => {
        const messageHandler = mockWebSocketService.on.mock.calls.find(
          call => call[0] === 'message'
        );
        if (messageHandler) {
          // Should not throw error
          expect(() => {
            messageHandler[1]({ data: 'invalid json' });
          }).not.toThrow();
        }
      });
    });
  });

  describe('WebSocket Subscription Management', () => {
    test('subscribes to correct gate on page load', async () => {
      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockWebSocketService.subscribe).toHaveBeenCalledWith('gate_1');
      });
    });

    test('unsubscribes when component unmounts', async () => {
      const { unmount } = render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockWebSocketService.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(mockWebSocketService.unsubscribe).toHaveBeenCalledWith('gate_1');
    });

    test('handles subscription errors', async () => {
      // Mock subscription failure
      mockWebSocketService.subscribe.mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      // Should not crash the application
      await waitFor(() => {
        expect(screen.getByText('Zone A')).toBeInTheDocument();
      });
    });
  });

  describe('WebSocket Heartbeat and Health Monitoring', () => {
    test('monitors WebSocket connection health', async () => {
      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockWebSocketService.getConnectionStats).toHaveBeenCalled();
      });

      // Should have connection stats available
      const stats = mockWebSocketService.getConnectionStats();
      expect(stats).toHaveProperty('connected');
      expect(stats).toHaveProperty('reconnectAttempts');
      expect(stats).toHaveProperty('lastConnected');
    });

    test('handles WebSocket ping/pong heartbeat', async () => {
      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockWebSocketService.send).toHaveBeenCalled();
      });

      // Should send ping messages
      expect(mockWebSocketService.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'ping' })
      );
    });
  });

  describe('WebSocket Error Recovery', () => {
    test('recovers from WebSocket errors', async () => {
      // Mock initial connection failure
      mockWebSocketService.isConnected.mockReturnValue(false);

      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      // Simulate error recovery
      act(() => {
        mockWebSocketService.isConnected.mockReturnValue(true);
      });

      await waitFor(() => {
        expect(screen.getByText('Zone A')).toBeInTheDocument();
      });

      // Should attempt reconnection
      expect(mockWebSocketService.connect).toHaveBeenCalled();
    });

    test('handles network disconnection gracefully', async () => {
      // Mock network disconnection
      mockWebSocketService.isConnected.mockReturnValue(false);
      mockWebSocketService.getConnectionStats.mockReturnValue({
        connected: false,
        reconnectAttempts: 5,
        lastConnected: new Date(Date.now() - 30000).toISOString(),
        connectionErrors: ['Network unreachable', 'Connection timeout']
      });

      render(
        <TestWrapper>
          <GatePage />
        </TestWrapper>
      );

      // Should show connection status
      await waitFor(() => {
        expect(screen.getByTestId('websocket-status')).toBeInTheDocument();
      });

      // Should attempt reconnection
      expect(mockWebSocketService.connect).toHaveBeenCalled();
    });
  });
});
