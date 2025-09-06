import React from "react";
import { Link } from "react-router-dom";

const HeroOne = () => {
  return (
    <div
      className="hero-wrapper hero-1"
      id="hero"
      style={{ 
        backgroundImage: "url('/assets/img/hero/5th-parking.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="container">
        <div className="row flex-row-reverse">
          <div className="col-xl-6">
            <div className="hero-style1">
              <span className="sub-title text-white">Smart Parking Solutions</span>
              <h1 className="hero-title text-white">
                Park Smart{" "}
                <span>
                  <img src="/assets/img/hero/hero_shape_1.png" alt="WeLink CARGO" />
                  Live Easy
                </span>{" "}
                With Our System
              </h1>
              <p className="hero-text text-white">
                Advanced parking management system with real-time availability, automated check-in/out, and seamless user experience
              </p>
              <div className="btn-group">
                <Link to="/gate/gate_1" className="btn">
                  <i className="fas fa-parking me-2"></i>
                  Find Parking
                </Link>
                <Link to="/" className="btn style-border">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="hero-thumb text-center">
              {/* <img src="/assets/img/hero/hero_thumb_1_1.png" alt="Fixturbo" /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroOne;
