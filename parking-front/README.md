# Parking Reservation System - Frontend

A React-based frontend application for a parking reservation system that supports gate check-in (visitor & subscriber), checkpoint checkout (employee), and admin control panel. This frontend integrates with the provided Node.js/Express backend and WebSocket server.

## Features

- **Gate Screen**: Check-in for visitors and subscribers with real-time zone availability
- **Checkpoint Screen**: Employee checkout with payment calculation and subscription verification
- **Admin Dashboard**: Zone management, rate control, rush hours, and vacation management
- **Real-time Updates**: WebSocket integration for live zone status updates
- **Responsive Design**: Works on desktop and tablet devices
- **Authentication**: Role-based access control (admin, employee, public)

## Tech Stack

- **React 18** with functional components and hooks
- **React Router** for navigation
- **React Query** for data fetching and caching
- **Zustand** for state management
- **Axios** for API calls
- **Bootstrap 5** for styling
- **WebSocket** for real-time updates

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- The parking system backend running on port 3000

### Installation

1. **Clone and navigate to the project directory:**
   ```bash
   cd parking-management-fullstack
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   No additional environment configuration is required. The application uses default localhost URLs that work with the provided backend.

4. **Start the backend server:**
   ```bash
   cd ../parking-back
   npm install
   npm start
   ```

5. **Start the frontend development server:**
   ```bash
   cd ../parking-front
   npm start
   ```

6. **Open your browser:**
   - Frontend: [http://localhost:3001](http://localhost:3001)
   - Backend API: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)

## Available Scripts

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Usage Guide

### Demo Accounts

The system comes with pre-configured demo accounts:

**Admin Account:**
- Username: `admin`
- Password: `adminpass`
- Access: Full admin dashboard, zone control, rate management

**Employee Account:**
- Username: `emp1`
- Password: `pass1`
- Access: Checkpoint checkout functionality

### Key Features

#### 1. Gate Screen (`/gate/:gateId`)
- **Visitor Check-in**: Select available zone and get parking ticket
- **Subscriber Check-in**: Verify subscription ID and check-in
- **Real-time Updates**: Zone availability updates via WebSocket
- **Special Rates**: Visual indicators for rush hour pricing

#### 2. Checkpoint Screen (`/checkpoint`)
- **Employee Login**: Role-based authentication
- **Ticket Lookup**: Enter ticket ID or scan QR code
- **Payment Calculation**: Server-computed breakdown with mixed rates
- **Subscription Verification**: Compare vehicle with registered cars
- **Convert to Visitor**: Handle mismatched vehicles

#### 3. Admin Dashboard (`/admin`)
- **Parking Reports**: Real-time zone occupancy and availability
- **Zone Control**: Open/close zones
- **Rate Management**: Update category pricing
- **Rush Hours**: Configure special rate periods
- **Vacations**: Set holiday periods
- **Audit Log**: Live feed of admin actions

### API Integration

The frontend integrates with the backend API endpoints:

- **Authentication**: `POST /auth/login`
- **Master Data**: `GET /master/gates`, `GET /master/zones`, `GET /master/categories`
- **Tickets**: `POST /tickets/checkin`, `POST /tickets/checkout`
- **Subscriptions**: `GET /subscriptions/:id`
- **Admin**: Various admin endpoints for management

### WebSocket Integration

Real-time updates are handled via WebSocket:

- **Connection**: `ws://localhost:3000/api/v1/ws`
- **Zone Updates**: Live zone availability changes
- **Admin Updates**: Real-time admin action notifications

## Project Structure

```
src/
├── components/
│   └── parking/           # Parking system components
│       ├── GateHeader.jsx
│       ├── ZoneCard.jsx
│       ├── TicketModal.jsx
│       ├── CheckoutPanel.jsx
│       ├── AdminReports.jsx
│       └── AdminControlPanel.jsx
├── pages/
│   ├── GatePage.jsx       # Gate check-in screen
│   ├── CheckpointPage.jsx # Employee checkout screen
│   ├── AdminPage.jsx      # Admin dashboard
│   └── LoginPage.jsx      # Authentication
├── services/
│   ├── api.js            # API client with axios
│   └── websocket.js      # WebSocket service
├── store/
│   ├── authStore.js      # Authentication state
│   └── parkingStore.js   # Parking system state
└── App.js                # Main app with routing
```

## Environment Variables

For local development, the following environment variables are used (default values work for local setup):

```env
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_WS_URL=ws://localhost:3000/api/v1/ws
```

**Note**: No additional environment configuration is required for local development. The application is designed to work with the provided backend running on localhost:3000.

## Testing

Run the test suite:
```bash
npm test
```

## Building for Production

To build the application for production:
```bash
npm run build
```

The `build` folder contains the production-ready files. Note: This project is configured for local development and testing only.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
