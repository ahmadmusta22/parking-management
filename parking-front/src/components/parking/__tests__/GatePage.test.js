import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GatePage from '../../pages/GatePage';

// Mock the API and WebSocket services
jest.mock('../../../services/api', () => ({
  masterAPI: {
    getGates: jest.fn(() => Promise.resolve({
      data: [
        { id: 'gate_1', name: 'Main Entrance', location: 'North', zoneIds: ['zone_a'] }
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
          id: 't_001',
          type: 'visitor',
          zoneId: 'zone_a',
          gateId: 'gate_1',
          checkinAt: '2025-01-01T12:00:00Z'
        },
        zoneState: {}
      }
    }))
  }
}));

jest.mock('../../../services/websocket', () => ({
  connect: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
}));

jest.mock('../../../store/parkingStore', () => ({
  __esModule: true,
  default: () => ({
    gates: [],
    currentGate: null,
    currentGateZones: [],
    wsConnected: true,
    setCurrentGate: jest.fn(),
    updateZone: jest.fn(),
    setWSConnected: jest.fn(),
    setWSError: jest.fn()
  })
}));

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ gateId: 'gate_1' }),
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

describe('GatePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders gate page with header and tabs', async () => {
    render(
      <TestWrapper>
        <GatePage />
      </TestWrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Main Entrance')).toBeInTheDocument();
    });

    // Check for tabs
    expect(screen.getByText('Visitor')).toBeInTheDocument();
    expect(screen.getByText('Subscriber')).toBeInTheDocument();
  });

  test('shows zone cards when data is loaded', async () => {
    render(
      <TestWrapper>
        <GatePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Zone A')).toBeInTheDocument();
    });

    // Check zone information
    expect(screen.getByText('100')).toBeInTheDocument(); // Total slots
    expect(screen.getByText('60')).toBeInTheDocument(); // Occupied
    expect(screen.getByText('40')).toBeInTheDocument(); // Free
  });

  test('allows zone selection for visitors', async () => {
    render(
      <TestWrapper>
        <GatePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Zone A')).toBeInTheDocument();
    });

    // Click on zone card
    const zoneCard = screen.getByText('Zone A').closest('.zone-card');
    fireEvent.click(zoneCard);

    // Check if zone is selected
    expect(screen.getByText('Selected for check-in')).toBeInTheDocument();
  });

  test('shows check-in button when zone is selected', async () => {
    render(
      <TestWrapper>
        <GatePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Zone A')).toBeInTheDocument();
    });

    // Select zone
    const zoneCard = screen.getByText('Zone A').closest('.zone-card');
    fireEvent.click(zoneCard);

    // Check for check-in button
    expect(screen.getByText('Check In')).toBeInTheDocument();
  });

  test('disables zone selection when zone is unavailable', async () => {
    // Mock unavailable zone
    const mockAPI = require('../../../services/api');
    mockAPI.masterAPI.getZones.mockResolvedValueOnce({
      data: [
        {
          id: 'zone_a',
          name: 'Zone A',
          categoryId: 'cat_premium',
          gateIds: ['gate_1'],
          totalSlots: 100,
          occupied: 100, // Full
          free: 0,
          reserved: 0,
          availableForVisitors: 0, // No visitor slots
          availableForSubscribers: 0,
          rateNormal: 5.0,
          rateSpecial: 8.0,
          open: true
        }
      ]
    });

    render(
      <TestWrapper>
        <GatePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Zone A')).toBeInTheDocument();
    });

    // Zone should be disabled
    const zoneCard = screen.getByText('Zone A').closest('.zone-card');
    expect(zoneCard).toHaveClass('disabled');
  });

  test('handles check-in process for visitor', async () => {
    render(
      <TestWrapper>
        <GatePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Zone A')).toBeInTheDocument();
    });

    // Select zone
    const zoneCard = screen.getByText('Zone A').closest('.zone-card');
    fireEvent.click(zoneCard);

    // Click check-in button
    const checkinButton = screen.getByText('Check In');
    fireEvent.click(checkinButton);

    // Should show ticket modal
    await waitFor(() => {
      expect(screen.getByText('PARKING TICKET')).toBeInTheDocument();
    });
  });

  test('switches between visitor and subscriber tabs', async () => {
    render(
      <TestWrapper>
        <GatePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Zone A')).toBeInTheDocument();
    });

    // Click subscriber tab
    const subscriberTab = screen.getByText('Subscriber');
    fireEvent.click(subscriberTab);

    // Should show subscription verification
    expect(screen.getByText('Subscription ID')).toBeInTheDocument();
  });
});









