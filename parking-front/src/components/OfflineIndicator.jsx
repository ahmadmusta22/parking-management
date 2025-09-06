import React, { useState, useEffect } from 'react';
import useParkingStore from '../store/parkingStore';
import wsService from '../services/websocket';

const OfflineIndicator = () => {
  const { offlineMode, wsConnected, isDataStale } = useParkingStore();
  const [showIndicator, setShowIndicator] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  useEffect(() => {
    const updateStatus = () => {
      const status = wsService.getConnectionStatus();
      setConnectionStatus(status.connected ? 'connected' : 'disconnected');
      
      // Show indicator if offline or data is stale
      const shouldShow = offlineMode || !wsConnected || isDataStale();
      setShowIndicator(shouldShow);
    };

    // Initial status check
    updateStatus();

    // Listen for WebSocket events
    const handleConnected = () => updateStatus();
    const handleDisconnected = () => updateStatus();
    const handleOffline = () => updateStatus();

    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    wsService.on('offline', handleOffline);

    // Check status periodically
    const interval = setInterval(updateStatus, 5000);

    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      wsService.off('offline', handleOffline);
      clearInterval(interval);
    };
  }, [offlineMode, wsConnected, isDataStale]);

  // Only show indicator for actual offline mode, not just disconnected
  if (!offlineMode) return null;

  const getIndicatorClass = () => {
    if (offlineMode) return 'offline-indicator offline';
    if (!wsConnected) return 'offline-indicator disconnected';
    if (isDataStale()) return 'offline-indicator stale';
    return 'offline-indicator connected';
  };

  const getIndicatorText = () => {
    if (offlineMode) return 'Offline Mode - Using cached data';
    if (!wsConnected) return 'Disconnected - Attempting to reconnect...';
    if (isDataStale()) return 'Data may be outdated - Refreshing...';
    return 'Connected';
  };

  const getIndicatorIcon = () => {
    if (offlineMode) return 'fas fa-wifi-slash';
    if (!wsConnected) return 'fas fa-wifi-slash';
    if (isDataStale()) return 'fas fa-clock';
    return 'fas fa-wifi';
  };

  return (
    <div className={getIndicatorClass()}>
      <div className="offline-indicator-content">
        <i className={getIndicatorIcon()}></i>
        <span className="offline-indicator-text">{getIndicatorText()}</span>
        {!offlineMode && !wsConnected && (
          <button 
            className="offline-indicator-retry"
            onClick={() => wsService.connect()}
          >
            <i className="fas fa-redo"></i>
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
