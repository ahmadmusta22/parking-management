import React from "react";
import { Link } from "react-router-dom";

const AboutOne = () => {
  return (
    <div className="about-area-1 space-bottom ">
      <div className="about1-shape-img shape-mockup">
        <img
          className="about1-shape-img-1 spin"
          src="/assets/img/normal/about_shape1-2.svg"
          alt="Fixturbo"
        />
        <img
          className="about1-shape-img-2 spin2"
          src="/assets/img/normal/about_shape1-1.svg"
          alt="Fixturbo"
        />
      </div>
      <div className="container">
        <div className="row gx-60 align-items-center">
          <div className="col-xl-6">
            <div className="about-thumb1 mb-40 mb-xl-0">
              <div className="about-img-1">
              <img src="/assets/img/normal/4th parking.jpg" alt="Fixturbo" />
              </div>
              <div className="about-img-2">
                <img src="/assets/img/normal/3nd parking.jpg" alt="Fixturbo" />
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="about-content-wrap">
              <div className="title-area me-xl-5 mb-20">
                <span className="sub-title">About Our System</span>
                <h2 className="sec-title">
                  Smart Parking Solutions for Modern Cities
                </h2>
                <p className="sec-text">
                  Our advanced parking management system provides real-time availability, automated check-in/out, and seamless user experience for both visitors and subscribers.
                </p>
              </div>
              <div className="row gy-4 justify-content-xl-between justify-content-end align-items-center flex-row-reverse">
                <div className="col-lg-auto">
                  <div className="about-year-wrap">
                    <div
                      className="about-year-mask-wrap"
                      style={{
                        maskImage: "url(/assets/img/bg/about_counter-bg1-1.png)",
                      }}
                    >
                      <img src="/assets/img/icon/about_icon1-1.svg" alt="Fixturbo" />
                      <h3 className="about-year-wrap-title">
                        <span className="counter-number">500</span>+
                      </h3>
                      <p className="about-year-wrap-text">
                        Parking Spaces
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-xl-auto col-lg-6">
                  <div className="checklist">
                    <ul>
                      <li>
                        <i className="fas fa-check-circle" />
                        Real-time Parking Availability
                      </li>
                      <li>
                        <i className="fas fa-check-circle" />
                        Automated Check-in/Check-out System
                      </li>
                      <li>
                        <i className="fas fa-check-circle" />
                        Smart Payment Processing
                      </li>
                      <li>
                        <i className="fas fa-check-circle" />
                        24/7 Parking Management
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="btn-wrap mt-20">
                <Link to="/" className="btn style2 mt-xl-0 mt-20">
                  Read More <i className="fas fa-arrow-right ms-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutOne;
