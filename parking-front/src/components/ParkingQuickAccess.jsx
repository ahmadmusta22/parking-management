import React from 'react';
import { Link } from 'react-router-dom';

const ParkingQuickAccess = () => {
  return (
    <section className="parking-quick-access space">
      <div className="container">
        <div className="title-area text-center mb-50">
          <span className="sub-title">Smart Parking Solutions</span>
          <h2 className="sec-title">WeLink CARGO Parking System</h2>
          <p className="sec-text">Quick access to all parking features and management tools</p>
        </div>
        
        <div className="row gy-4">
          {/* Gates Section */}
          <div className="col-lg-6">
            <div className="parking-access-card">
              <div className="card-header">
                <div className="header-icon">
                  <i className="fas fa-door-open"></i>
                </div>
                <div className="header-content">
                  <h4>Parking Gates</h4>
                  <p>Access any parking gate for check-in</p>
                </div>
              </div>
              <div className="card-body">
                <div className="gates-grid">
                  <Link to="/gate/gate_1" className="gate-btn">
                    <i className="fas fa-door-open"></i>
                    <span>Gate 1</span>
                    <small>Main Entrance</small>
                  </Link>
                  <Link to="/gate/gate_2" className="gate-btn">
                    <i className="fas fa-door-open"></i>
                    <span>Gate 2</span>
                    <small>East Entrance</small>
                  </Link>
                  <Link to="/gate/gate_3" className="gate-btn">
                    <i className="fas fa-door-open"></i>
                    <span>Gate 3</span>
                    <small>South Entrance</small>
                  </Link>
                  <Link to="/gate/gate_4" className="gate-btn">
                    <i className="fas fa-door-open"></i>
                    <span>Gate 4</span>
                    <small>West Entrance</small>
                  </Link>
                  <Link to="/gate/gate_5" className="gate-btn vip">
                    <i className="fas fa-crown"></i>
                    <span>VIP Gate 5</span>
                    <small>Executive Building</small>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Access Section */}
          <div className="col-lg-6">
            <div className="parking-access-card">
              <div className="card-header">
                <div className="header-icon">
                  <i className="fas fa-user-tie"></i>
                </div>
                <div className="header-content">
                  <h4>Employee Access</h4>
                  <p>Employee checkout and management</p>
                </div>
              </div>
              <div className="card-body">
                <div className="employee-actions">
                  <Link to="/checkpoint" className="action-btn">
                    <div className="action-icon">
                      <i className="fas fa-clipboard-check"></i>
                    </div>
                    <div className="action-content">
                      <span className="action-title">Checkpoint</span>
                      <small>Employee Checkout</small>
                    </div>
                  </Link>
                  <Link to="/login" className="action-btn">
                    <div className="action-icon">
                      <i className="fas fa-sign-in-alt"></i>
                    </div>
                    <div className="action-content">
                      <span className="action-title">Employee Login</span>
                      <small>Access Employee Portal</small>
                    </div>
                  </Link>
                  <Link to="/login" className="action-btn admin">
                    <div className="action-icon">
                      <i className="fas fa-shield-alt"></i>
                    </div>
                    <div className="action-content">
                      <span className="action-title">Admin Access</span>
                      <small>System Administration</small>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section mt-50">
          <div className="title-area text-center mb-50">
            <span className="sub-title">System Features</span>
            <h2 className="sec-title">Why Choose Our Parking System</h2>
          </div>
          <div className="row gy-4">
            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="feature-content">
                  <h5>Real-time Updates</h5>
                  <p>Live zone availability and instant status updates</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div className="feature-content">
                  <h5>Mobile Friendly</h5>
                  <p>Responsive design that works on all devices</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="feature-content">
                  <h5>Secure Access</h5>
                  <p>Role-based permissions and secure authentication</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-print"></i>
                </div>
                <div className="feature-content">
                  <h5>Print Tickets</h5>
                  <p>Printable parking tickets and receipts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParkingQuickAccess;
