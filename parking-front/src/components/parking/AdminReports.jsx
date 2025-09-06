import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';

const AdminReports = () => {
  const { data: parkingState, isLoading, error } = useQuery({
    queryKey: ['admin', 'parking-state'],
    queryFn: () => adminAPI.getParkingStateReport(),
    select: (response) => {
      // Backend returns data directly as array, not wrapped in data property
      return { zones: response.data };
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    refetchOnWindowFocus: true,
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Parking State Error:', error);
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Failed to load parking state report: {error.message}
        <br />
        <small>Check console for details and ensure backend is running on port 3000</small>
      </div>
    );
  }

  const getStatusColor = (zone) => {
    if (!zone.open) return 'text-danger';
    if (zone.free > 0) return 'text-success';
    return 'text-warning';
  };

  const getStatusText = (zone) => {
    if (!zone.open) return 'Closed';
    if (zone.free > 0) return 'Open';
    return 'Full';
  };

  return (
    <div className="admin-reports">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="fas fa-chart-bar me-2"></i>
          Parking State Report
        </h4>
        <small className="text-muted">
          Last updated: {new Date().toLocaleTimeString()}
        </small>
      </div>

      {/* Compact Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <div className="text-primary">
                <i className="fas fa-parking fa-2x mb-2"></i>
              </div>
              <h5 className="card-title">
                {parkingState?.zones?.reduce((sum, zone) => sum + zone.totalSlots, 0) || 0}
              </h5>
              <p className="card-text">Total Slots</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <div className="text-success">
                <i className="fas fa-check-circle fa-2x mb-2"></i>
              </div>
              <h5 className="card-title">
                {parkingState?.zones?.reduce((sum, zone) => sum + zone.free, 0) || 0}
              </h5>
              <p className="card-text">Available</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <div className="text-warning">
                <i className="fas fa-car fa-2x mb-2"></i>
              </div>
              <h5 className="card-title">
                {parkingState?.zones?.reduce((sum, zone) => sum + zone.occupied, 0) || 0}
              </h5>
              <p className="card-text">Occupied</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <div className="text-info">
                <i className="fas fa-users fa-2x mb-2"></i>
              </div>
              <h5 className="card-title">
                {parkingState?.zones?.reduce((sum, zone) => sum + (zone.subscriberCount || 0), 0) || 0}
              </h5>
              <p className="card-text">Subscribers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Zone Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-table me-2"></i>
            Zone Status Overview
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Zone</th>
                  <th>Status</th>
                  <th>Occupancy</th>
                  <th>Available</th>
                  <th>Reserved</th>
                  <th>Subscribers</th>
                </tr>
              </thead>
              <tbody>
                {parkingState?.zones?.map((zone) => (
                  <tr key={zone.zoneId}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className={`status-indicator me-2 ${getStatusColor(zone)}`}></div>
                        <div>
                          <div className="fw-bold">{zone.name}</div>
                          <small className="text-muted">{zone.zoneId}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`fw-bold ${getStatusColor(zone)}`}>
                        {getStatusText(zone)}
                      </span>
                    </td>
                    <td>
                      <div className="occupancy-info">
                        <div className="fw-bold text-primary">{zone.occupied}</div>
                        <small className="text-muted">of {zone.totalSlots}</small>
                      </div>
                    </td>
                    <td>
                      <span className="text-success fw-bold">{zone.free}</span>
                    </td>
                    <td>
                      <span className="text-warning fw-bold">{zone.reserved}</span>
                    </td>
                    <td>
                      <span className="text-info fw-bold">{zone.subscriberCount || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;