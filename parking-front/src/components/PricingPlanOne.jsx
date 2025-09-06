import React from "react";
import { Link } from "react-router-dom";

const PricingPlanOne = () => {
  return (
    <div className="pricing-area space">
      <div className="pricing-shape-img1 shape-mockup d-lg-block d-none">
        <img
          className="about1-shape-img-1 spin"
          src="assets/img/normal/about_shape1-2.svg"
          alt="Fixturbo"
        />
        <img
          className="about1-shape-img-2 spin2"
          src="assets/img/normal/about_shape1-1.svg"
          alt="Fixturbo"
        />
      </div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-lg-7">
            <div className="title-area text-center">
              <h3 className="sub-title">Our Pricing</h3>
              <h2 className="sec-title">
                It Dependable Car Repair Best Solutions
              </h2>
            </div>
          </div>
        </div>
        <div className="row gy-4 justify-content-center">
          <div className="col-lg-6">
            <div className="pricing-card">
              <div className="pricing-card-price-wrap">
                <h3 className="pricing-card_price">
                  <span className="currency">$</span>29
                  <span className="duration">/month</span>
                </h3>
                <div className="pricing-card_icon">
                  <img src="assets/img/icon/picing-icon_1-1.svg" alt="Fixturbo" />
                </div>
              </div>
              <div className="pricing-card-details">
                <h4 className="pricing-card_title">Car Care Clinic</h4>
                <div className="checklist style2">
                  <ul>
                    <li>
                      <i className="fas fa-angle-right" />
                      Expert Car Repair Specialists
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Profession Car Repair Service
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Quick and Efficient Car Repair
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Trusted Car Repair
                    </li>
                  </ul>
                </div>
                <Link className="btn style-border2" to="/about">
                  Start now <i className="fas fa-arrow-right ms-2" />
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="pricing-card">
              <div className="pricing-card-price-wrap">
                <h3 className="pricing-card_price">
                  <span className="currency">$</span>25
                  <span className="duration">/month</span>
                </h3>
                <div className="pricing-card_icon">
                  <img src="assets/img/icon/picing-icon_1-2.svg" alt="Fixturbo" />
                </div>
              </div>
              <div className="pricing-card-details">
                <h4 className="pricing-card_title">Repair service</h4>
                <div className="checklist style2">
                  <ul>
                    <li>
                      <i className="fas fa-angle-right" />
                      Expert Car Repair Specialists
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Profession Car Repair Service
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Quick and Efficient Car Repair
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Trusted Car Repair
                    </li>
                  </ul>
                </div>
                <Link className="btn style-border2" to="/about">
                  Start now <i className="fas fa-arrow-right ms-2" />
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="pricing-card">
              <div className="pricing-card-price-wrap">
                <h3 className="pricing-card_price">
                  <span className="currency">$</span>30
                  <span className="duration">/month</span>
                </h3>
                <div className="pricing-card_icon">
                  <img src="assets/img/icon/picing-icon_1-3.svg" alt="Fixturbo" />
                </div>
              </div>
              <div className="pricing-card-details">
                <h4 className="pricing-card_title">Auto Fixers</h4>
                <div className="checklist style2">
                  <ul>
                    <li>
                      <i className="fas fa-angle-right" />
                      Expert Car Repair Specialists
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Profession Car Repair Service
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Quick and Efficient Car Repair
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Trusted Car Repair
                    </li>
                  </ul>
                </div>
                <Link className="btn style-border2" to="/about">
                  Start now <i className="fas fa-arrow-right ms-2" />
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="pricing-card">
              <div className="pricing-card-price-wrap">
                <h3 className="pricing-card_price">
                  <span className="currency">$</span>39
                  <span className="duration">/month</span>
                </h3>
                <div className="pricing-card_icon">
                  <img src="assets/img/icon/picing-icon_1-4.svg" alt="Fixturbo" />
                </div>
              </div>
              <div className="pricing-card-details">
                <h4 className="pricing-card_title">Pro Auto Fix</h4>
                <div className="checklist style2">
                  <ul>
                    <li>
                      <i className="fas fa-angle-right" />
                      Expert Car Repair Specialists
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Profession Car Repair Service
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Quick and Efficient Car Repair
                    </li>
                    <li>
                      <i className="fas fa-angle-right" />
                      Trusted Car Repair
                    </li>
                  </ul>
                </div>
                <Link className="btn style-border2" to="/about">
                  Start now <i className="fas fa-arrow-right ms-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlanOne;
