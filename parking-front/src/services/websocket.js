class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10; // Increased from 5
    this.reconnectInterval = 1000; // Start with 1 second
    this.listeners = new Map();
    this.subscriptions = new Set();
    this.isConnected = false;
    this.offlineMode = false;
    this.pendingMessages = [];
    this.connectionCheckInterval = null;
    this.lastConnected = null;
    this.lastDisconnected = null;
    this.connectionErrors = [];
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.maxHeartbeatFailures = 3;
    this.heartbeatFailures = 0;
    this.isManualDisconnect = false;
  }

  connect() {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3000/api/v1/ws';
    
    try {
      // Clean up existing connection
      if (this.ws) {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.close();
      }

      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.heartbeatFailures = 0;
        this.isConnected = true;
        this.offlineMode = false;
        this.lastConnected = new Date().toISOString();
        this.isManualDisconnect = false;
        
        // Clear connection errors on successful connection
        this.connectionErrors = [];
        
        // Send pending messages
        this.sendPendingMessages();
        
        // Resubscribe to all previous subscriptions
        this.subscriptions.forEach(gateId => {
          this.subscribe(gateId);
        });
        
        this.emit('connected');
        this.startConnectionCheck();
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle heartbeat responses
          if (message.type === 'pong') {
            this.handleHeartbeatResponse();
            return;
          }
          
          this.emit(message.type, message.payload);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.recordConnectionError('parse_error', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.isConnected = false;
        this.offlineMode = true;
        this.lastDisconnected = new Date().toISOString();
        this.stopConnectionCheck();
        this.stopHeartbeat();
        
        // Record close reason
        this.recordConnectionError('connection_closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Only attempt to reconnect if it wasn't a manual disconnect
        if (!this.isManualDisconnect) {
          this.reconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.recordConnectionError('websocket_error', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.recordConnectionError('connection_failed', error);
      this.emit('error', error);
    }
  }

  disconnect() {
    this.isManualDisconnect = true;
    this.stopConnectionCheck();
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.listeners.clear();
    this.isConnected = false;
    this.offlineMode = true;
  }

  subscribe(gateId) {
    const message = {
      type: 'subscribe',
      payload: { gateId }
    };

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // console.warn('WebSocket not connected, queuing subscription');
      this.pendingMessages.push(message);
      this.subscriptions.add(gateId);
      return;
    }

    this.ws.send(JSON.stringify(message));
    this.subscriptions.add(gateId);
  }

  unsubscribe(gateId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: 'unsubscribe',
      payload: { gateId }
    };

    this.ws.send(JSON.stringify(message));
    this.subscriptions.delete(gateId);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          // console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      offlineMode: this.offlineMode,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
      pendingMessages: this.pendingMessages.length
    };
  }

  sendPendingMessages() {
    if (this.pendingMessages.length > 0) {
      this.pendingMessages.forEach(message => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(message));
        }
      });
      this.pendingMessages = [];
    }
  }

  startConnectionCheck() {
    this.connectionCheckInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Send ping to check connection
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Check every 30 seconds
  }

  stopConnectionCheck() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }

  setOfflineMode(offline) {
    this.offlineMode = offline;
    if (offline) {
      this.emit('offline');
    }
  }

  isOffline() {
    return this.offlineMode || !this.isConnected;
  }

  // Record connection errors for debugging
  recordConnectionError(type, error) {
    const errorRecord = {
      type,
      error: error?.message || error,
      timestamp: new Date().toISOString(),
      reconnectAttempts: this.reconnectAttempts,
      connectionState: this.ws?.readyState
    };
    
    this.connectionErrors.push(errorRecord);
    
    // Keep only last 50 errors
    if (this.connectionErrors.length > 50) {
      this.connectionErrors.shift();
    }
  }

  // Start heartbeat to monitor connection health
  startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing heartbeat
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
        
        // Set timeout for heartbeat response
        this.heartbeatTimeout = setTimeout(() => {
          this.heartbeatFailures++;
          console.warn(`Heartbeat failed (${this.heartbeatFailures}/${this.maxHeartbeatFailures})`);
          
          if (this.heartbeatFailures >= this.maxHeartbeatFailures) {
            console.error('Max heartbeat failures reached, reconnecting...');
            this.forceReconnect();
          }
        }, 5000); // 5 second timeout
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Stop heartbeat monitoring
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // Handle heartbeat response
  handleHeartbeatResponse() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    
    this.heartbeatFailures = 0;
  }

  // Get connection health status
  getConnectionHealth() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      heartbeatFailures: this.heartbeatFailures,
      lastConnected: this.lastConnected,
      lastDisconnected: this.lastDisconnected,
      recentErrors: this.connectionErrors.slice(-10),
      pendingMessages: this.pendingMessages.length,
      subscriptions: Array.from(this.subscriptions)
    };
  }

  // Enhanced reconnection with exponential backoff
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached, giving up');
      this.emit('max-reconnect-attempts');
      return;
    }

    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 seconds
    );

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}`);
      this.connect();
    }, delay);
  }

  // Force reconnection
  forceReconnect() {
    console.log('Force reconnecting WebSocket...');
    this.reconnectAttempts = 0;
    this.heartbeatFailures = 0;
    this.isManualDisconnect = false;
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      connected: this.isConnected,
      offlineMode: this.offlineMode,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      pendingMessages: this.pendingMessages.length,
      subscriptions: Array.from(this.subscriptions),
      lastConnected: this.lastConnected,
      lastDisconnected: this.lastDisconnected,
      heartbeatFailures: this.heartbeatFailures,
      totalErrors: this.connectionErrors.length,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED
    };
  }
}

// Create singleton instance
const wsService = new WebSocketService();

export default wsService;



