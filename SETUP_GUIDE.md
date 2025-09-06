# Parking Reservation System - Complete Setup Guide

This guide will help you set up and run the complete parking reservation system with both frontend and backend.

## System Overview

The parking reservation system consists of:
- **Backend**: Node.js/Express API server with WebSocket support
- **Frontend**: React application with real-time updates
- **Features**: Gate check-in, checkpoint checkout, admin dashboard

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Quick Start

### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd parking-reservations-system-task

# Install dependencies
npm install

# Start the backend server
npm start
```

The backend will start on `http://localhost:3000`

### 2. Setup Frontend

```bash
# Navigate to frontend directory (in a new terminal)
cd fixturbo

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Start the frontend development server
npm start
```

The frontend will start on `http://localhost:3001`

## Accessing the System

### Public Access (No Login Required)
- **Gate 1**: http://localhost:3001/gate/gate_1
- **Gate 2**: http://localhost:3001/gate/gate_2
- **Gate 3**: http://localhost:3001/gate/gate_3
- **Gate 4**: http://localhost:3001/gate/gate_4
- **Gate 5**: http://localhost:3001/gate/gate_5

### Employee Access (Login Required)
- **Checkpoint**: http://localhost:3001/checkpoint
- **Login**: http://localhost:3001/login

### Admin Access (Login Required)
- **Admin Dashboard**: http://localhost:3001/admin
- **Login**: http://localhost:3001/login

## Demo Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `adminpass`
- **Access**: Full admin dashboard, zone control, rate management

### Employee Account
- **Username**: `emp1`
- **Password**: `pass1`
- **Access**: Checkpoint checkout functionality

## Testing the System

### 1. Test Gate Check-in (Visitor)

1. Go to http://localhost:3001/gate/gate_1
2. Ensure "Visitor" tab is selected
3. Select an available zone (e.g., Zone A)
4. Click "Check In"
5. A ticket modal should appear with parking details

### 2. Test Gate Check-in (Subscriber)

1. Go to http://localhost:3001/gate/gate_1
2. Click "Subscriber" tab
3. Enter subscription ID: `sub_001`
4. Click "Verify"
5. Select an available zone for the subscription category
6. Click "Check In"

### 3. Test Checkpoint Checkout

1. Go to http://localhost:3001/login
2. Login with employee credentials: `emp1` / `pass1`
3. You'll be redirected to the checkpoint
4. Enter a ticket ID (e.g., `t_010` from seed data)
5. Click "Lookup"
6. Review the payment breakdown
7. Click "Complete Checkout"

### 4. Test Admin Dashboard

1. Go to http://localhost:3001/login
2. Login with admin credentials: `admin` / `adminpass`
3. You'll be redirected to the admin dashboard
4. Explore the different tabs:
   - **Parking Reports**: View real-time zone status
   - **Control Panel**: Manage zones, rates, rush hours, vacations
   - **Audit Log**: See real-time admin actions

## Real-time Features

### WebSocket Integration
- Zone availability updates in real-time
- Admin action notifications
- Connection status indicators

### Testing Real-time Updates
1. Open two browser windows:
   - Window 1: Gate screen (http://localhost:3001/gate/gate_1)
   - Window 2: Admin dashboard (http://localhost:3001/admin)
2. In the admin dashboard, close a zone
3. Watch the gate screen update in real-time

## API Testing

### Backend API Endpoints
- **Base URL**: http://localhost:3000/api/v1
- **WebSocket**: ws://localhost:3000/api/v1/ws

### Test API with curl

```bash
# Get gates
curl http://localhost:3000/api/v1/master/gates

# Get zones for gate 1
curl http://localhost:3000/api/v1/master/zones?gateId=gate_1

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass"}'
```

## Troubleshooting

### Common Issues

1. **Frontend can't connect to backend**
   - Ensure backend is running on port 3000
   - Check `.env` file has correct API URL

2. **WebSocket connection fails**
   - Verify backend WebSocket is running
   - Check browser console for connection errors

3. **Authentication issues**
   - Use the provided demo accounts
   - Check browser localStorage for auth tokens

4. **Port conflicts**
   - Backend: Change PORT in backend `.env`
   - Frontend: Change REACT_APP_API_URL in frontend `.env`

### Reset System State

To reset the system to initial state:
1. Stop the backend server (Ctrl+C)
2. Restart the backend server
3. All data will be reset to seed values

## Development

### Project Structure

```
├── parking-reservations-system-task/    # Backend
│   ├── server.js                        # Main server file
│   ├── seed.json                        # Initial data
│   ├── package.json                     # Backend dependencies
│   └── tests/                           # Backend tests
└── fixturbo/                            # Frontend
    ├── src/
    │   ├── components/parking/          # Parking components
    │   ├── pages/                       # Main pages
    │   ├── services/                    # API & WebSocket
    │   └── store/                       # State management
    ├── package.json                     # Frontend dependencies
    └── public/                          # Static assets
```

### Adding New Features

1. **Backend**: Add new endpoints in `server.js`
2. **Frontend**: Add new API calls in `services/api.js`
3. **Components**: Create new components in `components/parking/`
4. **Routes**: Add new routes in `App.js`

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Configure proper database (currently in-memory)
3. Set up proper JWT secrets
4. Configure CORS for production domain

### Frontend
1. Run `npm run build`
2. Deploy `build/` folder to web server
3. Configure environment variables for production API

## Support

For issues or questions:
1. Check the console logs in both frontend and backend
2. Verify all dependencies are installed
3. Ensure both servers are running
4. Check network connectivity between frontend and backend

## Demo Data Reference

### Gates
- Gate 1: Main Entrance (North)
- Gate 2: East Entrance (East)
- Gate 3: South Entrance (South)
- Gate 4: West Entrance (West)
- Gate 5: VIP Entrance (Executive Building)

### Zones
- Zone A: Premium (100 slots)
- Zone B: Premium (80 slots)
- Zone C: Regular (80 slots)
- Zone D: Regular (60 slots)
- Zone E: Economy (50 slots)
- Zone F: Economy (40 slots)
- Zone G: Regular (70 slots)
- Zone H: Economy (120 slots)
- VIP Zone: VIP (30 slots)

### Sample Tickets
- `t_010`: Subscriber ticket in Zone C
- `t_015`: Subscriber ticket in VIP Zone
- `t_020`: Completed visitor ticket
- `t_025`: Active visitor ticket in Zone A
- `t_030`: Active visitor ticket in Zone H

### Sample Subscriptions
- `sub_001`: Ali - Premium category
- `sub_002`: Sara - Regular category (currently checked in)
- `sub_003`: Mohammed - Economy category
- `sub_004`: Fatima - VIP category (currently checked in)
- `sub_005`: Ahmed - Regular category
- `sub_006`: Layla - Premium category (inactive)















