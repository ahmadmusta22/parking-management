import React, { useState, useEffect, useMemo } from 'react';
import useParkingStore from '../../store/parkingStore';

const AdminAuditLog = () => {
  const { adminAuditLog, clearAdminAuditLog } = useParkingStore();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filter and sort audit entries
  const filteredEntries = useMemo(() => {
    let filtered = adminAuditLog;

    // Filter by action type
    if (filter !== 'all') {
      filtered = filtered.filter(entry => 
        entry.action.includes(filter) || entry.targetType === filter
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.adminId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.details && JSON.stringify(entry.details).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort entries
    filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.id);
      const timeB = new Date(b.timestamp || b.id);
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  }, [adminAuditLog, filter, searchTerm, sortOrder]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Force re-render to show latest entries
      // This is handled by the store updates
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActionIcon = (action) => {
    if (action.includes('zone')) return 'fas fa-map-marker-alt';
    if (action.includes('category')) return 'fas fa-tags';
    if (action.includes('rush')) return 'fas fa-clock';
    if (action.includes('vacation')) return 'fas fa-calendar';
    if (action.includes('user')) return 'fas fa-user';
    return 'fas fa-cog';
  };

  const getActionColor = (action) => {
    if (action.includes('zone')) return 'primary';
    if (action.includes('category')) return 'info';
    if (action.includes('rush')) return 'warning';
    if (action.includes('vacation')) return 'success';
    if (action.includes('user')) return 'secondary';
    return 'dark';
  };

  const clearLog = () => {
    if (window.confirm('Are you sure you want to clear the audit log? This action cannot be undone.')) {
      clearAdminAuditLog();
    }
  };

  const exportLog = () => {
    const csvContent = [
      ['Timestamp', 'Admin ID', 'Action', 'Target Type', 'Target ID', 'Details'],
      ...filteredEntries.map(entry => [
        entry.timestamp || entry.id,
        entry.adminId,
        entry.action,
        entry.targetType,
        entry.targetId,
        entry.details ? JSON.stringify(entry.details) : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-audit-log">
      {/* Header with controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>
            <i className="fas fa-history me-2"></i>
            Admin Audit Log
          </h4>
          <small className="text-muted">
            Real-time updates from admin actions ({filteredEntries.length} entries)
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${autoRefresh ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            <i className={`fas fa-sync-alt ${autoRefresh ? 'fa-spin' : ''}`}></i>
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={exportLog}
            disabled={filteredEntries.length === 0}
          >
            <i className="fas fa-download me-1"></i>
            Export
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={clearLog}
            disabled={adminAuditLog.length === 0}
          >
            <i className="fas fa-trash me-1"></i>
            Clear
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search actions, IDs, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="zone">Zone Actions</option>
            <option value="category">Category Actions</option>
            <option value="rush">Rush Hours</option>
            <option value="vacation">Vacations</option>
            <option value="user">User Actions</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
        <div className="col-md-2">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="liveUpdates"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="liveUpdates">
              Live Updates
            </label>
          </div>
        </div>
      </div>

      {/* Audit entries */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">
            {adminAuditLog.length === 0 ? 'No admin actions yet' : 'No matching entries'}
          </h5>
          <p className="text-muted">
            {adminAuditLog.length === 0 
              ? 'Admin actions will appear here in real-time'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      ) : (
        <div className="audit-entries">
          {filteredEntries.map((entry, index) => (
            <div 
              key={entry.id || index} 
              className={`audit-entry card mb-3 ${index === 0 ? 'border-primary' : ''}`}
            >
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center mb-2">
                      <i className={`${getActionIcon(entry.action)} me-2 text-${getActionColor(entry.action)}`}></i>
                      <span className={`badge me-2 bg-${getActionColor(entry.action)}`}>
                        {entry.action.replace(/-/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-muted small">
                        {entry.targetType}: <strong>{entry.targetId}</strong>
                      </span>
                    </div>
                    
                    {entry.details && Object.keys(entry.details).length > 0 && (
                      <div className="audit-details mb-2">
                        {Object.entries(entry.details).map(([key, value]) => (
                          <span key={key} className="badge bg-light text-dark me-1 mb-1">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-4 text-end">
                    <div className="audit-meta">
                      <div className="text-muted small">
                        <i className="fas fa-user me-1"></i>
                        {entry.adminId}
                      </div>
                      <div className="text-muted small">
                        <i className="fas fa-clock me-1"></i>
                        {formatTimestamp(entry.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination info */}
      {filteredEntries.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <small className="text-muted">
            Showing {filteredEntries.length} of {adminAuditLog.length} entries
          </small>
          <small className="text-muted">
            Last updated: {new Date().toLocaleTimeString()}
          </small>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLog;
