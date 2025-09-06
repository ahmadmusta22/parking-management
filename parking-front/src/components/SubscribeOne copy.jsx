import React from "react";
import { Link } from "react-router-dom";

const SubscribeOne = () => {
  return (
    <div className="container">
      <div
        className="footer-top-1 bg-theme"
        style={{ backgroundImage: "url(assets/img/bg/footer-top-bg1-1.png)" }}
      >
        <div className="footer-logo">
          <Link to="/">
            <img src="assets/img/logo-white.svg" alt="Fixturbo" />
          </Link>
        </div>
        <div className="call-media-wrap">
          <div className="icon">
            <img src="assets/img/icon/phone-1.svg" alt="Fixturbo" />
          </div>
          <div className="media-body">
            <h6 className="title text-white">Requesting A Call:</h6>
            <h4 className="link">
              <a className="text-white" href="tel:6295550129">
                (629) 555-0129
              </a>
            </h4>
          </div>
        </div>
        <div className="social-btn">
          <a href="https://facebook.com/">
            <i className="fab fa-facebook-f" />
          </a>
          <a href="https://twitter.com/">
            <i className="fab fa-twitter" />
          </a>
          <a href="https://instagram.com/">
            <i className="fab fa-instagram" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscribeOne;
