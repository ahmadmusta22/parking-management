class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.listeners = new Map();
    this.subscriptions = new Set();
    this.isConnected = false;
    this.offlineMode = false;
    this.pendingMessages = [];
    this.connectionCheckInterval = null;
    this.lastConnected = null;
    this.lastDisconnected = null;
  }

  connect() {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3000/api/v1/ws';
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.isConnected = true;
        this.offlineMode = false;
        this.lastConnected = new Date().toISOString();
        
        // Send pending messages
        this.sendPendingMessages();
        
        // Resubscribe to all previous subscriptions
        this.subscriptions.forEach(gateId => {
          this.subscribe(gateId);
        });
        
        this.emit('connected');
        this.startConnectionCheck();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.emit(message.type, message.payload);
        } catch (error) {
          // console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.offlineMode = true;
        this.lastDisconnected = new Date().toISOString();
        this.stopConnectionCheck();
        this.emit('disconnected');
        
        // Attempt to reconnect with exponential backoff
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        // console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      // console.error('Failed to create WebSocket connection:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.listeners.clear();
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

  // Enhanced reconnection with exponential backoff
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('max-reconnect-attempts');
      return;
    }

    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 seconds
    );

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  // Force reconnection
  forceReconnect() {
    this.reconnectAttempts = 0;
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
      lastDisconnected: this.lastDisconnected
    };
  }
}

// Create singleton instance
const wsService = new WebSocketService();

export default wsService;



