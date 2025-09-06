import React from "react";

const ProcessAreaOne = () => {
  return (
    <section className="process-area-1 space position-relative">
      <div className="portfolio-shape-img shape-mockup d-lg-block d-none">
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
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="title-area text-center">
              <span className="sub-title">How It Works</span>
              <h2 className="sec-title" style={{ color: '#1B1F28' }}>
                Smart Parking System Process
              </h2>
            </div>
          </div>
        </div>
        <div className="row gy-30">
          <div className="col-lg-4 process-card-wrap">
            <div className="process-card">
              <div className="process-card-icon">
                <img src="/assets/img/icon/process-icon-1-1.svg" alt="Fixturbo" />
              </div>
              <h4 className="process-card-title" style={{ color: '#1B1F28' }}>Find Available Parking</h4>
              <p className="process-card-text" style={{ color: '#1B1F28' }}>
                Real-time parking availability updates help you find the nearest 
                available spot quickly and efficiently, reducing search time and fuel consumption.
              </p>
            </div>
          </div>
          <div className="col-lg-4 process-card-wrap">
            <div className="process-card process-card-center">
              <div className="process-card-icon">
                <img src="/assets/img/icon/process-icon-1-2.svg" alt="Fixturbo" />
              </div>
              <h4 className="process-card-title" style={{ color: '#1B1F28' }}>Automated Check-In</h4>
              <p className="process-card-text" style={{ color: '#1B1F28' }}>
                Seamless entry process with automated gate control, ticket generation, 
                and payment processing for both visitors and subscribers.
              </p>
            </div>
          </div>
          <div className="col-lg-4 process-card-wrap">
            <div className="process-card">
              <div className="process-card-icon">
                <img src="/assets/img/icon/process-icon-1-3.svg" alt="Fixturbo" />
              </div>
              <h4 className="process-card-title" style={{ color: '#1B1F28' }}>Smart Check-Out</h4>
              <p className="process-card-text" style={{ color: '#1B1F28' }}>
                Automated exit process with instant payment calculation, receipt generation, 
                and gate control for a smooth departure experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessAreaOne;
