import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckpointPage from '../../pages/CheckpointPage';

// Mock the API services
jest.mock('../../../services/api', () => ({
  ticketAPI: {
    getTicket: jest.fn(),
    checkout: jest.fn()
  },
  subscriptionAPI: {
    getSubscription: jest.fn()
  }
}));

// Mock auth store
jest.mock('../../../store/authStore', () => ({
  __esModule: true,
  default: () => ({
    user: { id: 'emp1', username: 'emp1', role: 'employee' },
    isAuthenticated: true,
    logout: jest.fn()
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

describe('CheckpointPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders checkpoint page with ticket lookup', async () => {
    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Checkpoint - Checkout')).toBeInTheDocument();
    });

    // Check for ticket lookup input
    expect(screen.getByPlaceholderText('Enter ticket ID or scan QR code')).toBeInTheDocument();
    expect(screen.getByText('Lookup Ticket')).toBeInTheDocument();
  });

  test('handles ticket lookup for visitor ticket', async () => {
    const mockTicketAPI = require('../../../services/api').ticketAPI;
    
    mockTicketAPI.getTicket.mockResolvedValueOnce({
      data: {
        id: 't_001',
        type: 'visitor',
        zoneId: 'zone_a',
        gateId: 'gate_1',
        checkinAt: '2025-01-01T12:00:00Z'
      }
    });

    mockTicketAPI.checkout.mockResolvedValueOnce({
      data: {
        ticketId: 't_001',
        type: 'visitor',
        checkinAt: '2025-01-01T12:00:00Z',
        checkoutAt: '2025-01-01T14:00:00Z',
        durationHours: 2.0,
        amount: 10.0,
        breakdown: [
          {
            from: '2025-01-01T12:00:00Z',
            to: '2025-01-01T14:00:00Z',
            hours: 2.0,
            rate: 5.0,
            rateMode: 'normal',
            amount: 10.0
          }
        ]
      }
    });

    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Checkpoint - Checkout')).toBeInTheDocument();
    });

    // Enter ticket ID
    const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
    fireEvent.change(ticketInput, { target: { value: 't_001' } });

    // Click lookup button
    const lookupButton = screen.getByText('Lookup Ticket');
    fireEvent.click(lookupButton);

    // Should show checkout panel
    await waitFor(() => {
      expect(screen.getByText('Ticket Information')).toBeInTheDocument();
      expect(screen.getByText('Payment Breakdown')).toBeInTheDocument();
    });

    // Check ticket details
    expect(screen.getByText('t_001')).toBeInTheDocument();
    expect(screen.getByText('Visitor')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  test('handles ticket lookup for subscriber ticket', async () => {
    const mockTicketAPI = require('../../../services/api').ticketAPI;
    const mockSubscriptionAPI = require('../../../services/api').subscriptionAPI;
    
    mockTicketAPI.getTicket.mockResolvedValueOnce({
      data: {
        id: 't_002',
        type: 'subscriber',
        zoneId: 'zone_a',
        gateId: 'gate_1',
        checkinAt: '2025-01-01T12:00:00Z',
        subscriptionId: 'sub_001'
      }
    });

    mockSubscriptionAPI.getSubscription.mockResolvedValueOnce({
      data: {
        id: 'sub_001',
        userName: 'John Doe',
        category: 'premium',
        active: true,
        cars: [
          { plate: 'ABC123', brand: 'Toyota', model: 'Camry', color: 'Blue' }
        ]
      }
    });

    mockTicketAPI.checkout.mockResolvedValueOnce({
      data: {
        ticketId: 't_002',
        type: 'subscriber',
        checkinAt: '2025-01-01T12:00:00Z',
        checkoutAt: '2025-01-01T14:00:00Z',
        durationHours: 2.0,
        amount: 0.0,
        breakdown: [
          {
            from: '2025-01-01T12:00:00Z',
            to: '2025-01-01T14:00:00Z',
            hours: 2.0,
            rate: 5.0,
            rateMode: 'normal',
            amount: 0.0
          }
        ]
      }
    });

    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Checkpoint - Checkout')).toBeInTheDocument();
    });

    // Enter ticket ID
    const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
    fireEvent.change(ticketInput, { target: { value: 't_002' } });

    // Click lookup button
    const lookupButton = screen.getByText('Lookup Ticket');
    fireEvent.click(lookupButton);

    // Should show checkout panel with subscription info
    await waitFor(() => {
      expect(screen.getByText('Subscription Details')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('ABC123')).toBeInTheDocument();
    });

    // Should show subscriber summary (no payment required)
    expect(screen.getByText('Subscriber Parking')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  test('handles convert to visitor functionality', async () => {
    const mockTicketAPI = require('../../../services/api').ticketAPI;
    const mockSubscriptionAPI = require('../../../services/api').subscriptionAPI;
    
    mockTicketAPI.getTicket.mockResolvedValueOnce({
      data: {
        id: 't_002',
        type: 'subscriber',
        zoneId: 'zone_a',
        gateId: 'gate_1',
        checkinAt: '2025-01-01T12:00:00Z',
        subscriptionId: 'sub_001'
      }
    });

    mockSubscriptionAPI.getSubscription.mockResolvedValueOnce({
      data: {
        id: 'sub_001',
        userName: 'John Doe',
        category: 'premium',
        active: true,
        cars: [
          { plate: 'ABC123', brand: 'Toyota', model: 'Camry', color: 'Blue' }
        ]
      }
    });

    mockTicketAPI.checkout.mockResolvedValueOnce({
      data: {
        ticketId: 't_002',
        type: 'visitor', // Converted to visitor
        checkinAt: '2025-01-01T12:00:00Z',
        checkoutAt: '2025-01-01T14:00:00Z',
        durationHours: 2.0,
        amount: 10.0,
        breakdown: [
          {
            from: '2025-01-01T12:00:00Z',
            to: '2025-01-01T14:00:00Z',
            hours: 2.0,
            rate: 5.0,
            rateMode: 'normal',
            amount: 10.0
          }
        ]
      }
    });

    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Checkpoint - Checkout')).toBeInTheDocument();
    });

    // Enter ticket ID and lookup
    const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
    fireEvent.change(ticketInput, { target: { value: 't_002' } });

    const lookupButton = screen.getByText('Lookup Ticket');
    fireEvent.click(lookupButton);

    // Wait for subscription info to load
    await waitFor(() => {
      expect(screen.getByText('Subscription Details')).toBeInTheDocument();
    });

    // Click convert to visitor button
    const convertButton = screen.getByText('Convert to Visitor');
    fireEvent.click(convertButton);

    // Should show visitor payment breakdown
    await waitFor(() => {
      expect(screen.getByText('Payment Breakdown')).toBeInTheDocument();
      expect(screen.getByText('$10.00')).toBeInTheDocument();
    });
  });

  test('handles ticket not found error', async () => {
    const mockTicketAPI = require('../../../services/api').ticketAPI;
    
    mockTicketAPI.getTicket.mockRejectedValueOnce({
      response: {
        data: { message: 'Ticket not found' }
      }
    });

    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Checkpoint - Checkout')).toBeInTheDocument();
    });

    // Enter invalid ticket ID
    const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
    fireEvent.change(ticketInput, { target: { value: 'invalid_ticket' } });

    // Click lookup button
    const lookupButton = screen.getByText('Lookup Ticket');
    fireEvent.click(lookupButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Ticket not found')).toBeInTheDocument();
    });
  });

  test('shows instructions when no ticket is loaded', async () => {
    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Checkpoint - Checkout')).toBeInTheDocument();
    });

    // Should show instructions
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Checkout Process Instructions')).toBeInTheDocument();
    expect(screen.getByText('Visitor Tickets')).toBeInTheDocument();
    expect(screen.getByText('Subscriber Tickets')).toBeInTheDocument();
  });
});

