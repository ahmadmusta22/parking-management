import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderOne from '../components/HeaderOne';
import FooterAreaOne from '../components/FooterAreaOne';
import AdminReports from '../components/parking/AdminReports';
import AdminControlPanel from '../components/parking/AdminControlPanel';
import AdminEmployees from '../components/parking/AdminEmployees';
import AdminSubscriptions from '../components/parking/AdminSubscriptions';
import AdminAuditLog from '../components/parking/AdminAuditLog';
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
              <AdminAuditLog />
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
