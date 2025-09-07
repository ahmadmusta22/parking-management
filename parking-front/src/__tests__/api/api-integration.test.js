import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useQuery, useMutation } from '@tanstack/react-query';
import { masterAPI, ticketAPI, authAPI, adminAPI } from '../../services/api';

// Test components that use the API
const TestGateComponent = () => {
  const { data: gates, isLoading: gatesLoading, error: gatesError } = useQuery({
    queryKey: ['gates'],
    queryFn: () => masterAPI.getGates()
  });

  const { data: zones, isLoading: zonesLoading, error: zonesError } = useQuery({
    queryKey: ['zones', 'gate_1'],
    queryFn: () => masterAPI.getZones('gate_1')
  });

  if (gatesLoading || zonesLoading) return <div>Loading...</div>;
  if (gatesError || zonesError) return <div>Error: {gatesError?.message || zonesError?.message}</div>;

  return (
    <div>
      <h2>Gates</h2>
      {gates?.data?.map(gate => (
        <div key={gate.id} data-testid={`gate-${gate.id}`}>
          {gate.name} - {gate.location}
        </div>
      ))}
      
      <h2>Zones</h2>
      {zones?.data?.map(zone => (
        <div key={zone.id} data-testid={`zone-${zone.id}`}>
          {zone.name} - Free: {zone.free}, Occupied: {zone.occupied}
        </div>
      ))}
    </div>
  );
};

const TestCheckinComponent = () => {
  const checkinMutation = useMutation({
    mutationFn: (data) => ticketAPI.checkin(data),
    onSuccess: (response) => {
      console.log('Check-in successful:', response.data);
    },
    onError: (error) => {
      console.error('Check-in failed:', error.message);
    }
  });

  const handleCheckin = () => {
    checkinMutation.mutate({
      gateId: 'gate_1',
      zoneId: 'zone_a',
      type: 'visitor'
    });
  };

  return (
    <div>
      <button 
        onClick={handleCheckin}
        disabled={checkinMutation.isPending}
        data-testid="checkin-btn"
      >
        {checkinMutation.isPending ? 'Checking in...' : 'Check In'}
      </button>
      
      {checkinMutation.isSuccess && (
        <div data-testid="checkin-success">
          Check-in successful! Ticket: {checkinMutation.data?.data?.ticket?.id}
        </div>
      )}
      
      {checkinMutation.isError && (
        <div data-testid="checkin-error">
          Error: {checkinMutation.error?.message}
        </div>
      )}
    </div>
  );
};

const TestAuthComponent = () => {
  const loginMutation = useMutation({
    mutationFn: (credentials) => authAPI.login(credentials),
    onSuccess: (response) => {
      console.log('Login successful:', response.data);
    },
    onError: (error) => {
      console.error('Login failed:', error.message);
    }
  });

  const handleLogin = () => {
    loginMutation.mutate({
      username: 'admin',
      password: 'adminpass'
    });
  };

  return (
    <div>
      <button 
        onClick={handleLogin}
        disabled={loginMutation.isPending}
        data-testid="login-btn"
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
      
      {loginMutation.isSuccess && (
        <div data-testid="login-success">
          Welcome, {loginMutation.data?.data?.user?.username}!
        </div>
      )}
      
      {loginMutation.isError && (
        <div data-testid="login-error">
          Error: {loginMutation.error?.message}
        </div>
      )}
    </div>
  );
};

const TestAdminComponent = () => {
  const { data: reports, isLoading: reportsLoading, error: reportsError } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => adminAPI.getParkingStateReport(),
    enabled: true
  });

  const updateZoneMutation = useMutation({
    mutationFn: ({ zoneId, open }) => adminAPI.updateZoneStatus(zoneId, open),
    onSuccess: (response) => {
      console.log('Zone updated:', response.data);
    },
    onError: (error) => {
      console.error('Zone update failed:', error.message);
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, data }) => adminAPI.updateCategory(categoryId, data),
    onSuccess: (response) => {
      console.log('Category updated:', response.data);
    },
    onError: (error) => {
      console.error('Category update failed:', error.message);
    }
  });

  const handleUpdateZone = () => {
    updateZoneMutation.mutate({
      zoneId: 'zone_a',
      open: false
    });
  };

  const handleUpdateCategory = () => {
    updateCategoryMutation.mutate({
      categoryId: 'cat_premium',
      data: { rateNormal: 6.0, rateSpecial: 9.0 }
    });
  };

  if (reportsLoading) return <div>Loading reports...</div>;
  if (reportsError) return <div>Error: {reportsError.message}</div>;

  return (
    <div>
      <h2>Parking Reports</h2>
      {reports?.data?.map(zone => (
        <div key={zone.id} data-testid={`report-zone-${zone.id}`}>
          {zone.name}: {zone.occupied}/{zone.occupied + zone.free} occupied
        </div>
      ))}
      
      <button 
        onClick={handleUpdateZone}
        disabled={updateZoneMutation.isPending}
        data-testid="update-zone-btn"
      >
        {updateZoneMutation.isPending ? 'Updating...' : 'Close Zone'}
      </button>
      
      <button 
        onClick={handleUpdateCategory}
        disabled={updateCategoryMutation.isPending}
        data-testid="update-category-btn"
      >
        {updateCategoryMutation.isPending ? 'Updating...' : 'Update Category'}
      </button>
      
      {updateZoneMutation.isSuccess && (
        <div data-testid="zone-update-success">Zone updated successfully!</div>
      )}
      
      {updateCategoryMutation.isSuccess && (
        <div data-testid="category-update-success">Category updated successfully!</div>
      )}
    </div>
  );
};

// Setup MSW server with comprehensive API mocking
const server = setupServer(
  // Master API endpoints
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

  rest.get('http://localhost:3000/api/v1/master/zones', (req, res, ctx) => {
    const gateId = req.url.searchParams.get('gateId');
    
    const zones = [
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
      },
      {
        id: 'zone_c',
        name: 'Zone C',
        categoryId: 'cat_premium',
        gateIds: ['gate_2'],
        totalSlots: 75,
        occupied: 45,
        free: 30,
        reserved: 10,
        availableForVisitors: 20,
        availableForSubscribers: 30,
        rateNormal: 5.0,
        rateSpecial: 8.0,
        open: true
      }
    ];

    const filteredZones = gateId ? zones.filter(zone => zone.gateIds.includes(gateId)) : zones;
    
    return res(ctx.json(filteredZones));
  }),

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

  // Authentication endpoints
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

  // Ticket endpoints
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
    
    return res(ctx.status(404), ctx.json({
      status: 'error',
      message: 'Ticket not found'
    }));
  }),

  // Subscription endpoints
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

  // Admin endpoints
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

  rest.put('http://localhost:3000/api/v1/admin/zones/:id/open', (req, res, ctx) => {
    const { id } = req.params;
    const { open } = req.body;
    
    return res(ctx.json({
      id,
      open,
      message: 'Zone status updated successfully'
    }));
  }),

  rest.put('http://localhost:3000/api/v1/admin/categories/:id', (req, res, ctx) => {
    const { id } = req.params;
    const data = req.body;
    
    return res(ctx.json({
      id,
      ...data,
      message: 'Category updated successfully'
    }));
  }),

  rest.get('http://localhost:3000/api/v1/admin/categories', (req, res, ctx) => {
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

  rest.get('http://localhost:3000/api/v1/admin/zones', (req, res, ctx) => {
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

  rest.post('http://localhost:3000/api/v1/admin/rush-hours', (req, res, ctx) => {
    return res(ctx.json({
      id: 'rush_001',
      ...req.body,
      message: 'Rush hour created successfully'
    }));
  }),

  rest.post('http://localhost:3000/api/v1/admin/vacations', (req, res, ctx) => {
    return res(ctx.json({
      id: 'vacation_001',
      ...req.body,
      message: 'Vacation created successfully'
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
      {children}
    </QueryClientProvider>
  );
};

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Master API Integration', () => {
    test('fetches gates successfully', async () => {
      render(
        <TestWrapper>
          <TestGateComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('gate-gate_1')).toBeInTheDocument();
      });

      expect(screen.getByText('Main Entrance - North')).toBeInTheDocument();
      expect(screen.getByText('Secondary Entrance - South')).toBeInTheDocument();
    });

    test('fetches zones for specific gate', async () => {
      render(
        <TestWrapper>
          <TestGateComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('zone-zone_a')).toBeInTheDocument();
      });

      expect(screen.getByText('Zone A - Free: 40, Occupied: 60')).toBeInTheDocument();
      expect(screen.getByText('Zone B - Free: 20, Occupied: 30')).toBeInTheDocument();
    });

    test('handles API errors gracefully', async () => {
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
          <TestGateComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication API Integration', () => {
    test('login with valid credentials', async () => {
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const loginButton = screen.getByTestId('login-btn');
      loginButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('login-success')).toBeInTheDocument();
      });

      expect(screen.getByText('Welcome, admin!')).toBeInTheDocument();
    });

    test('login with invalid credentials', async () => {
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
          <TestAuthComponent />
        </TestWrapper>
      );

      const loginButton = screen.getByTestId('login-btn');
      loginButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toBeInTheDocument();
      });

      expect(screen.getByText('Error: Invalid credentials')).toBeInTheDocument();
    });
  });

  describe('Ticket API Integration', () => {
    test('visitor check-in flow', async () => {
      render(
        <TestWrapper>
          <TestCheckinComponent />
        </TestWrapper>
      );

      const checkinButton = screen.getByTestId('checkin-btn');
      checkinButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('checkin-success')).toBeInTheDocument();
      });

      expect(screen.getByText('Check-in successful! Ticket: T001')).toBeInTheDocument();
    });

    test('check-in with invalid data', async () => {
      server.use(
        rest.post('http://localhost:3000/api/v1/tickets/checkin', (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({
            status: 'error',
            message: 'Invalid check-in request'
          }));
        })
      );

      render(
        <TestWrapper>
          <TestCheckinComponent />
        </TestWrapper>
      );

      const checkinButton = screen.getByTestId('checkin-btn');
      checkinButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('checkin-error')).toBeInTheDocument();
      });

      expect(screen.getByText('Error: Invalid check-in request')).toBeInTheDocument();
    });
  });

  describe('Admin API Integration', () => {
    test('fetches parking state reports', async () => {
      render(
        <TestWrapper>
          <TestAdminComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('report-zone-zone_a')).toBeInTheDocument();
      });

      expect(screen.getByText('Zone A: 60/100 occupied')).toBeInTheDocument();
      expect(screen.getByText('Zone B: 30/50 occupied')).toBeInTheDocument();
    });

    test('updates zone status', async () => {
      render(
        <TestWrapper>
          <TestAdminComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('update-zone-btn')).toBeInTheDocument();
      });

      const updateZoneButton = screen.getByTestId('update-zone-btn');
      updateZoneButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('zone-update-success')).toBeInTheDocument();
      });

      expect(screen.getByText('Zone updated successfully!')).toBeInTheDocument();
    });

    test('updates category rates', async () => {
      render(
        <TestWrapper>
          <TestAdminComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('update-category-btn')).toBeInTheDocument();
      });

      const updateCategoryButton = screen.getByTestId('update-category-btn');
      updateCategoryButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('category-update-success')).toBeInTheDocument();
      });

      expect(screen.getByText('Category updated successfully!')).toBeInTheDocument();
    });
  });

  describe('API Error Handling', () => {
    test('handles network timeout', async () => {
      server.use(
        rest.get('http://localhost:3000/api/v1/master/gates', (req, res, ctx) => {
          return res.networkError('Network timeout');
        })
      );

      render(
        <TestWrapper>
          <TestGateComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    test('handles malformed JSON response', async () => {
      server.use(
        rest.get('http://localhost:3000/api/v1/master/gates', (req, res, ctx) => {
          return res(ctx.text('invalid json'));
        })
      );

      render(
        <TestWrapper>
          <TestGateComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    test('handles 404 errors', async () => {
      server.use(
        rest.get('http://localhost:3000/api/v1/tickets/NOTFOUND', (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({
            status: 'error',
            message: 'Ticket not found'
          }));
        })
      );

      // This would be tested with a component that fetches a specific ticket
      const response = await ticketAPI.getTicket('NOTFOUND');
      expect(response.status).toBe(404);
    });
  });

  describe('API Request/Response Validation', () => {
    test('validates request payload structure', async () => {
      const checkinData = {
        gateId: 'gate_1',
        zoneId: 'zone_a',
        type: 'visitor'
      };

      const response = await ticketAPI.checkin(checkinData);
      expect(response.data.ticket).toHaveProperty('id');
      expect(response.data.ticket).toHaveProperty('type', 'visitor');
      expect(response.data.ticket).toHaveProperty('zoneId', 'zone_a');
      expect(response.data.ticket).toHaveProperty('gateId', 'gate_1');
    });

    test('validates response data structure', async () => {
      const gates = await masterAPI.getGates();
      
      expect(Array.isArray(gates.data)).toBe(true);
      expect(gates.data[0]).toHaveProperty('id');
      expect(gates.data[0]).toHaveProperty('name');
      expect(gates.data[0]).toHaveProperty('location');
      expect(gates.data[0]).toHaveProperty('zoneIds');
    });
  });

  describe('API Performance and Caching', () => {
    test('implements proper caching for repeated requests', async () => {
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

      render(
        <QueryClientProvider client={queryClient}>
          <TestCachingComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('gates-count')).toBeInTheDocument();
      });

      // Second render should use cache
      render(
        <QueryClientProvider client={queryClient}>
          <TestCachingComponent />
        </QueryClientProvider>
      );

      // Should not make another network request
      expect(screen.getByTestId('gates-count')).toBeInTheDocument();
    });
  });
});
