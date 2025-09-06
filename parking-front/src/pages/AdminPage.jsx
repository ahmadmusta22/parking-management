import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderOne from '../components/HeaderOne';
import FooterAreaOne from '../components/FooterAreaOne';
import AdminReports from '../components/parking/AdminReports';
import AdminControlPanel from '../components/parking/AdminControlPanel';
import AdminEmployees from '../components/parking/AdminEmployees';
import AdminSubscriptions from '../components/parking/AdminSubscriptions';
import Preloader from '../helper/Preloader';
import useAuthStore from '../store/authStore';
import useParkingStore from '../store/parkingStore';
import wsService from '../services/websocket';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { adminAuditLog, addAdminAuditEntry } = useParkingStore();
  const [activeTab, setActiveTab] = useState('employees');
  const [preloaderActive, setPreloaderActive] = useState(true);

  // Preloader effect
  useEffect(() => {
    setTimeout(() => {
      setPreloaderActive(false);
    }, 2000);
  }, []);

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // WebSocket connection for admin updates
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      wsService.connect();
      
      const handleAdminUpdate = (adminData) => {
        addAdminAuditEntry({
          adminId: adminData.adminId,
          action: adminData.action,
          targetType: adminData.targetType,
          targetId: adminData.targetId,
          details: adminData.details
        });
      };

      wsService.on('admin-update', handleAdminUpdate);

      return () => {
        wsService.off('admin-update', handleAdminUpdate);
      };
    }
  }, [isAuthenticated, user, addAdminAuditEntry]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Show preloader
  if (preloaderActive) {
    return <Preloader />;
  }

  return (
    <>
      {/* Main Website Header */}
      <HeaderOne />
      
      <div className="admin-page">
      <div className="container" style={{ paddingTop: '120px' }}>
        {/* Custom Navigation Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="admin-nav-tabs">
              <button
                className={`admin-nav-tab ${activeTab === 'employees' ? 'active' : ''}`}
                onClick={() => setActiveTab('employees')}
              >
                <i className="fas fa-users"></i>
                <span>Employees</span>
              </button>
              <button
                className={`admin-nav-tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
                onClick={() => setActiveTab('subscriptions')}
              >
                <i className="fas fa-id-card"></i>
                <span>Subscriptions</span>
              </button>
              <button
                className={`admin-nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                <i className="fas fa-chart-bar"></i>
                <span>Parking Reports</span>
              </button>
              <button
                className={`admin-nav-tab ${activeTab === 'control' ? 'active' : ''}`}
                onClick={() => setActiveTab('control')}
              >
                <i className="fas fa-cogs"></i>
                <span>Control Panel</span>
              </button>
              <button
                className={`admin-nav-tab ${activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveTab('audit')}
              >
                <i className="fas fa-history"></i>
                <span>Audit Log</span>
                {adminAuditLog.length > 0 && (
                  <span className="admin-nav-badge">{adminAuditLog.length}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'employees' && (
            <div className="tab-pane active">
              <AdminEmployees />
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="tab-pane active">
              <AdminSubscriptions />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="tab-pane active">
              <AdminReports />
            </div>
          )}

          {activeTab === 'control' && (
            <div className="tab-pane active">
              <AdminControlPanel />
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="tab-pane active">
              <div className="audit-log">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>
                    <i className="fas fa-history me-2"></i>
                    Admin Audit Log
                  </h4>
                  <small className="text-muted">
                    Real-time updates from admin actions
                  </small>
                </div>

                {adminAuditLog.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No admin actions yet</h5>
                    <p className="text-muted">Admin actions will appear here in real-time</p>
                  </div>
                ) : (
                  <div className="audit-entries">
                    {adminAuditLog.map((entry) => (
                      <div key={entry.id} className="audit-entry card mb-3">
                        <div className="card-body">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="d-flex align-items-center mb-2">
                                <span className={`badge me-2 ${
                                  entry.action.includes('zone') ? 'bg-primary' :
                                  entry.action.includes('category') ? 'bg-info' :
                                  entry.action.includes('rush') ? 'bg-warning' :
                                  entry.action.includes('vacation') ? 'bg-success' :
                                  'bg-secondary'
                                }`}>
                                  {entry.action.replace(/-/g, ' ').toUpperCase()}
                                </span>
                                <span className="text-muted small">
                                  {entry.targetType}: {entry.targetId}
                                </span>
                              </div>
                              <div className="audit-details">
                                {entry.details && Object.keys(entry.details).length > 0 && (
                                  <div className="details">
                                    {Object.entries(entry.details).map(([key, value]) => (
                                      <span key={key} className="badge bg-light text-dark me-1">
                                        {key}: {value}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-4 text-md-end">
                              <div className="audit-meta">
                                <div className="text-muted small">
                                  Admin: {entry.adminId}
                                </div>
                                <div className="text-muted small">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      
      {/* Main Website Footer */}
      <FooterAreaOne />
    </>
  );
};

export default AdminPage;
