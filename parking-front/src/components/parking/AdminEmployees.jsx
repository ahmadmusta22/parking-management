import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import useToast from '../../hooks/useToast';

const AdminEmployees = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'employee',
    name: '',
    shift: ''
  });
  const queryClient = useQueryClient();
  const toast = useToast();

  // Static user data (from seed data)
  const users = [
    { id: 'admin', username: 'admin', role: 'admin', name: 'System Administrator' },
    { id: 'emp1', username: 'emp1', role: 'employee', name: 'Day Shift Employee', shift: 'Day Shift' },
    { id: 'emp2', username: 'emp2', role: 'employee', name: 'Evening Shift Employee', shift: 'Evening Shift' },
    { id: 'emp3', username: 'emp3', role: 'employee', name: 'Night Shift Employee', shift: 'Night Shift' },
    { id: 'checkpoint1', username: 'checkpoint1', role: 'employee', name: 'Checkpoint Alpha', shift: 'Checkpoint Alpha' },
    { id: 'checkpoint2', username: 'checkpoint2', role: 'employee', name: 'Checkpoint Beta', shift: 'Checkpoint Beta' }
  ];

  const isLoading = false;
  const error = null;

  // Create user mutation (disabled - backend doesn't support this)
  const createUserMutation = {
    mutate: (userData) => {
      toast.showError('User creation is not supported by the current backend. Users are managed through seed data.');
    },
    isPending: false
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Failed to load users: {error.message}
      </div>
    );
  }

  // Separate users by role
  const adminUsers = users?.filter(user => user.role === 'admin') || [];
  const employeeUsers = users?.filter(user => user.role === 'employee') || [];

  return (
    <div className="admin-employees">
      {/* Section Header */}
      <div className="admin-section-header">
        <h1 className="admin-section-title">
          <i className="fas fa-users"></i>
          Employee Management
        </h1>
        <button 
          className="btn btn-outline-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
          title="User creation is not supported by the current backend"
        >
          <i className="fas fa-plus me-2"></i>
          Add New Employee
        </button>
      </div>

      {/* Create Employee Form */}
      {showCreateForm && (
        <div className="admin-data-card mb-4">
          <div className="admin-data-card-header">
            <i className="fas fa-user-plus admin-data-card-icon"></i>
            <h5 className="admin-data-card-title">Create New Employee</h5>
          </div>
          <div className="admin-data-card-content">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-control"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Shift/Position</label>
                    <input
                      type="text"
                      className="form-control"
                      name="shift"
                      value={formData.shift}
                      onChange={handleInputChange}
                      placeholder="e.g., Day Shift, Checkpoint Alpha"
                    />
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Create Employee
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Data Card */}
      <div className="admin-data-card">
        <div className="admin-data-card-header">
          <i className="fas fa-database admin-data-card-icon"></i>
          <h5 className="admin-data-card-title">System Users ({users?.length || 0})</h5>
        </div>
        <div className="admin-data-card-content">
          <div className="row">
            <div className="col-md-6">
              <div className="user-category">
                <h6 className="category-title">Admin Users ({adminUsers.length})</h6>
                <div className="user-list">
                  {adminUsers.length === 0 ? (
                    <div className="text-muted text-center py-3">No admin users found</div>
                  ) : (
                    adminUsers.map((user) => (
                      <div key={user.id} className="user-item">
                        <div className="user-credentials">
                          <div className="username">{user.username}</div>
                          <div className="role">Role: {user.role}</div>
                          {user.name && <div className="role">Name: {user.name}</div>}
                        </div>
                        <div className="user-status">
                          <span className="status-badge">Active</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="user-category">
                <h6 className="category-title">Employee Users ({employeeUsers.length})</h6>
                <div className="user-list">
                  {employeeUsers.length === 0 ? (
                    <div className="text-muted text-center py-3">No employee users found</div>
                  ) : (
                    employeeUsers.map((user) => (
                      <div key={user.id} className="user-item">
                        <div className="user-credentials">
                          <div className="username">{user.username}</div>
                          <div className="role">Role: {user.role}</div>
                          {user.name && <div className="role">Name: {user.name}</div>}
                          {user.shift && <div className="role">Position: {user.shift}</div>}
                        </div>
                        <div className="user-status">
                          <span className="status-badge">Active</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployees;