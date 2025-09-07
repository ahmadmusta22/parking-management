import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from './App';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock components
jest.mock('./components/HeaderOne', () => {
  return function MockHeaderOne() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('./components/FooterAreaOne', () => {
  return function MockFooterAreaOne() {
    return <div data-testid="footer">Footer</div>;
  };
});

jest.mock('./components/WebSocketStatus', () => {
  return function MockWebSocketStatus() {
    return <div data-testid="websocket-status">WebSocket Connected</div>;
  };
});

// Mock stores
jest.mock('./store/authStore', () => ({
  __esModule: true,
  useAuthStore: () => ({
    user: null,
    isAuthenticated: false,
    logout: jest.fn()
  })
}));

jest.mock('./store/parkingStore', () => ({
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
jest.mock('./services/websocket', () => ({
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

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('has no accessibility violations', async () => {
    const { container } = render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('renders main navigation', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('displays WebSocket status', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    expect(screen.getByTestId('websocket-status')).toBeInTheDocument();
  });

  test('handles routing correctly', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Should render home page by default
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });
});
