import React from "react";
import TrackVisibility from "react-on-screen";
import CountUp from "react-countup";

const CounterOne = () => {
  return (
    <div className="counter-area-1 space-bottom" style={{ marginTop: '60px' }}>
      <div className="container">
        <div className="counter-wrap1">
          <div className="row gx-0 align-items-center">
            <div className="col-lg-6">
              <div className="counter-card-wrap">
                <div className="row gy-30 justify-content-between">
                  <div className="col-sm-6 col-lg-auto">
                    <div className="counter-card">
                      <div className="media-body">
                        <h2 className="counter-card_number">
                          <TrackVisibility once>
                            {({ isVisible }) =>
                              isVisible && (
                                <span className="counter-number">
                                  <CountUp delay={0} start={0} end={9} />
                                </span>
                              )
                            }
                          </TrackVisibility>
                        </h2>
                        <p className="counter-card_text">Parking Zones</p>
                      </div>
                      <div className="counter-card_icon">
                        <img
                          src="assets/img/icon/counter-icon_1-1.svg"
                          alt="Fixturbo"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-auto">
                    <div className="counter-card">
                      <div className="media-body">
                        <h2 className="counter-card_number">
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
                        </h2>
                        <p className="counter-card_text">Daily Users</p>
                      </div>
                      <div className="counter-card_icon">
                        <img
                          src="assets/img/icon/counter-icon_1-2.svg"
                          alt="Fixturbo"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-auto">
                    <div className="counter-card">
                      <div className="media-body">
                        <h2 className="counter-card_number">
                          <TrackVisibility once>
                            {({ isVisible }) =>
                              isVisible && (
                                <span className="counter-number">
                                  <CountUp delay={0} start={0} end={580} />
                                </span>
                              )
                            }
                          </TrackVisibility>
                        </h2>
                        <p className="counter-card_text">Parking Spaces</p>
                      </div>
                      <div className="counter-card_icon">
                        <img
                          src="assets/img/icon/counter-icon_1-3.svg"
                          alt="Fixturbo"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-auto">
                    <div className="counter-card">
                      <div className="media-body">
                        <h2 className="counter-card_number">
                          <TrackVisibility once>
                            {({ isVisible }) =>
                              isVisible && (
                                <span className="counter-number">
                                  <CountUp delay={0} start={0} end={6} />
                                </span>
                              )
                            }
                          </TrackVisibility>
                        </h2>
                        <p className="counter-card_text">Active Subscribers</p>
                      </div>
                      <div className="counter-card_icon">
                        <img
                          src="assets/img/icon/counter-icon_1-4.svg"
                          alt="Fixturbo"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div
                className="counter-checklist-wrap"
                // style={{
                //   backgroundImage:
                //     "url(assets/img/bg/counter-checklist-bg.png)",
                // }}
              >
                <div className="checklist style-white mb-50">
                  <ul>
                    <li>
                      <i className="fas fa-check" />
                      Smart Parking Solutions
                    </li>
                    <li>
                      <i className="fas fa-check" />
                      Real-time Availability
                    </li>
                    <li>
                      <i className="fas fa-check" />
                      24/7 Automated System
                    </li>
                  </ul>
                </div>
                <div className="call-media-wrap">
                  <div className="icon">
                    <img src="assets/img/icon/phone-1.svg" alt="Fixturbo" />
                  </div>
                  <div className="media-body">
                    <h6 className="title text-white">Parking Support:</h6>
                    <h4 className="link">
                      <a className="text-white" href="tel:1234567890">
                        (123) 456-7890
                      </a>
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterOne;
