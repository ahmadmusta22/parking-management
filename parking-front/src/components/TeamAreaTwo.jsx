import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Thumbs, EffectFade } from "swiper";
import { Link } from "react-router-dom";

const TeamAreaTwo = () => {
  return (
    <div className="team-area-2 space">
      <div className="container">
        <div className="row gx-30 justify-content-between align-items-center">
          <div className="col-lg-4">
            <div className="title-area mb-lg-0">
              <span className="sub-title">Our Team</span>
              <h2 className="sec-title">Parking Management Experts</h2>
              <p className="sec-text mb-lg-5 mb-4">
                Our dedicated team of parking management professionals brings
                years of experience in smart parking solutions, system integration,
                and customer service excellence.
              </p>
              <div className="icon-box">
                <button
                  data-slick-prev=".team-slider2"
                  className="team-slider2 slick-arrow style2 default team-slider2-prev"
                >
                  <i className="fas fa-arrow-left" />
                </button>
                <button
                  data-slick-next=".team-slider2"
                  className="slick-arrow style2 default team-slider2-next"
                >
                  <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="row gx-30 global-carousel team-slider2">
              <Swiper
                loop={true}
                navigation={{
                  nextEl: ".team-slider2-next",
                  prevEl: ".team-slider2-prev",
                }}
                spaceBetween={20}
                slidesPerView={2}
                slidesPerGroup={1}
                speed={1000}
                pagination={{ clickable: true }}
                autoplay={{ delay: 6000 }}
                className="mySwiper"
                modules={[FreeMode, Navigation, Thumbs, EffectFade]}
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                  },
                  768: {
                    slidesPerView: 1,
                  },
                  992: {
                    slidesPerView: 2,
                  },
                  1200: {
                    slidesPerView: 2,
                  },
                  1400: {
                    slidesPerView: 2,
                  },
                }}
              >
                <SwiperSlide>
                  <div className="team-card style2">
                    <div className="team-card_img">
                      <img src="assets/img/team/21th.jpg" alt="Fixturbo" />
                    </div>
                    <div className="team-card_content">
                      <h4 className="team-card_title">
                        <Link to="/team-details">Ahmad Mustafa</Link>
                      </h4>
                      <span className="team-card_desig">
                        System Administrator
                      </span>
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
                </SwiperSlide>
                <SwiperSlide>
                  <div className="team-card style2">
                    <div className="team-card_img">
                      <img src="assets/img/team/21th.jpg" alt="Fixturbo" />
                    </div>
                    <div className="team-card_content">
                      <h4 className="team-card_title">
                        <Link to="/team-details">David Johnson</Link>
                      </h4>
                      <span className="team-card_desig">Parking Operations Manager</span>
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
                </SwiperSlide>
                <SwiperSlide>
                  <div className="team-card style2">
                    <div className="team-card_img">
                      <img src="assets/img/team/21th.jpg" alt="Fixturbo" />
                    </div>
                    <div className="team-card_content">
                      <h4 className="team-card_title">
                        <Link to="/team-details">Michael Chen</Link>
                      </h4>
                      <span className="team-card_desig">
                        Technical Support Specialist
                      </span>
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
                </SwiperSlide>
                <SwiperSlide>
                  <div className="team-card style2">
                    <div className="team-card_img">
                      <img src="assets/img/team/21th.jpg" alt="Fixturbo" />
                    </div>
                    <div className="team-card_content">
                      <h4 className="team-card_title">
                        <Link to="/team-details">Carlos Rodriguez</Link>
                      </h4>
                      <span className="team-card_desig">Customer Experience Manager</span>
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
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAreaTwo;
