import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HeaderOne from '../components/HeaderOne';
import FooterAreaOne from '../components/FooterAreaOne';
import CheckoutPanel from '../components/parking/CheckoutPanel';
import Preloader from '../helper/Preloader';
import useAuthStore from '../store/authStore';
import useToast from '../hooks/useToast';
import { ticketAPI, subscriptionAPI } from '../services/api';

const CheckpointPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [ticketId, setTicketId] = useState('');
  const [ticket, setTicket] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preloaderActive, setPreloaderActive] = useState(true);

  // Preloader effect
  useEffect(() => {
    setTimeout(() => {
      setPreloaderActive(false);
    }, 2000);
  }, []);

  // Redirect if not authenticated or not an employee
  useEffect(() => {
    // console.log('CheckpointPage: isAuthenticated:', isAuthenticated);
    // console.log('CheckpointPage: user:', user);
    // console.log('CheckpointPage: user role:', user?.role);
    
    if (!isAuthenticated || user?.role !== 'employee') {
      // console.log('CheckpointPage: Redirecting to login');
      navigate('/login', { 
        state: { from: { pathname: '/checkpoint' } },
        replace: true 
      });
    } else {
      // console.log('CheckpointPage: User is authenticated employee, staying on page');
    }
  }, [isAuthenticated, user, navigate]);

  const handleTicketLookup = async () => {
    if (!ticketId.trim()) {
      setError('Please enter a ticket ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTicket(null);
      setCheckoutData(null);
      setSubscription(null);

      // First, try to get ticket info
      const ticketResponse = await ticketAPI.getTicket(ticketId.trim());
      const ticketData = ticketResponse.data;
      setTicket(ticketData);

      // If it's a subscriber ticket, get subscription info
      if (ticketData.type === 'subscriber' && ticketData.subscriptionId) {
        try {
          const subResponse = await subscriptionAPI.getSubscription(ticketData.subscriptionId);
          setSubscription(subResponse.data);
        } catch (subError) {
          console.warn('Could not fetch subscription:', subError);
        }
      }

      // Calculate checkout amount
      const checkoutResponse = await ticketAPI.checkout({
        ticketId: ticketId.trim(),
        forceConvertToVisitor: false
      });
      setCheckoutData(checkoutResponse.data);

    } catch (error) {
      setError(error.response?.data?.message || 'Ticket not found or already checked out');
      setTicket(null);
      setCheckoutData(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToVisitor = async () => {
    if (!ticketId.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const checkoutResponse = await ticketAPI.checkout({
        ticketId: ticketId.trim(),
        forceConvertToVisitor: true
      });
      setCheckoutData(checkoutResponse.data);
      setSubscription(null); // Clear subscription since we're converting to visitor

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to convert to visitor');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCheckout = () => {
    // Reset form for next ticket
    setTicketId('');
    setTicket(null);
    setCheckoutData(null);
    setSubscription(null);
    setError(null);
    
    // Show success message
    showSuccess('Checkout completed successfully! The customer can now exit the parking area.');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated || user?.role !== 'employee') {
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
      
      {/* Checkpoint Header Section */}
      <div className="checkpoint-header-section space" style={{ 
        background: 'linear-gradient(135deg, #E8092E 0%, #1B1F28 100%)',
        color: 'white',
        paddingTop: '120px',
        paddingBottom: '80px'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8">
              <div className="title-area">
                <span className="sub-title text-white">Employee Portal</span>
                <h1 className="sec-title text-white">
                  <i className="fas fa-clipboard-check me-3"></i>
                  Checkpoint - Checkout
                </h1>
                <p className="sec-text text-white">
                  <i className="fas fa-user-tie me-2"></i>
                  Employee: {user?.name || user?.username}
                </p>
              </div>
            </div>
            <div className="col-xl-4 text-xl-end">
              <div className="checkpoint-actions">
                <button 
                  className="btn style2 logout-btn"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="logo-bg" />
      </div>

      {/* Ticket Lookup Section */}
      <div className="ticket-lookup-section space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="ticket-lookup-card">
                <div className="card-header">
                  <div className="header-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <div className="header-content">
                    <h4>Ticket Lookup</h4>
                    <p>Enter ticket ID or scan QR code to process checkout</p>
                  </div>
                </div>
                <div className="card-body">
                  <div className="ticket-input-group">
                    <div className="input-wrapper">
                      <i className="fas fa-ticket-alt input-icon"></i>
                      <input
                        type="text"
                        className="ticket-input"
                        placeholder="Enter ticket ID or scan QR code"
                        value={ticketId}
                        onChange={(e) => setTicketId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTicketLookup()}
                      />
                    </div>
                    <button
                      className="lookup-btn"
                      onClick={handleTicketLookup}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-search me-2"></i>
                          Lookup Ticket
                        </>
                      )}
                    </button>
                  </div>
                  <div className="input-help">
                    <i className="fas fa-info-circle me-2"></i>
                    Enter the ticket ID or scan the QR code from the parking ticket
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Error display */}
        {error && (
          <div className="error-section">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <div className="error-alert">
                    <div className="alert-icon">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="alert-content">
                      <h6>Error</h6>
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Panel */}
        {(ticket || checkoutData) && (
          <CheckoutPanel
            ticket={ticket}
            checkoutData={checkoutData}
            subscription={subscription}
            onConvertToVisitor={handleConvertToVisitor}
            onCompleteCheckout={handleCompleteCheckout}
            loading={loading}
          />
        )}

        {/* Instructions */}
        {!ticket && !checkoutData && (
          <div className="instructions-section space">
            <div className="container">
              <div className="title-area text-center mb-50">
                <span className="sub-title">How It Works</span>
                <h2 className="sec-title">Checkout Process Instructions</h2>
                <p className="sec-text">Follow these steps to process parking ticket checkouts</p>
              </div>
              
              <div className="row gy-4">
                <div className="col-lg-6">
                  <div className="instruction-card visitor">
                    <div className="card-header">
                      <div className="header-icon">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="header-content">
                        <h4>Visitor Tickets</h4>
                        <p>Process payment for visitor parking</p>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="instruction-steps">
                        <div className="step">
                          <div className="step-number">1</div>
                          <div className="step-content">
                            <h6>Enter Ticket ID</h6>
                            <p>Enter the ticket ID from the parking ticket</p>
                          </div>
                        </div>
                        <div className="step">
                          <div className="step-number">2</div>
                          <div className="step-content">
                            <h6>Review Payment</h6>
                            <p>Review the payment breakdown and duration</p>
                          </div>
                        </div>
                        <div className="step">
                          <div className="step-number">3</div>
                          <div className="step-content">
                            <h6>Collect Payment</h6>
                            <p>Collect payment and complete checkout</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-6">
                  <div className="instruction-card subscriber">
                    <div className="card-header">
                      <div className="header-icon">
                        <i className="fas fa-id-card"></i>
                      </div>
                      <div className="header-content">
                        <h4>Subscriber Tickets</h4>
                        <p>Process subscriber parking checkout</p>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="instruction-steps">
                        <div className="step">
                          <div className="step-number">1</div>
                          <div className="step-content">
                            <h6>Enter Ticket ID</h6>
                            <p>Enter the ticket ID from the parking ticket</p>
                          </div>
                        </div>
                        <div className="step">
                          <div className="step-number">2</div>
                          <div className="step-content">
                            <h6>Verify Vehicle</h6>
                            <p>Verify the vehicle matches registered vehicles</p>
                          </div>
                        </div>
                        <div className="step">
                          <div className="step-number">3</div>
                          <div className="step-content">
                            <h6>Complete Checkout</h6>
                            <p>If vehicle matches, complete checkout (no payment required)</p>
                          </div>
                        </div>
                        <div className="step">
                          <div className="step-number">4</div>
                          <div className="step-content">
                            <h6>Convert if Needed</h6>
                            <p>If vehicle doesn't match, convert to visitor ticket</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      
      {/* Main Website Footer */}
      <FooterAreaOne />
    </>
  );
};

export default CheckpointPage;
