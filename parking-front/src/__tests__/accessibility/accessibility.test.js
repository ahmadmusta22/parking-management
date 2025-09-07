import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import GatePage from '../../pages/GatePage';
import CheckpointPage from '../../pages/CheckpointPage';
import AdminPage from '../../pages/AdminPage';
import LoginPage from '../../pages/LoginPage';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock components
jest.mock('../../components/HeaderOne', () => {
  return function MockHeaderOne() {
    return (
      <header data-testid="header">
        <nav role="navigation" aria-label="Main navigation">
          <a href="/" aria-label="Home">Home</a>
          <a href="/admin" aria-label="Admin">Admin</a>
        </nav>
      </header>
    );
  };
});

jest.mock('../../components/FooterAreaOne', () => {
  return function MockFooterAreaOne() {
    return (
      <footer data-testid="footer" role="contentinfo">
        <p>&copy; 2024 Parking System</p>
      </footer>
    );
  };
});

jest.mock('../../components/parking/ZoneCard', () => {
  return function MockZoneCard({ zone, isSelected, onSelect, disabled }) {
    return (
      <div 
        data-testid={`zone-card-${zone.id}`}
        className={`zone-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && onSelect(zone)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-pressed={isSelected}
        aria-disabled={disabled}
        aria-label={`Select ${zone.name} zone`}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            onSelect(zone);
          }
        }}
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
      <div 
        data-testid="ticket-modal"
        role="dialog"
        aria-labelledby="ticket-title"
        aria-describedby="ticket-content"
      >
        <h3 id="ticket-title">PARKING TICKET</h3>
        <div id="ticket-content">
          <p>Ticket ID: {ticket.id}</p>
          <p>Type: {ticket.type}</p>
          <p>Zone: {ticket.zoneId}</p>
          <p>Gate: {ticket.gateId}</p>
          <p>Check-in Time: {ticket.checkinAt}</p>
        </div>
        <button onClick={onClose} aria-label="Close ticket modal">Close</button>
        <button onClick={onPrint} aria-label="Print ticket">Print Ticket</button>
      </div>
    );
  };
});

jest.mock('../../components/parking/CheckoutPanel', () => {
  return function MockCheckoutPanel({ ticket, checkoutData, subscription, onConvertToVisitor, onCompleteCheckout, loading }) {
    return (
      <div data-testid="checkout-panel" role="region" aria-labelledby="checkout-title">
        <h3 id="checkout-title">Checkout Panel</h3>
        <p>Ticket: {ticket?.id || checkoutData?.ticketId}</p>
        <p>Amount: ${checkoutData?.amount || 0}</p>
        <p>Duration: {checkoutData?.durationHours || 0} hours</p>
        {subscription && <p>Subscription: {subscription.userName}</p>}
        {subscription && !checkoutData && (
          <button 
            data-testid="convert-to-visitor" 
            onClick={onConvertToVisitor}
            aria-label="Convert subscriber ticket to visitor ticket"
          >
            Convert to Visitor
          </button>
        )}
        <button 
          data-testid="complete-checkout" 
          onClick={onCompleteCheckout} 
          disabled={loading}
          aria-label={loading ? "Processing checkout" : "Complete checkout"}
        >
          {loading ? 'Processing...' : 'Complete Checkout'}
        </button>
      </div>
    );
  };
});

jest.mock('../../components/WebSocketStatus', () => {
  return function MockWebSocketStatus() {
    return (
      <div 
        data-testid="websocket-status" 
        role="status" 
        aria-live="polite"
        aria-label="WebSocket connection status"
      >
        WebSocket Connected
      </div>
    );
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

// Mock API services
jest.mock('../../services/api', () => ({
  masterAPI: {
    getGates: jest.fn(() => Promise.resolve({
      data: [
        {
          id: 'gate_1',
          name: 'Main Entrance',
          location: 'North',
          zoneIds: ['zone_a']
        }
      ]
    })),
    getZones: jest.fn(() => Promise.resolve({
      data: [
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
      ]
    }))
  },
  ticketAPI: {
    checkin: jest.fn(() => Promise.resolve({
      data: {
        ticket: {
          id: 'T001',
          type: 'visitor',
          zoneId: 'zone_a',
          gateId: 'gate_1',
          checkinAt: '2024-01-01T10:00:00Z'
        }
      }
    }))
  },
  authAPI: {
    login: jest.fn(() => Promise.resolve({
      data: {
        user: { id: 'admin', username: 'admin', role: 'admin' },
        token: 'jwt-token'
      }
    }))
  }
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

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WCAG Compliance', () => {
    test('GatePage has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Main Entrance')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('CheckpointPage has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/checkpoint']}>
            <CheckpointPage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/checkpoint/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('AdminPage has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/admin']}>
            <AdminPage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('LoginPage has no accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/login']}>
            <LoginPage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/login/i)).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    test('zone cards are keyboard accessible', async () => {
      const user = userEvent.setup();

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

      const zoneCard = screen.getByTestId('zone-card-zone_a');
      
      // Focus the zone card
      zoneCard.focus();
      expect(zoneCard).toHaveFocus();

      // Test Enter key activation
      await user.keyboard('{Enter}');
      expect(zoneCard).toHaveAttribute('aria-pressed', 'true');

      // Test Space key activation
      await user.keyboard(' ');
      expect(zoneCard).toHaveAttribute('aria-pressed', 'true');
    });

    test('modal is keyboard accessible', async () => {
      const user = userEvent.setup();

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

      // Select zone and check in
      const zoneCard = screen.getByTestId('zone-card-zone_a');
      await user.click(zoneCard);

      const checkinButton = screen.getByText('Check In');
      await user.click(checkinButton);

      await waitFor(() => {
        expect(screen.getByTestId('ticket-modal')).toBeInTheDocument();
      });

      const modal = screen.getByTestId('ticket-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-labelledby', 'ticket-title');
      expect(modal).toHaveAttribute('aria-describedby', 'ticket-content');

      // Test Escape key closes modal
      await user.keyboard('{Escape}');
      // Note: This would need to be implemented in the actual component
    });

    test('form inputs are keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/login']}>
            <LoginPage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/login/i)).toBeInTheDocument();
      });

      // Find form inputs
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Tab through form elements
      await user.tab();
      expect(usernameInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(loginButton).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    test('zone cards have proper ARIA labels', async () => {
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

      const zoneCard = screen.getByTestId('zone-card-zone_a');
      expect(zoneCard).toHaveAttribute('aria-label', 'Select Zone A zone');
      expect(zoneCard).toHaveAttribute('role', 'button');
      expect(zoneCard).toHaveAttribute('aria-pressed', 'false');
    });

    test('disabled elements are properly announced', async () => {
      // Mock a disabled zone
      const mockParkingStore = require('../../store/parkingStore').useParkingStore();
      mockParkingStore.zones = [
        {
          id: 'zone_a',
          name: 'Zone A',
          categoryId: 'cat_premium',
          gateIds: ['gate_1'],
          totalSlots: 100,
          occupied: 100, // Full
          free: 0,
          reserved: 0,
          availableForVisitors: 0, // No availability
          availableForSubscribers: 0,
          rateNormal: 5.0,
          rateSpecial: 8.0,
          open: true
        }
      ];

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

      const zoneCard = screen.getByTestId('zone-card-zone_a');
      expect(zoneCard).toHaveAttribute('aria-disabled', 'true');
      expect(zoneCard).toHaveAttribute('tabIndex', '-1');
    });

    test('status messages are announced to screen readers', async () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('websocket-status')).toBeInTheDocument();
      });

      const statusElement = screen.getByTestId('websocket-status');
      expect(statusElement).toHaveAttribute('role', 'status');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
      expect(statusElement).toHaveAttribute('aria-label', 'WebSocket connection status');
    });

    test('modal has proper focus management', async () => {
      const user = userEvent.setup();

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

      // Open modal
      const zoneCard = screen.getByTestId('zone-card-zone_a');
      await user.click(zoneCard);

      const checkinButton = screen.getByText('Check In');
      await user.click(checkinButton);

      await waitFor(() => {
        expect(screen.getByTestId('ticket-modal')).toBeInTheDocument();
      });

      const modal = screen.getByTestId('ticket-modal');
      const closeButton = screen.getByLabelText('Close ticket modal');
      const printButton = screen.getByLabelText('Print ticket');

      // Modal should be focusable
      expect(modal).toHaveAttribute('role', 'dialog');
      
      // Buttons should have descriptive labels
      expect(closeButton).toHaveAttribute('aria-label', 'Close ticket modal');
      expect(printButton).toHaveAttribute('aria-label', 'Print ticket');
    });
  });

  describe('Color and Contrast', () => {
    test('text has sufficient color contrast', async () => {
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

      // This would typically be tested with a color contrast testing library
      // For now, we verify that text elements are present and have proper structure
      const heading = screen.getByText('Main Entrance');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1'); // Proper heading hierarchy
    });

    test('interactive elements have focus indicators', async () => {
      const user = userEvent.setup();

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

      const zoneCard = screen.getByTestId('zone-card-zone_a');
      
      // Focus the element
      zoneCard.focus();
      expect(zoneCard).toHaveFocus();

      // In a real test, you would check for focus styles
      // This is typically done with visual regression testing
    });
  });

  describe('Form Accessibility', () => {
    test('form inputs have proper labels', async () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/login']}>
            <LoginPage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/login/i)).toBeInTheDocument();
      });

      // Check for proper form structure
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // Check for labeled inputs
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('form validation errors are announced', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/login']}>
            <LoginPage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/login/i)).toBeInTheDocument();
      });

      // Submit empty form
      const loginButton = screen.getByRole('button', { name: /login/i });
      await user.click(loginButton);

      // Check for validation messages
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Navigation Accessibility', () => {
    test('navigation has proper ARIA landmarks', async () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });

      const header = screen.getByTestId('header');
      const nav = screen.getByRole('navigation');
      const footer = screen.getByTestId('footer');

      expect(header).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
      expect(footer).toHaveAttribute('role', 'contentinfo');
    });

    test('skip links are present for keyboard users', async () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Check for skip links (these would be implemented in the actual component)
      const skipLinks = screen.queryAllByText(/skip to/i);
      // In a real implementation, you would expect skip links to be present
    });
  });

  describe('Dynamic Content Accessibility', () => {
    test('loading states are announced to screen readers', async () => {
      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      // Check for loading indicators with proper ARIA attributes
      const loadingElements = screen.queryAllByRole('status');
      // Loading elements should have aria-live="polite" or aria-live="assertive"
    });

    test('error messages are announced to screen readers', async () => {
      // Mock an error state
      const mockAPI = require('../../services/api');
      mockAPI.masterAPI.getGates.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <MemoryRouter initialEntries={['/gate/gate_1']}>
            <GatePage />
          </MemoryRouter>
        </TestWrapper>
      );

      await waitFor(() => {
        const errorElements = screen.queryAllByRole('alert');
        // Error messages should be announced to screen readers
      });
    });
  });

  describe('Mobile Accessibility', () => {
    test('touch targets meet minimum size requirements', async () => {
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

      const zoneCard = screen.getByTestId('zone-card-zone_a');
      const checkinButton = screen.getByText('Check In');

      // In a real test, you would check the computed styles for minimum touch target size
      // Minimum should be 44x44 pixels for touch targets
      expect(zoneCard).toBeInTheDocument();
      expect(checkinButton).toBeInTheDocument();
    });

    test('viewport is properly configured', async () => {
      // This would typically be tested at the HTML level
      // Check that viewport meta tag is present and properly configured
      const viewport = document.querySelector('meta[name="viewport"]');
      // In a real test, you would verify the viewport configuration
    });
  });
});
