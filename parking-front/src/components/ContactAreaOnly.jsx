import React from "react";
import useFormValidation from "../hooks/useFormValidation";
import { contactSchema } from "../utils/validationSchemas";

const ContactAreaOnly = () => {
  const contactForm = useFormValidation(contactSchema, {
    name: '',
    email: '',
    number: '',
    subject: 'Choose',
    message: ''
  });

  const handleContactSubmit = async (data) => {
    // Simulate form submission
    console.log('Contact form submitted:', data);
    // In a real app, you would send this data to your backend
  };

  return (
    <React.Fragment>
      <div className="contact-area space">
        <div className="container">
          <div className="row gy-4 justify-content-center">
            <div className="col-xxl-3 col-lg-4 col-md-6">
              <div className="contact-info">
                <div className="contact-info_icon">
                  <i className="fas fa-map-marker-alt" />
                </div>
                <h6 className="contact-info_title">Address</h6>
                <p className="contact-info_text">
                  6275 W Plano Pkwy Suite 500B
                </p>
                <p className="contact-info_text">Plano, TX 75093, US</p>
              </div>
            </div>
            <div className="col-xxl-3 col-lg-4 col-md-6">
              <div className="contact-info">
                <div className="contact-info_icon">
                  <i className="fas fa-phone-alt" />
                </div>
                <h6 className="contact-info_title">Phone Number</h6>
                <p className="contact-info_text">
                  <a href="tel:+14696995511">+1 (469) 699-5511</a>
                </p>
                <p className="contact-info_text">
                  <a href="tel:+18005551234">+1 (800) 555-1234</a>
                </p>
              </div>
            </div>
            <div className="col-xxl-3 col-lg-4 col-md-6">
              <div className="contact-info">
                <div className="contact-info_icon">
                  <i className="fas fa-clock" />
                </div>
                <h6 className="contact-info_title">Opening</h6>
                <p className="contact-info_text">Mon-Fri: 8AM To 6PM</p>
                <p className="contact-info_text">Sat-Sun: 9AM To 5PM</p>
              </div>
            </div>
            <div className="col-xxl-3 col-lg-4 col-md-6">
              <div className="contact-info">
                <div className="contact-info_icon">
                  <i className="fas fa-envelope" />
                </div>
                <h6 className="contact-info_title">E-mail</h6>
                <p className="contact-info_text">
                  <a href="mailto:info@parkingmanagement.com">
                    info@parkingmanagement.com
                  </a>
                </p>
                <p className="contact-info_text">
                  <a href="mailto:support@parkingmanagement.com">support@parkingmanagement.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-bottom">
        <div className="container">
          <div className="map-sec">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3644.7310056272386!2d89.2286059153658!3d24.00527418490799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fe9b97badc6151%3A0x30b048c9fb2129bc!2s!5e0!3m2!1sen!2sbd!4v1651028958211!5m2!1sen!2sbd"
              allowFullScreen=""
              loading="lazy"
              title="address"
            />
          </div>
        </div>
      </div>
      
      <div className="space-bottom">
        <div className="container">
          <div className="row flex-row-reverse">
            <div className="col-lg-6 text-lg-end">
              <div className="faq-thumb2 mb-xl-0 mb-50">
                <div className="about-counter-grid jump">
                  <img
                    src="assets/img/icon/faq2-counter-icon-1.svg"
                    alt="Contact Information"
                  />
                  <div className="media-right">
                    <h3 className="about-counter">
                      <span className="counter-number">500</span>+
                    </h3>
                    <h4 className="about-counter-text">Parking Spaces Managed</h4>
                  </div>
                </div>
                <img src="assets/img/normal/23th.png" alt="Contact Us" />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="contact-form-wrap p-0">
                <div className="title-area">
                  <span className="sub-title">Contact form</span>
                  <h2 className="sec-title">Parking Management Solutions</h2>
                </div>
                <form
                  onSubmit={contactForm.handleSubmit(handleContactSubmit)}
                  className="appointment-form ajax-contact"
                >
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="text"
                          className={`form-control ${contactForm.hasFieldError('name') ? 'is-invalid' : ''}`}
                          placeholder="Your Name"
                          {...contactForm.register('name')}
                        />
                        {contactForm.getFieldError('name') && (
                          <div className="invalid-feedback">
                            {contactForm.getFieldError('name')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="email"
                          className={`form-control ${contactForm.hasFieldError('email') ? 'is-invalid' : ''}`}
                          placeholder="Email Address"
                          {...contactForm.register('email')}
                        />
                        {contactForm.getFieldError('email') && (
                          <div className="invalid-feedback">
                            {contactForm.getFieldError('email')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="tel"
                          className={`form-control ${contactForm.hasFieldError('number') ? 'is-invalid' : ''}`}
                          placeholder="Phone Number"
                          {...contactForm.register('number')}
                        />
                        {contactForm.getFieldError('number') && (
                          <div className="invalid-feedback">
                            {contactForm.getFieldError('number')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <select
                          className={`form-select ${contactForm.hasFieldError('subject') ? 'is-invalid' : ''}`}
                          {...contactForm.register('subject')}
                        >
                          <option value="Choose">Choose a Option</option>
                          <option value="General">General Inquiry</option>
                          <option value="Technical">Technical Support</option>
                          <option value="Billing">Billing Question</option>
                          <option value="Subscription">Subscription Help</option>
                        </select>
                        {contactForm.getFieldError('subject') && (
                          <div className="invalid-feedback">
                            {contactForm.getFieldError('subject')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="form-group col-12">
                    <textarea
                      placeholder="Message here.."
                      className={`form-control ${contactForm.hasFieldError('message') ? 'is-invalid' : ''}`}
                      rows="5"
                      {...contactForm.register('message')}
                    />
                    {contactForm.getFieldError('message') && (
                      <div className="invalid-feedback">
                        {contactForm.getFieldError('message')}
                      </div>
                    )}
                  </div>
                  <div className="form-btn col-12">
                    <button 
                      type="submit"
                      className="btn style2"
                      disabled={contactForm.isSubmitting}
                    >
                      {contactForm.isSubmitting ? 'Sending...' : 'Send Message'} 
                      <i className="fas fa-arrow-right ms-2" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ContactAreaOnly;