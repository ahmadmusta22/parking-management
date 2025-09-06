import React from "react";
import TrackVisibility from "react-on-screen";
import CountUp from "react-countup";
const AboutTwo = () => {
  return (
    <div className="space-top">
      <div className="container">
        <div className="row">
          <div className="col-xxl-7 col-xl-6">
            <div className="about-thumb2 mb-40 mb-xl-0">
              <div className="about-img-1">
                <img src="assets/img/normal/15th.jpg" alt="Fixturbo" />
              </div>
              <div className="about-img-2">
                <img src="assets/img/normal/16th.jpg" alt="Fixturbo" />
              </div>
              <div className="about-counter-wrap jump-reverse">
                <img src="assets/img/icon/about_icon2-1.svg" alt="Fixturbo" />
                <h3 className="about-counter">
                  <TrackVisibility once>
                    {({ isVisible }) =>
                      isVisible && (
                        <span className="counter-number">
                          <CountUp delay={0} start={0} end={250} />
                          +
                        </span>
                      )
                    }
                  </TrackVisibility>
                </h3>
                <h4 className="about-counter-text">Daily Users</h4>
              </div>
              <div className="about-year-wrap2 movingX">
                <div className="about-year-grid-wrap">
                  <div className="icon">
                    <img src="assets/img/icon/about_icon2-2.png" alt="Fixturbo" />
                  </div>
                  <h3 className="about-counter">
                    <span className="counter-number">9</span>
                  </h3>
                </div>
                <h4 className="about-year-text">Parking Zones</h4>
              </div>
            </div>
          </div>
          <div className="col-xxl-5 col-xl-6">
            <div className="about-content-wrap">
              <div className="title-area mb-40">
                <span className="sub-title">Know About Us</span>
                <h2 className="sec-title">
                  Smart Parking Solutions For Modern Cities{" "}
                  <img
                    className="title-bg-shape shape-center"
                    src="assets/img/bg/title-bg-shape.png"
                    alt="Fixturbo"
                  />
                </h2>
                <p className="sec-text mb-4">
                  Our parking reservation system provides seamless parking
                  management for both visitors and employees. With real-time
                  availability tracking, automated billing, and smart access
                  control, we make parking simple and efficient.
                </p>
              </div>
              <div className="about-feature-wrap style-shadow mb-4">
                <div className="icon">
                  <img src="assets/img/icon/about_icon2-3.svg" alt="Fixturbo" />
                </div>
                <div className="about-feature-wrap-details">
                  <h5 className="about-feature-title">
                    Smart Access Control
                  </h5>
                  <p className="about-feature-text">
                    Automated gate control with real-time monitoring and
                    secure access management for all parking zones.
                  </p>
                </div>
              </div>
              <div className="about-feature-wrap style-shadow">
                <div className="icon">
                  <img src="assets/img/icon/about_icon2-4.svg" alt="Fixturbo" />
                </div>
                <div className="about-feature-wrap-details">
                  <h5 className="about-feature-title">Real-Time Analytics</h5>
                  <p className="about-feature-text">
                    Comprehensive reporting and analytics dashboard for
                    parking occupancy, revenue tracking, and system performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTwo;
