import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HeaderOne from '../components/HeaderOne';
import FooterAreaOne from '../components/FooterAreaOne';
import ZoneCard from '../components/parking/ZoneCard';
import TicketModal from '../components/parking/TicketModal';
import GateAnimation from '../components/parking/GateAnimation';
import Preloader from '../helper/Preloader';
import useParkingStore from '../store/parkingStore';
import useToast from '../hooks/useToast';
import wsService from '../services/websocket';
import { masterAPI, ticketAPI, subscriptionAPI } from '../services/api';

const GatePage = () => {
  const { gateId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [activeTab, setActiveTab] = useState('visitor');
  const [selectedZone, setSelectedZone] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showGateAnimation, setShowGateAnimation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [specialRateActive, setSpecialRateActive] = useState(false);
  const [preloaderActive, setPreloaderActive] = useState(true);

  const {
    gates,
    currentGate,
    currentGateZones,
    wsConnected,
    setCurrentGate,
    setZones,
    updateZone,
    setWSConnected,
    setWSError
  } = useParkingStore();

  // Preloader effect
  useEffect(() => {
    setTimeout(() => {
      setPreloaderActive(false);
    }, 2000);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch gate data
  const { data: gatesData, isLoading: gatesLoading } = useQuery({
    queryKey: ['gates'],
    queryFn: () => masterAPI.getGates(),
    select: (response) => response.data
  });

  // Fetch zones for current gate
  const { data: zonesData, isLoading: zonesLoading, error: zonesError } = useQuery({
    queryKey: ['zones', gateId],
    queryFn: () => {
      console.log('Fetching zones for gateId:', gateId);
      return masterAPI.getZones(gateId);
    },
    select: (response) => {
      console.log('Zones API response:', response);
      return response.data;
    },
    enabled: !!gateId
  });

  // Set current gate when gates data is loaded
  useEffect(() => {
    if (gatesData && gateId) {
      const gate = gatesData.find(g => g.id === gateId);
      if (gate) {
        console.log('Setting current gate:', gate);
        setCurrentGate(gate);
      } else {
        navigate('/');
      }
    }
  }, [gatesData, gateId, setCurrentGate, navigate]);

  // Set zones in store when zones data is loaded
  useEffect(() => {
    if (zonesData) {
      console.log('Setting zones in store:', zonesData);
      setZones(zonesData);
    }
  }, [zonesData, setZones]);

  // WebSocket connection and subscription
  useEffect(() => {
    if (gateId) {
      wsService.connect();
      
      const handleZoneUpdate = (zoneData) => {
        updateZone(zoneData);
      };

      const handleAdminUpdate = (adminData) => {
        // Handle admin updates if needed
        console.log('Admin update received:', adminData);
      };

      const handleConnected = () => {
        setWSConnected(true);
        setWSError(null);
        wsService.subscribe(gateId);
      };

      const handleDisconnected = () => {
        setWSConnected(false);
      };

      const handleError = (error) => {
        setWSError(error);
      };

      wsService.on('zone-update', handleZoneUpdate);
      wsService.on('admin-update', handleAdminUpdate);
      wsService.on('connected', handleConnected);
      wsService.on('disconnected', handleDisconnected);
      wsService.on('error', handleError);

      return () => {
        wsService.off('zone-update', handleZoneUpdate);
        wsService.off('admin-update', handleAdminUpdate);
        wsService.off('connected', handleConnected);
        wsService.off('disconnected', handleDisconnected);
        wsService.off('error', handleError);
        wsService.unsubscribe(gateId);
      };
    }
  }, [gateId, updateZone, setWSConnected, setWSError]);

  // Check for special rate (simplified - in real app, this would come from WebSocket)
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Simple logic: special rate during rush hours (7-9 AM, 5-7 PM on weekdays)
    const isRushHour = (day >= 1 && day <= 5) && 
                      ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19));
    
    setSpecialRateActive(isRushHour);
  }, []);

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setError(null);
  };

  const handleSubscriptionVerify = async () => {
    if (!subscriptionId.trim()) {
      setError('Please enter a subscription ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionAPI.getSubscription(subscriptionId.trim());
      setSubscription(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid subscription ID');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (!selectedZone) {
      setError('Please select a zone');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const checkinData = {
        gateId,
        zoneId: selectedZone.id,
        type: activeTab
      };

      if (activeTab === 'subscriber') {
        if (!subscription) {
          setError('Please verify your subscription first');
          return;
        }
        checkinData.subscriptionId = subscription.id;
      }

      const response = await ticketAPI.checkin(checkinData);
      setTicket(response.data.ticket);
      
      // Show gate animation first
      setShowGateAnimation(true);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketModalClose = () => {
    setShowTicketModal(false);
    setTicket(null);
  };

  const handleGateAnimationComplete = () => {
    setShowGateAnimation(false);
    setShowTicketModal(true);
    
    // Reset form
    setSelectedZone(null);
    setSubscriptionId('');
    setSubscription(null);
  };

  const isZoneSelectable = (zone) => {
    if (!zone.open) return false;
    if (activeTab === 'visitor') {
      return zone.availableForVisitors > 0;
    } else {
      return zone.availableForSubscribers > 0 && 
             subscription && 
             subscription.category === zone.categoryId;
    }
  };

  // Show preloader
  if (preloaderActive) {
    return <Preloader />;
  }

  if (gatesLoading || zonesLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Debug info
  console.log('GatePage render - gatesData:', gatesData);
  console.log('GatePage render - zonesData:', zonesData);
  console.log('GatePage render - zonesError:', zonesError);
  console.log('GatePage render - currentGate:', currentGate);
  console.log('GatePage render - currentGateZones:', currentGateZones);

  return (
    <>
      {/* Main Website Header */}
      <HeaderOne />
      
      {/* Gate Header Section */}
      <div className="gate-header-section space" style={{ 
        background: 'linear-gradient(135deg, #E8092E 0%, #1B1F28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8">
              <div className="title-area">
                <span className="sub-title text-white">Smart Parking System</span>
                <h1 className="sec-title text-white">
                  {currentGate?.name || 'Gate'}
                </h1>
                <p className="sec-text text-white">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  {currentGate?.location || 'Location'}
                </p>
              </div>
            </div>
            <div className="col-xl-4 text-xl-end">
              <div className="gate-status-info">
                <div className="connection-status mb-3">
                  <span className={`status-badge ${wsConnected ? 'connected' : 'disconnected'}`}>
                    <i className={`fas ${wsConnected ? 'fa-wifi' : 'fa-wifi-slash'} me-2`}></i>
                    {wsConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="current-time">
                  <i className="fas fa-clock me-2"></i>
                  {currentTime}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="parking-system-area space-bottom">
        <div className="container">
          {/* Tabs */}
          <div className="parking-tabs mb-50">
            <div className="tab-nav">
              <button
                className={`tab-btn ${activeTab === 'visitor' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('visitor');
                  setSelectedZone(null);
                  setError(null);
                }}
              >
                <i className="fas fa-user me-2"></i>
                Visitor Parking
              </button>
              <button
                className={`tab-btn ${activeTab === 'subscriber' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('subscriber');
                  setSelectedZone(null);
                  setError(null);
                }}
              >
                <i className="fas fa-id-card me-2"></i>
                Subscriber Parking
              </button>
            </div>
          </div>

          {/* Subscriber verification */}
          {activeTab === 'subscriber' && (
            <div className="subscriber-verification mb-50">
              <div className="row gy-4">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label htmlFor="subscriptionId" className="form-label">
                      Subscription ID
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="subscriptionId"
                      value={subscriptionId}
                      onChange={(e) => setSubscriptionId(e.target.value)}
                      placeholder="Enter your subscription ID"
                      onKeyPress={(e) => e.key === 'Enter' && handleSubscriptionVerify()}
                    />
                  </div>
                </div>
                <div className="col-lg-6 d-flex align-items-end">
                  <button
                    className="btn style2"
                    onClick={handleSubscriptionVerify}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search me-2"></i>
                        Verify Subscription
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {subscription && (
                <div className="subscription-info mt-4">
                  <div className="success-alert">
                    <div className="alert-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="alert-content">
                      <h6>Subscription Verified</h6>
                      <p><strong>Name:</strong> {subscription.userName}</p>
                      <p><strong>Category:</strong> {subscription.category}</p>
                      <p><strong>Status:</strong> {subscription.active ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="error-alert mb-50">
              <div className="alert-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="alert-content">
                {error}
              </div>
            </div>
          )}

          {/* Zone selection */}
          <div className="zone-selection">
            <div className="title-area text-center mb-50">
              <span className="sub-title">Available Parking Zones</span>
              <h2 className="sec-title">Select Your Preferred Zone</h2>
            </div>
            <div className="row gy-4">
              {currentGateZones.map((zone) => (
                <div key={zone.id} className="col-lg-4 col-md-6">
                  <ZoneCard
                    zone={zone}
                    isSelected={selectedZone?.id === zone.id}
                    onSelect={handleZoneSelect}
                    isDisabled={!isZoneSelectable(zone)}
                    specialRateActive={specialRateActive}
                    visitorMode={activeTab === 'visitor'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Check-in button */}
          <div className="checkin-section text-center mt-50">
            <button
              className="btn style2 btn-lg"
              onClick={handleCheckin}
              disabled={!selectedZone || loading || (activeTab === 'subscriber' && !subscription)}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-car me-2"></i>
                  Check In
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Gate Animation */}
      {showGateAnimation && (
        <GateAnimation
          isOpen={true}
          onAnimationComplete={handleGateAnimationComplete}
        />
      )}

      {/* Ticket Modal */}
      {showTicketModal && (
        <TicketModal
          ticket={ticket}
          zone={selectedZone}
          gate={currentGate}
          onClose={handleTicketModalClose}
        />
      )}
      
      {/* Main Website Footer */}
      <FooterAreaOne />
    </>
  );
};

export default GatePage;
