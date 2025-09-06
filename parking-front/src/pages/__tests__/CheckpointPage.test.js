import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckpointPage from '../CheckpointPage';

// Mock the API services
jest.mock('../../services/api', () => ({
  ticketAPI: {
    getTicket: jest.fn(),
    checkout: jest.fn()
  },
  subscriptionAPI: {
    getSubscription: jest.fn()
  }
}));

// Mock the auth store
jest.mock('../../store/authStore', () => ({
  __esModule: true,
  default: () => ({
    user: { id: 'emp1', username: 'emp1', role: 'employee', name: 'Employee One' },
    isAuthenticated: true,
    logout: jest.fn()
  })
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

jest.mock('../../components/parking/CheckoutPanel', () => {
  return function MockCheckoutPanel({ ticket, checkoutData, subscription, onConvertToVisitor, onCompleteCheckout, loading }) {
    return (
      <div data-testid="checkout-panel">
        <div data-testid="ticket-info">{ticket?.id || 'No ticket'}</div>
        <div data-testid="checkout-data">{checkoutData ? 'Checkout data available' : 'No checkout data'}</div>
        <div data-testid="subscription-info">{subscription ? 'Subscription available' : 'No subscription'}</div>
        <button 
          data-testid="convert-to-visitor" 
          onClick={onConvertToVisitor}
          disabled={loading}
        >
          Convert to Visitor
        </button>
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

// Mock window.alert
global.alert = jest.fn();

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

describe('CheckpointPage', () => {
  const { ticketAPI, subscriptionAPI } = require('../../services/api');

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful authentication
    jest.doMock('../../store/authStore', () => ({
      __esModule: true,
      default: () => ({
        user: { id: 'emp1', username: 'emp1', role: 'employee', name: 'Employee One' },
        isAuthenticated: true,
        logout: jest.fn()
      })
    }));
  });

  test('renders checkpoint page with header and ticket input', async () => {
    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    // Wait for preloader to finish
    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Check for main elements
    expect(screen.getByText('Checkpoint - Checkout')).toBeInTheDocument();
    expect(screen.getByText('Employee: Employee One')).toBeInTheDocument();
    expect(screen.getByText('Ticket Lookup')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter ticket ID or scan QR code')).toBeInTheDocument();
    expect(screen.getByText('Lookup')).toBeInTheDocument();
  });

  test('shows instructions when no ticket is loaded', async () => {
    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Check for instructions
    expect(screen.getByText('Instructions')).toBeInTheDocument();
    expect(screen.getByText('For Visitor Tickets:')).toBeInTheDocument();
    expect(screen.getByText('For Subscriber Tickets:')).toBeInTheDocument();
  });

  test('handles ticket lookup for visitor ticket', async () => {
    const mockTicket = {
      id: 'T001',
      type: 'visitor',
      checkinAt: '2024-01-01T10:00:00Z',
      zoneId: 'zone_a',
      gateId: 'gate_1'
    };

    const mockCheckoutData = {
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
    };

    ticketAPI.getTicket.mockResolvedValue({ data: mockTicket });
    ticketAPI.checkout.mockResolvedValue({ data: mockCheckoutData });

    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Enter ticket ID and lookup
    const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
    const lookupButton = screen.getByText('Lookup');

    fireEvent.change(ticketInput, { target: { value: 'T001' } });
    fireEvent.click(lookupButton);

    // Wait for API calls
    await waitFor(() => {
      expect(ticketAPI.getTicket).toHaveBeenCalledWith('T001');
      expect(ticketAPI.checkout).toHaveBeenCalledWith({
        ticketId: 'T001',
        forceConvertToVisitor: false
      });
    });

    // Check that checkout panel is displayed
    await waitFor(() => {
      expect(screen.getByTestId('checkout-panel')).toBeInTheDocument();
      expect(screen.getByTestId('ticket-info')).toHaveTextContent('T001');
      expect(screen.getByTestId('checkout-data')).toHaveTextContent('Checkout data available');
    });
  });

  test('handles ticket lookup for subscriber ticket with subscription', async () => {
    const mockTicket = {
      id: 'T002',
      type: 'subscriber',
      checkinAt: '2024-01-01T10:00:00Z',
      zoneId: 'zone_a',
      gateId: 'gate_1',
      subscriptionId: 'SUB001'
    };

    const mockSubscription = {
      id: 'SUB001',
      userName: 'John Doe',
      category: 'premium',
      active: true,
      cars: [
        { plate: 'ABC123', brand: 'Toyota', model: 'Camry', color: 'Blue' }
      ]
    };

    const mockCheckoutData = {
      ticketId: 'T002',
      type: 'subscriber',
      checkinAt: '2024-01-01T10:00:00Z',
      checkoutAt: '2024-01-01T12:00:00Z',
      durationHours: 2.0,
      amount: 0.0,
      breakdown: []
    };

    ticketAPI.getTicket.mockResolvedValue({ data: mockTicket });
    subscriptionAPI.getSubscription.mockResolvedValue({ data: mockSubscription });
    ticketAPI.checkout.mockResolvedValue({ data: mockCheckoutData });

    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Enter ticket ID and lookup
    const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
    const lookupButton = screen.getByText('Lookup');

    fireEvent.change(ticketInput, { target: { value: 'T002' } });
    fireEvent.click(lookupButton);

    // Wait for API calls
    await waitFor(() => {
      expect(ticketAPI.getTicket).toHaveBeenCalledWith('T002');
      expect(subscriptionAPI.getSubscription).toHaveBeenCalledWith('SUB001');
      expect(ticketAPI.checkout).toHaveBeenCalledWith({
        ticketId: 'T002',
        forceConvertToVisitor: false
      });
    });

    // Check that checkout panel is displayed with subscription info
    await waitFor(() => {
      expect(screen.getByTestId('checkout-panel')).toBeInTheDocument();
      expect(screen.getByTestId('ticket-info')).toHaveTextContent('T002');
      expect(screen.getByTestId('subscription-info')).toHaveTextContent('Subscription available');
    });
  });

  test('handles convert to visitor functionality', async () => {
    const mockTicket = {
      id: 'T002',
      type: 'subscriber',
      checkinAt: '2024-01-01T10:00:00Z',
      zoneId: 'zone_a',
      gateId: 'gate_1',
      subscriptionId: 'SUB001'
    };

    const mockSubscription = {
      id: 'SUB001',
      userName: 'John Doe',
      category: 'premium',
      active: true,
      cars: []
    };

    const mockCheckoutData = {
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
    };

    ticketAPI.getTicket.mockResolvedValue({ data: mockTicket });
    subscriptionAPI.getSubscription.mockResolvedValue({ data: mockSubscription });
    ticketAPI.checkout
      .mockResolvedValueOnce({ data: { ...mockCheckoutData, amount: 0.0 } }) // Initial checkout
      .mockResolvedValueOnce({ data: mockCheckoutData }); // Convert to visitor

    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Enter ticket ID and lookup
    const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
    const lookupButton = screen.getByText('Lookup');

    fireEvent.change(ticketInput, { target: { value: 'T002' } });
    fireEvent.click(lookupButton);

    // Wait for initial checkout panel
    await waitFor(() => {
      expect(screen.getByTestId('checkout-panel')).toBeInTheDocument();
    });

    // Click convert to visitor
    const convertButton = screen.getByTestId('convert-to-visitor');
    fireEvent.click(convertButton);

    // Wait for convert to visitor API call
    await waitFor(() => {
      expect(ticketAPI.checkout).toHaveBeenCalledWith({
        ticketId: 'T002',
        forceConvertToVisitor: true
      });
    });
  });

  test('handles complete checkout functionality', async () => {
    const mockTicket = {
      id: 'T001',
      type: 'visitor',
      checkinAt: '2024-01-01T10:00:00Z',
      zoneId: 'zone_a',
      gateId: 'gate_1'
    };

    const mockCheckoutData = {
      ticketId: 'T001',
      type: 'visitor',
      checkinAt: '2024-01-01T10:00:00Z',
      checkoutAt: '2024-01-01T12:00:00Z',
      durationHours: 2.0,
      amount: 10.0,
      breakdown: []
    };

    ticketAPI.getTicket.mockResolvedValue({ data: mockTicket });
    ticketAPI.checkout.mockResolvedValue({ data: mockCheckoutData });

    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Enter ticket ID and lookup
    const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
    const lookupButton = screen.getByText('Lookup');

    fireEvent.change(ticketInput, { target: { value: 'T001' } });
    fireEvent.click(lookupButton);

    // Wait for checkout panel
    await waitFor(() => {
      expect(screen.getByTestId('checkout-panel')).toBeInTheDocument();
    });

    // Click complete checkout
    const completeButton = screen.getByTestId('complete-checkout');
    fireEvent.click(completeButton);

    // Check that alert was called
    expect(global.alert).toHaveBeenCalledWith('Checkout completed successfully!');

    // Check that form was reset
    await waitFor(() => {
      expect(ticketInput.value).toBe('');
      expect(screen.queryByTestId('checkout-panel')).not.toBeInTheDocument();
    });
  });

  test('handles ticket lookup errors', async () => {
    ticketAPI.getTicket.mockRejectedValue({
      response: { data: { message: 'Ticket not found' } }
    });

    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Enter ticket ID and lookup
    const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
    const lookupButton = screen.getByText('Lookup');

    fireEvent.change(ticketInput, { target: { value: 'INVALID' } });
    fireEvent.click(lookupButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Ticket not found')).toBeInTheDocument();
    });
  });

  test('handles empty ticket ID input', async () => {
    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Click lookup without entering ticket ID
    const lookupButton = screen.getByText('Lookup');
    fireEvent.click(lookupButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Please enter a ticket ID')).toBeInTheDocument();
    });
  });

  test('handles Enter key press for ticket lookup', async () => {
    const mockTicket = {
      id: 'T001',
      type: 'visitor',
      checkinAt: '2024-01-01T10:00:00Z',
      zoneId: 'zone_a',
      gateId: 'gate_1'
    };

    const mockCheckoutData = {
      ticketId: 'T001',
      type: 'visitor',
      checkinAt: '2024-01-01T10:00:00Z',
      checkoutAt: '2024-01-01T12:00:00Z',
      durationHours: 2.0,
      amount: 10.0,
      breakdown: []
    };

    ticketAPI.getTicket.mockResolvedValue({ data: mockTicket });
    ticketAPI.checkout.mockResolvedValue({ data: mockCheckoutData });

    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Enter ticket ID and press Enter
    const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
    
    fireEvent.change(ticketInput, { target: { value: 'T001' } });
    fireEvent.keyPress(ticketInput, { key: 'Enter', code: 'Enter' });

    // Wait for API calls
    await waitFor(() => {
      expect(ticketAPI.getTicket).toHaveBeenCalledWith('T001');
    });
  });

  test('shows loading state during ticket lookup', async () => {
    // Mock a delayed response
    ticketAPI.getTicket.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    );

    render(
      <TestWrapper>
        <CheckpointPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
    });

    // Enter ticket ID and lookup
    const ticketInput = screen.getByPlaceholderText('Enter ticket ID or scan QR code');
    const lookupButton = screen.getByText('Lookup');

    fireEvent.change(ticketInput, { target: { value: 'T001' } });
    fireEvent.click(lookupButton);

    // Check for loading state
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(lookupButton).toBeDisabled();
  });
});


