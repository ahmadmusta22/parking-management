import React from 'react';

const CheckoutPanel = ({ 
  ticket, 
  checkoutData, 
  subscription, 
  onConvertToVisitor, 
  onCompleteCheckout,
  loading 
}) => {
  if (!ticket && !checkoutData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="checkout-panel">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-6">
            {/* Ticket Information */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-ticket-alt me-2"></i>
                  Ticket Information
                </h5>
              </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label fw-bold">Ticket ID</label>
                  <div className="ticket-value">{ticket?.id || checkoutData?.ticketId}</div>
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold">Type</label>
                  <div className="ticket-value">
                    <span className={`ticket-type ${(ticket?.type || checkoutData?.type) === 'visitor' ? 'visitor' : 'subscriber'}`}>
                      {(ticket?.type || checkoutData?.type) === 'visitor' ? 'Visitor' : 'Subscriber'}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold">Check-in Time</label>
                  <div className="ticket-value">
                    {formatDate(ticket?.checkinAt || checkoutData?.checkinAt)}
                  </div>
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold">Check-out Time</label>
                  <div className="ticket-value">
                    {checkoutData ? formatDate(checkoutData.checkoutAt) : 'Pending'}
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold">Duration</label>
                  <div className="ticket-value">
                    {checkoutData ? formatDuration(checkoutData.durationHours) : 'Calculating...'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Information (if applicable) */}
          {subscription && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-id-card me-2"></i>
                  Subscription Details
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label fw-bold">Subscriber</label>
                    <div className="ticket-value">{subscription.userName}</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-bold">Category</label>
                    <div className="ticket-value">{subscription.category}</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Registered Vehicles</label>
                    <div className="vehicle-list">
                      {subscription.cars.map((car, index) => (
                        <div key={index} className="vehicle-item p-2 border rounded mb-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{car.plate}</strong>
                              <div className="text-muted small">
                                {car.brand} {car.model} ({car.color})
                              </div>
                            </div>
                            <span className="vehicle-status">Registered</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

          <div className="col-lg-6">
            {/* Payment Breakdown */}
            {checkoutData && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="fas fa-calculator me-2"></i>
                    {ticket?.type === 'subscriber' ? 'Parking Summary' : 'Payment Breakdown'}
                  </h5>
                </div>
              <div className="card-body">
                {ticket?.type === 'subscriber' ? (
                  // Subscriber view - no payment required
                  <div className="subscriber-summary">
                    <div className="alert alert-success mb-3">
                      <i className="fas fa-check-circle me-2"></i>
                      <strong>Subscriber Parking</strong>
                      <p className="mb-0 mt-2">No payment required - covered by subscription</p>
                    </div>
                    
                    <div className="breakdown-list">
                      {checkoutData.breakdown.map((segment, index) => (
                        <div key={index} className="breakdown-item d-flex justify-content-between align-items-center p-2 border-bottom">
                          <div>
                            <div className="fw-bold">
                              {formatDate(segment.from)} - {formatDate(segment.to)}
                            </div>
                            <div className="text-muted small">
                              {formatDuration(segment.hours)} @ {formatCurrency(segment.rate)}/hour
                              <span className={`rate-mode ms-2 ${segment.rateMode === 'special' ? 'special' : 'normal'}`}>
                                {segment.rateMode}
                              </span>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold text-muted">$0.00</div>
                            <div className="text-muted small">(Subscriber)</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="total-section mt-3 pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Total Amount</h5>
                        <h4 className="text-success mb-0">$0.00</h4>
                      </div>
                      <div className="text-muted small mt-1">
                        <i className="fas fa-info-circle me-1"></i>
                        Covered by active subscription
                      </div>
                    </div>
                  </div>
                ) : (
                  // Visitor view - show payment breakdown
                  <>
                    <div className="breakdown-list">
                      {checkoutData.breakdown.map((segment, index) => (
                        <div key={index} className="breakdown-item d-flex justify-content-between align-items-center p-2 border-bottom">
                          <div>
                            <div className="fw-bold">
                              {formatDate(segment.from)} - {formatDate(segment.to)}
                            </div>
                            <div className="text-muted small">
                              {formatDuration(segment.hours)} @ {formatCurrency(segment.rate)}/hour
                              <span className={`rate-mode ms-2 ${segment.rateMode === 'special' ? 'special' : 'normal'}`}>
                                {segment.rateMode}
                              </span>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">{formatCurrency(segment.amount)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="total-section mt-3 pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Total Amount</h5>
                        <h4 className="text-primary mb-0">{formatCurrency(checkoutData.amount)}</h4>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Actions</h6>
              
              {subscription && !checkoutData && (
                <div className="alert alert-warning">
                  <h6><i className="fas fa-exclamation-triangle me-2"></i>Vehicle Verification Required</h6>
                  <p className="mb-2">Please verify that the vehicle matches one of the registered vehicles above.</p>
                  <p className="mb-0">If the vehicle doesn't match, you can convert this to a visitor ticket.</p>
                </div>
              )}

              <div className="d-grid gap-2">
                {subscription && !checkoutData && (
                  <button
                    className="btn btn-warning"
                    onClick={onConvertToVisitor}
                    disabled={loading}
                  >
                    <i className="fas fa-exchange-alt me-2"></i>
                    Convert to Visitor
                  </button>
                )}
                
                <button
                  className="btn btn-success btn-lg"
                  onClick={onCompleteCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      {ticket?.type === 'subscriber' ? 'Complete Checkout (Free)' : 'Complete Checkout'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPanel;



