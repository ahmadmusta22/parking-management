import React, { useState, useEffect } from 'react';
import wsService from '../services/websocket';

const WebSocketStatus = () => {
  const [status, setStatus] = useState(wsService.getConnectionStats());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(wsService.getConnectionStats());
    };

    // Listen to WebSocket events
    wsService.on('connected', updateStatus);
    wsService.on('disconnected', updateStatus);
    wsService.on('error', updateStatus);
    wsService.on('max-reconnect-attempts', updateStatus);

    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    return () => {
      wsService.off('connected', updateStatus);
      wsService.off('disconnected', updateStatus);
      wsService.off('error', updateStatus);
      wsService.off('max-reconnect-attempts', updateStatus);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = () => {
    if (status.connected) return 'success';
    if (status.reconnectAttempts >= status.maxReconnectAttempts) return 'danger';
    if (status.reconnectAttempts > 0) return 'warning';
    return 'secondary';
  };

  const getStatusText = () => {
    if (status.connected) return 'Connected';
    if (status.reconnectAttempts >= status.maxReconnectAttempts) return 'Connection Failed';
    if (status.reconnectAttempts > 0) return `Reconnecting (${status.reconnectAttempts}/${status.maxReconnectAttempts})`;
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (status.connected) return 'fas fa-wifi';
    if (status.reconnectAttempts >= status.maxReconnectAttempts) return 'fas fa-exclamation-triangle';
    if (status.reconnectAttempts > 0) return 'fas fa-sync-alt fa-spin';
    return 'fas fa-wifi-slash';
  };

  const handleForceReconnect = () => {
    wsService.forceReconnect();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getReadyStateText = (readyState) => {
    switch (readyState) {
      case WebSocket.CONNECTING: return 'Connecting';
      case WebSocket.OPEN: return 'Open';
      case WebSocket.CLOSING: return 'Closing';
      case WebSocket.CLOSED: return 'Closed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="websocket-status">
      {/* Status Indicator */}
      <div 
        className={`alert alert-${getStatusColor()} alert-dismissible fade show mb-0`}
        style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          zIndex: 1050,
          minWidth: '250px',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="d-flex align-items-center">
          <i className={`${getStatusIcon()} me-2`}></i>
          <span className="fw-bold">{getStatusText()}</span>
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} ms-auto`}></i>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-top">
            <div className="row g-2">
              <div className="col-6">
                <small className="text-muted">Status:</small>
                <div className="fw-bold">{getReadyStateText(status.readyState)}</div>
              </div>
              <div className="col-6">
                <small className="text-muted">Subscriptions:</small>
                <div className="fw-bold">{status.subscriptions.length}</div>
              </div>
              <div className="col-6">
                <small className="text-muted">Pending Messages:</small>
                <div className="fw-bold">{status.pendingMessages}</div>
              </div>
              <div className="col-6">
                <small className="text-muted">Heartbeat Failures:</small>
                <div className="fw-bold">{status.heartbeatFailures}</div>
              </div>
              <div className="col-12">
                <small className="text-muted">Last Connected:</small>
                <div className="fw-bold">{formatTimestamp(status.lastConnected)}</div>
              </div>
              <div className="col-12">
                <small className="text-muted">Last Disconnected:</small>
                <div className="fw-bold">{formatTimestamp(status.lastDisconnected)}</div>
              </div>
              <div className="col-12">
                <small className="text-muted">Total Errors:</small>
                <div className="fw-bold">{status.totalErrors}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleForceReconnect();
                }}
                disabled={status.connected}
              >
                <i className="fas fa-redo me-1"></i>
                Reconnect
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
              >
                <i className="fas fa-times me-1"></i>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSocketStatus;
