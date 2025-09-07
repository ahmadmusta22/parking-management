import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI, masterAPI } from '../../services/api';
import useParkingStore from '../../store/parkingStore';
import useAuthStore from '../../store/authStore';

const AdminControlPanel = () => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newRushHour, setNewRushHour] = useState({ weekDay: 1, from: '07:00', to: '09:00' });
  const [newVacation, setNewVacation] = useState({ name: '', from: '', to: '' });
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRushModal, setShowRushModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);

  const queryClient = useQueryClient();
  const { addAdminAuditEntry } = useParkingStore();
  const { user } = useAuthStore();

  // Fetch data
  const { data: zones } = useQuery({
    queryKey: ['zones'],
    queryFn: () => masterAPI.getZones(),
    select: (response) => response.data
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => masterAPI.getCategories(),
    select: (response) => response.data
  });

  // Note: Backend doesn't provide GET endpoints for rush hours and vacations
  // They can only be created via POST endpoints
  const rushHours = [];
  const vacations = [];

  // Mutations
  const updateZoneMutation = useMutation({
    mutationFn: ({ zoneId, open }) => adminAPI.updateZoneOpen(zoneId, { open }),
    onSuccess: (response, { zoneId, open }) => {
      // Log audit entry
      addAdminAuditEntry({
        adminId: user?.id || 'admin',
        action: 'UPDATE_ZONE',
        targetType: 'zone',
        targetId: zoneId,
        details: {
          updatedFields: ['open'],
          newValues: { open }
        }
      });
      
      queryClient.invalidateQueries(['zones']);
      setShowZoneModal(false);
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, data }) => adminAPI.updateCategory(categoryId, data),
    onSuccess: (response, { categoryId, data }) => {
      // Log audit entry
      addAdminAuditEntry({
        adminId: user?.id || 'admin',
        action: 'UPDATE_CATEGORY',
        targetType: 'category',
        targetId: categoryId,
        details: {
          updatedFields: Object.keys(data),
          newValues: data
        }
      });
      
      queryClient.invalidateQueries(['categories']);
      setShowCategoryModal(false);
    }
  });

  const createRushHourMutation = {
    mutate: (data) => {
      console.warn('Rush hour creation not supported by backend');
      alert('Rush hour creation is not supported by the current backend. This feature is for demonstration purposes only.');
    },
    isPending: false
  };

  const createVacationMutation = {
    mutate: (data) => {
      console.warn('Vacation creation not supported by backend');
      alert('Vacation creation is not supported by the current backend. This feature is for demonstration purposes only.');
    },
    isPending: false
  };

  const handleZoneToggle = (zone) => {
    setSelectedZone(zone);
    setShowZoneModal(true);
  };

  const handleCategoryEdit = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleUpdateZone = () => {
    if (selectedZone) {
      updateZoneMutation.mutate({
        zoneId: selectedZone.id,
        open: !selectedZone.open
      });
    }
  };

  const handleUpdateCategory = (formData) => {
    if (selectedCategory) {
      updateCategoryMutation.mutate({
        categoryId: selectedCategory.id,
        data: formData
      });
    }
  };

  const handleCreateRushHour = () => {
    createRushHourMutation.mutate(newRushHour);
  };

  const handleCreateVacation = () => {
    createVacationMutation.mutate(newVacation);
  };

  const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  return (
    <div className="admin-control-panel">
      <h4 className="mb-4">
        <i className="fas fa-cogs me-2"></i>
        Control Panel
      </h4>

      <div className="row g-4">
        {/* Zone Control */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Zone Control</h6>
              <span className="text-muted">{zones?.length || 0} zones</span>
            </div>
            <div className="card-body">
              <div className="zone-list">
                {zones?.map((zone) => (
                  <div key={zone.id} className="zone-item d-flex justify-content-between align-items-center p-2 border rounded mb-2">
                    <div>
                      <div className="fw-bold">{zone.name}</div>
                      <small className="text-muted">
                        {zone.occupied}/{zone.totalSlots} occupied
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`fw-bold ${zone.open ? 'text-success' : 'text-danger'}`}>
                        {zone.open ? 'Open' : 'Closed'}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleZoneToggle(zone)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Control */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Category Rates</h6>
              <span className="text-muted">{categories?.length || 0} categories</span>
            </div>
            <div className="card-body">
              <div className="category-list">
                {categories?.map((category) => (
                  <div key={category.id} className="category-item d-flex justify-content-between align-items-center p-2 border rounded mb-2">
                    <div>
                      <div className="fw-bold">{category.name}</div>
                      <small className="text-muted">
                        Normal: ${category.rateNormal}/hr | Special: ${category.rateSpecial}/hr
                      </small>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() => handleCategoryEdit(category)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rush Hours */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Rush Hours</h6>
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => setShowRushModal(true)}
                title="Rush hour creation is not supported by the current backend"
              >
                <i className="fas fa-plus"></i> Add
              </button>
            </div>
            <div className="card-body">
              {rushHours.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-clock fa-2x mb-2"></i>
                  <p>No rush hours configured</p>
                  <small>Click "Add" to create rush hour periods</small>
                </div>
              ) : (
                <div className="rush-hours-list">
                  {rushHours.map((rushHour, index) => (
                    <div key={index} className="rush-hour-item p-2 border rounded mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold">{getDayName(rushHour.weekDay)}</div>
                          <small className="text-muted">
                            {rushHour.from} - {rushHour.to}
                          </small>
                        </div>
                        <span className="fw-bold text-warning">Special Rate</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vacations */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Vacations</h6>
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => setShowVacationModal(true)}
                title="Vacation creation is not supported by the current backend"
              >
                <i className="fas fa-plus"></i> Add
              </button>
            </div>
            <div className="card-body">
              {vacations.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-calendar-times fa-2x mb-2"></i>
                  <p>No vacations configured</p>
                  <small>Click "Add" to create vacation periods</small>
                </div>
              ) : (
                <div className="vacations-list">
                  {vacations.map((vacation, index) => (
                    <div key={index} className="vacation-item p-2 border rounded mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold">{vacation.name}</div>
                          <small className="text-muted">
                            {vacation.from} - {vacation.to}
                          </small>
                        </div>
                        <span className="fw-bold text-success">Holiday</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zone Modal */}
      {showZoneModal && selectedZone && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Zone Control</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowZoneModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="zone-info mb-3">
                  <h6>{selectedZone.name}</h6>
                  <p className="text-muted mb-0">
                    Current status: <span className={`fw-bold ${selectedZone.open ? 'text-success' : 'text-danger'}`}>
                      {selectedZone.open ? 'Open' : 'Closed'}
                    </span>
                  </p>
                </div>
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  This will {selectedZone.open ? 'close' : 'open'} the zone for new check-ins.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowZoneModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn ${selectedZone.open ? 'btn-danger' : 'btn-success'}`}
                  onClick={handleUpdateZone}
                  disabled={updateZoneMutation.isPending}
                >
                  {updateZoneMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className={`fas ${selectedZone.open ? 'fa-lock' : 'fa-unlock'} me-2`}></i>
                      {selectedZone.open ? 'Close Zone' : 'Open Zone'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && selectedCategory && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Category Rates</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCategoryModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleUpdateCategory({
                    rateNormal: parseFloat(formData.get('rateNormal')),
                    rateSpecial: parseFloat(formData.get('rateSpecial'))
                  });
                }}>
                  <div className="mb-3">
                    <label className="form-label">Category: {selectedCategory.name}</label>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="rateNormal" className="form-label">Normal Rate ($/hour)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="rateNormal"
                      name="rateNormal"
                      defaultValue={selectedCategory.rateNormal}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="rateSpecial" className="form-label">Special Rate ($/hour)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="rateSpecial"
                      name="rateSpecial"
                      defaultValue={selectedCategory.rateSpecial}
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCategoryModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updateCategoryMutation.isPending}
                    >
                      {updateCategoryMutation.isPending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Update Rates
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rush Hour Modal */}
      {showRushModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Rush Hour</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRushModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateRushHour();
                }}>
                  <div className="mb-3">
                    <label htmlFor="weekDay" className="form-label">Day of Week</label>
                    <select
                      className="form-select"
                      id="weekDay"
                      value={newRushHour.weekDay}
                      onChange={(e) => setNewRushHour({...newRushHour, weekDay: parseInt(e.target.value)})}
                      required
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="from" className="form-label">From Time</label>
                    <input
                      type="time"
                      className="form-control"
                      id="from"
                      value={newRushHour.from}
                      onChange={(e) => setNewRushHour({...newRushHour, from: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="to" className="form-label">To Time</label>
                    <input
                      type="time"
                      className="form-control"
                      id="to"
                      value={newRushHour.to}
                      onChange={(e) => setNewRushHour({...newRushHour, to: e.target.value})}
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowRushModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={createRushHourMutation.isPending}
                    >
                      {createRushHourMutation.isPending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-2"></i>
                          Add Rush Hour
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vacation Modal */}
      {showVacationModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Vacation Period</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowVacationModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateVacation();
                }}>
                  <div className="mb-3">
                    <label htmlFor="vacationName" className="form-label">Vacation Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="vacationName"
                      value={newVacation.name}
                      onChange={(e) => setNewVacation({...newVacation, name: e.target.value})}
                      placeholder="e.g., Christmas Holiday"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="vacationFrom" className="form-label">From Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="vacationFrom"
                      value={newVacation.from}
                      onChange={(e) => setNewVacation({...newVacation, from: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="vacationTo" className="form-label">To Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="vacationTo"
                      value={newVacation.to}
                      onChange={(e) => setNewVacation({...newVacation, to: e.target.value})}
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowVacationModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={createVacationMutation.isPending}
                    >
                      {createVacationMutation.isPending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-2"></i>
                          Add Vacation
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminControlPanel;