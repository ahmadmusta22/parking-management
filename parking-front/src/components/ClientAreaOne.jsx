import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import useFormValidation from "../hooks/useFormValidation";
import { appointmentSchema } from "../utils/validationSchemas";

const ClientAreaOne = () => {
  const appointmentForm = useFormValidation(appointmentSchema, {
    name: '',
    email: '',
    number: '',
    subject: 'Choose',
    message: ''
  });

  const handleAppointmentSubmit = async (data) => {
    // Simulate appointment booking
    // In a real app, you would send this data to your backend
  };

  return (
    <div
      className="client-bg-area"
      style={{ backgroundImage: "url(assets/img/bg/client-bg1-1.png)" }}
    >
      <div className="client-area-1 text-center">
        <div className="container">
          <div className="row global-carousel">
            <Swiper
              spaceBetween={20}
              slidesPerGroup={2}
              speed={1000}
              autoplay={{ delay: 6000 }}
              className="mySwiper"
              breakpoints={{
                0: {
                  slidesPerView: 2,
                },
                500: {
                  slidesPerView: 2,
                },
                768: {
                  slidesPerView: 3,
                },
                992: {
                  slidesPerView: 4,
                },
                1200: {
                  slidesPerView: 5,
                },
                1400: {
                  slidesPerView: 5,
                },
              }}
            >
              <SwiperSlide>
                <div className="col-lg-auto">
                  <div className="client-logo">
                    <Link to="/">
                      <img src="assets/img/client/1-1.png" alt="Fixturbo" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="col-lg-auto">
                  <div className="client-logo">
                    <Link to="/">
                      <img src="assets/img/client/1-2.png" alt="Fixturbo" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="col-lg-auto">
                  <div className="client-logo">
                    <Link to="/">
                      <img src="assets/img/client/1-3.png" alt="Fixturbo" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="col-lg-auto">
                  <div className="client-logo">
                    <Link to="/">
                      <img src="assets/img/client/1-4.png" alt="Fixturbo" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="col-lg-auto">
                  <div className="client-logo">
                    <Link to="/">
                      <img src="assets/img/client/1-5.png" alt="Fixturbo" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="col-lg-auto">
                  <div className="client-logo">
                    <Link to="/">
                      <img src="assets/img/client/1-1.png" alt="Fixturbo" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="col-lg-auto">
                  <div className="client-logo">
                    <Link to="/">
                      <img src="assets/img/client/1-2.png" alt="Fixturbo" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="col-lg-auto">
                  <div className="client-logo">
                    <Link to="/">
                      <img src="assets/img/client/1-3.png" alt="Fixturbo" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="col-lg-auto">
                  <div className="client-logo">
                    <Link to="/">
                      <img src="assets/img/client/1-4.png" alt="Fixturbo" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="col-lg-auto">
                  <div className="client-logo">
                    <Link to="/">
                      <img src="assets/img/client/1-5.png" alt="Fixturbo" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
      {/*==============================
    Appointment Area  
    ==============================*/}
      <div className="appointment-area-1 overflow-hidden">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <div className="appointment-form-wrap bg-theme">
                <div className="title-area">
                  <span className="sub-title text-white">Send a request</span>
                  <h2 className="sec-title text-white">
                    Our One-Stop Car Repair Shop
                  </h2>
                </div>
                <form
                  onSubmit={appointmentForm.handleSubmit(handleAppointmentSubmit)}
                  className="appointment-form ajax-contact"
                >
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="text"
                          className={`form-control style-border2 ${appointmentForm.hasFieldError('name') ? 'is-invalid' : ''}`}
                          placeholder="Your Name"
                          {...appointmentForm.register('name')}
                        />
                        {appointmentForm.getFieldError('name') && (
                          <div className="invalid-feedback">
                            {appointmentForm.getFieldError('name')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="email"
                          className={`form-control style-border2 ${appointmentForm.hasFieldError('email') ? 'is-invalid' : ''}`}
                          placeholder="Email Address"
                          {...appointmentForm.register('email')}
                        />
                        {appointmentForm.getFieldError('email') && (
                          <div className="invalid-feedback">
                            {appointmentForm.getFieldError('email')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="tel"
                          className={`form-control style-border2 ${appointmentForm.hasFieldError('number') ? 'is-invalid' : ''}`}
                          placeholder="Phone Number"
                          {...appointmentForm.register('number')}
                        />
                        {appointmentForm.getFieldError('number') && (
                          <div className="invalid-feedback">
                            {appointmentForm.getFieldError('number')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <select
                          className={`form-select style-border2 ${appointmentForm.hasFieldError('subject') ? 'is-invalid' : ''}`}
                          {...appointmentForm.register('subject')}
                        >
                          <option value="Choose">Choose a Option</option>
                          <option value="General">General Inquiry</option>
                          <option value="Technical">Technical Support</option>
                          <option value="Billing">Billing Question</option>
                          <option value="Subscription">Subscription Help</option>
                        </select>
                        <i className="fas fa-angle-down text-white" />
                        {appointmentForm.getFieldError('subject') && (
                          <div className="invalid-feedback">
                            {appointmentForm.getFieldError('subject')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="form-group col-12">
                    <textarea
                      placeholder="Message here.."
                      className={`form-control style-border2 ${appointmentForm.hasFieldError('message') ? 'is-invalid' : ''}`}
                      rows="5"
                      {...appointmentForm.register('message')}
                    />
                    {appointmentForm.getFieldError('message') && (
                      <div className="invalid-feedback">
                        {appointmentForm.getFieldError('message')}
                      </div>
                    )}
                  </div>
                  <div className="form-btn col-12">
                    <button 
                      type="submit"
                      className="btn style3"
                      disabled={appointmentForm.isSubmitting}
                    >
                      {appointmentForm.isSubmitting ? 'Booking...' : 'Appointment Now'} 
                      <i className="fas fa-arrow-right ms-2" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="appointment-thumb-1">
          <img
            src="assets/img/normal/appointment-thumb-1-1.png"
            alt="Fixturbo"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientAreaOne;
