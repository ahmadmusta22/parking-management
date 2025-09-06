import React from "react";
import { Link } from "react-router-dom";

const TeamAreaOne = () => {
  return (
    <div className="team-area-1 space-bottom">
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <div className="col-lg-7 col-md-8">
            <div className="title-area">
              <span className="sub-title style2">Team Member</span>
              <h2 className="sec-title">
                Quick and Efficient Car Repair Dependable Car{" "}
              </h2>
            </div>
          </div>
          <div className="col-md-auto">
            <div className="title-area">
              <Link className="btn style2" to="/team">
                View More <i className="fas fa-arrow-right ms-2" />
              </Link>
            </div>
          </div>
        </div>
        <div className="row gy-30">
          <div className="col-lg-12">
            <div className="team-card">
              <div className="team-card_content">
                <h4 className="team-card_title">
                  <Link to="/team-details">Bessie Cooper</Link>
                </h4>
                <span className="team-card_desig">Ux Architect</span>
              </div>
              <div className="team-card_text">
                <p>
                  A car repair is a service provided to fix any issues or
                  damages with your man
                </p>
              </div>
              <div className="team-card_img">
                <img src="assets/img/team/team-1-1.png" alt="Fixturbo" />
              </div>
              <div className="team-social_wrap">
                <div className="social-btn style2">
                  <Link to="https://linkedin.com/">
                    <i className="fab fa-linkedin-in" />
                  </Link>
                  <Link to="https://www.instagram.com/">
                    <i className="fab fa-instagram" />
                  </Link>
                  <Link to="https://facebook.com/">
                    <i className="fab fa-facebook-f" />
                  </Link>
                  <Link to="https://twitter.com/">
                    <i className="fab fa-twitter" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="team-card">
              <div className="team-card_content">
                <h4 className="team-card_title">
                  <Link to="/team-details">Esther Howard</Link>
                </h4>
                <span className="team-card_desig">President of Sales</span>
              </div>
              <div className="team-card_text">
                <p>
                  A car repair is a service provided to fix any issues or
                  damages with your man
                </p>
              </div>
              <div className="team-card_img">
                <img src="assets/img/team/team-1-2.png" alt="Fixturbo" />
              </div>
              <div className="team-social_wrap">
                <div className="social-btn style2">
                  <Link to="https://linkedin.com/">
                    <i className="fab fa-linkedin-in" />
                  </Link>
                  <Link to="https://www.instagram.com/">
                    <i className="fab fa-instagram" />
                  </Link>
                  <Link to="https://facebook.com/">
                    <i className="fab fa-facebook-f" />
                  </Link>
                  <Link to="https://twitter.com/">
                    <i className="fab fa-twitter" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="team-card">
              <div className="team-card_content">
                <h4 className="team-card_title">
                  <Link to="/team-details">Devon Lane</Link>
                </h4>
                <span className="team-card_desig">Marketing Coordinator</span>
              </div>
              <div className="team-card_text">
                <p>
                  A car repair is a service provided to fix any issues or
                  damages with your man
                </p>
              </div>
              <div className="team-card_img">
                <img src="assets/img/team/team-1-3.png" alt="Fixturbo" />
              </div>
              <div className="team-social_wrap">
                <div className="social-btn style2">
                  <Link to="https://linkedin.com/">
                    <i className="fab fa-linkedin-in" />
                  </Link>
                  <Link to="https://www.instagram.com/">
                    <i className="fab fa-instagram" />
                  </Link>
                  <Link to="https://facebook.com/">
                    <i className="fab fa-facebook-f" />
                  </Link>
                  <Link to="https://twitter.com/">
                    <i className="fab fa-twitter" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAreaOne;
