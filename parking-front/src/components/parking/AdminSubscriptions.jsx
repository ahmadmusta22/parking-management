import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { masterAPI } from '../../services/api';
import useToast from '../../hooks/useToast';

const AdminSubscriptions = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    category: '',
    cars: [{ plate: '', brand: '', model: '', color: '' }],
    startsAt: '',
    expiresAt: ''
  });
  const toast = useToast();

  // Fetch categories for reference
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => masterAPI.getCategories(),
    select: (response) => response.data
  });

  // Fetch subscriptions (with error handling for missing endpoint)
  const { data: subscriptions, isLoading, error: fetchError } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => adminAPI.getSubscriptions(),
    select: (response) => response.data,
    retry: false,
    onError: (error) => {
      console.warn('Subscriptions endpoint not available:', error.message);
    }
  });

  // Create subscription mutation (disabled - backend may not support this)
  const createSubscriptionMutation = {
    mutate: (subscriptionData) => {
      toast.showError('Subscription creation is not supported by the current backend. Subscriptions are managed through seed data.');
    },
    isPending: false
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createSubscriptionMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCarChange = (index, field, value) => {
    const newCars = [...formData.cars];
    newCars[index][field] = value;
    setFormData(prev => ({ ...prev, cars: newCars }));
  };

  const addCar = () => {
    setFormData(prev => ({
      ...prev,
      cars: [...prev.cars, { plate: '', brand: '', model: '', color: '' }]
    }));
  };

  const removeCar = (index) => {
    if (formData.cars.length > 1) {
      const newCars = formData.cars.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, cars: newCars }));
    }
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

  if (fetchError) {
    return (
      <div className="admin-subscriptions">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>
            <i className="fas fa-id-card me-2"></i>
            Subscription Management
          </h4>
        </div>
        
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Note:</strong> Subscription management endpoints are not available in the current backend. 
          Subscriptions are managed through seed data. This view shows the available subscription functionality.
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-list me-2"></i>
              Subscription Management Features
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Available Features:</h6>
                <ul>
                  <li>View subscription details at gates</li>
                  <li>Verify subscription status</li>
                  <li>Check subscription validity</li>
                  <li>Display subscription cars</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6>Backend Limitations:</h6>
                <ul>
                  <li>No admin subscription creation</li>
                  <li>No subscription modification</li>
                  <li>Subscriptions managed via seed data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-subscriptions">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="fas fa-id-card me-2"></i>
          Subscription Management
        </h4>
        <button 
          className="btn btn-outline-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
          title="Subscription creation is not supported by the current backend"
        >
          <i className="fas fa-plus me-2"></i>
          Add New Subscription
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Create Subscription Form */}
      {showCreateForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-plus me-2"></i>
              Create New Subscription
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} - ${category.rateNormal}/hr
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="startsAt"
                      value={formData.startsAt}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Cars Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Vehicles</h6>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-primary"
                    onClick={addCar}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Add Car
                  </button>
                </div>
                
                {formData.cars.map((car, index) => (
                  <div key={index} className="row mb-3 p-3 border rounded">
                    <div className="col-md-3">
                      <label className="form-label">Plate Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={car.plate}
                        onChange={(e) => handleCarChange(index, 'plate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Brand</label>
                      <input
                        type="text"
                        className="form-control"
                        value={car.brand}
                        onChange={(e) => handleCarChange(index, 'brand', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Model</label>
                      <input
                        type="text"
                        className="form-control"
                        value={car.model}
                        onChange={(e) => handleCarChange(index, 'model', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Color</label>
                      <input
                        type="text"
                        className="form-control"
                        value={car.color}
                        onChange={(e) => handleCarChange(index, 'color', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      {formData.cars.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeCar(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={createSubscriptionMutation.isPending}
                >
                  {createSubscriptionMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Create Subscription
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

      {/* Subscriptions List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>
            Current Subscriptions ({subscriptions?.length || 0})
          </h5>
        </div>
        <div className="card-body">
          {subscriptions?.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-id-card fa-3x text-muted mb-3"></i>
              <p className="text-muted">No subscriptions found. Create your first subscription above.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Category</th>
                    <th>Cars</th>
                    <th>Status</th>
                    <th>Validity Period</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions?.map((subscription) => {
                    const category = categories?.find(c => c.id === subscription.category);
                    return (
                      <tr key={subscription.id}>
                        <td>
                          <code>{subscription.id}</code>
                        </td>
                        <td>
                          <strong>{subscription.userName || 'Unknown User'}</strong>
                          <br />
                          <small className="text-muted">ID: {subscription.id}</small>
                        </td>
                        <td>
                          <div className="fw-bold text-primary">
                            {category?.name || subscription.category || 'Unknown'}
                          </div>
                          <small className="text-muted">
                            {category ? `$${category.rateNormal}/hour` : 'No rate info'}
                          </small>
                        </td>
                        <td>
                          {subscription.cars?.length || 0} car(s)
                          {subscription.cars?.map((car, idx) => (
                            <div key={idx} className="small text-muted">
                              {car.plate} - {car.brand} {car.model}
                            </div>
                          ))}
                        </td>
                        <td>
                          <span className={`fw-bold ${subscription.active ? 'text-success' : 'text-danger'}`}>
                            {subscription.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="small">
                            <div>Starts: {new Date(subscription.startsAt).toLocaleDateString()}</div>
                            <div>Expires: {new Date(subscription.expiresAt).toLocaleDateString()}</div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
