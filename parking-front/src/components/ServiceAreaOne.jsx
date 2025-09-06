import React from "react";
import { Link } from "react-router-dom";

const ServiceAreaOne = () => {
  return (
    <div className="service-area-1 space-top bg-smoke overflow-hidden mb-5 mb-lg-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="title-area text-center">
              <span className="sub-title">Our Services</span>
              <h2 className="sec-title">
                Smart Parking Solutions & Management
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row gy-4 justify-content-center pb-4 pb-lg-5">
          <div className="col-lg-4 col-md-6">
            <div className="service-card h-100">
              <div className="service-card_content">
                <div className="service-card_icon">
                  <img src="assets/img/icon/service-icon_1-1.svg" alt="Fixturbo" />
                </div>
                <h4 className="service-card_title h5">
                  <Link to="/gate/gate_1">Visitor Parking</Link>
                </h4>
                <p className="service-card_text">
                  Quick and easy parking for visitors with real-time availability and automated check-in system
                </p>
                <Link to="/gate/gate_1" className="link-btn">
                  Find Parking <i className="fas fa-arrow-right" />
                </Link>
              </div>
              <div className="service-card_img">
                <img src="assets/img/service/8th.jpg" alt="Fixturbo" />
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="service-card h-100">
              <div className="service-card_content">
                <div className="service-card_icon">
                  <img src="assets/img/icon/service-icon_1-2.svg" alt="Fixturbo" />
                </div>
                <h4 className="service-card_title h5">
                  <Link to="/checkpoint">Checkpoint Services</Link>
                </h4>
                <p className="service-card_text">
                  Professional checkout services with automated payment processing and subscription management
                </p>
                <Link to="/checkpoint" className="link-btn">
                  Employee Access <i className="fas fa-arrow-right" />
                </Link>
              </div>
              <div className="service-card_img">
                <img src="assets/img/service/6th.jpg" alt="Fixturbo" />
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="service-card h-100">
              <div className="service-card_content">
                <div className="service-card_icon">
                  <img src="assets/img/icon/service-icon_1-3.svg" alt="Fixturbo" />
                </div>
                <h4 className="service-card_title h5">
                  <Link to="/gate/gate_5">VIP Parking</Link>
                </h4>
                <p className="service-card_text">
                Premium parking experience with dedicated VIP entrance, exclusive parking zones, priority assistance
                </p>
                <Link to="/gate/gate_5" className="link-btn">
                  VIP Access <i className="fas fa-arrow-right" />
                </Link>
              </div>
              <div className="service-card_img">
                <img src="assets/img/service/7th.jpg" alt="Fixturbo" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceAreaOne;
