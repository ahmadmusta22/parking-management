import React from "react";
import { Link } from "react-router-dom";
import useFormValidation from "../hooks/useFormValidation";
import { newsletterSchema } from "../utils/validationSchemas";

const FooterAreaOne = () => {
  const newsletterForm = useFormValidation(newsletterSchema, {
    email: ''
  });

  const handleNewsletterSubmit = async (data) => {
    // Simulate newsletter subscription
    // In a real app, you would send this data to your backend
  };

  return (
    <footer
      className="footer-wrapper footer-layout1"
      style={{ backgroundImage: "url(assets/img/bg/10th.png)" }}
    >
      <div className="container">
        <div className="widget-area">
          <div className="row justify-content-between">
            <div className="col-md-6 col-xl-auto">
              <div className="widget widget_nav_menu footer-widget">
                <h3 className="widget_title">Company</h3>
                <div className="menu-all-pages-container">
                  <ul className="menu">
                    <li>
                      <Link to="/">About</Link>
                    </li>
                    <li>
                      <Link to="/">Team</Link>
                    </li>
                    <li>
                      <Link to="/">Faq</Link>
                    </li>
                    <li>
                      <Link to="/">Privacy Policy</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-auto">
              <div className="widget widget_nav_menu footer-widget">
                <h3 className="widget_title">Services</h3>
                <div className="menu-all-pages-container">
                  <ul className="menu">
                    <li>
                      <Link to="/gate/gate_1">Visitor Parking</Link>
                    </li>
                    <li>
                      <Link to="/gate/gate_5">VIP Parking</Link>
                    </li>
                    <li>
                      <Link to="/checkpoint">Employee Access</Link>
                    </li>
                    <li>
                      <Link to="/login">Monthly Subscription</Link>
                    </li>
                    <li>
                      <Link to="/">System Support</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-auto">
              <div className="widget footer-widget">
                <h3 className="widget_title">Contact</h3>
                <div className="widget-contact">
                  <p>
                    <Link to="tel:+14696995511">+1 (469) 699-5511</Link>
                  </p>
                  <p>
                    <Link to="mailto:info@welinkcargo.com">info@welinkcargo.com</Link>
                  </p>
                  <p>
                    6275 W Plano Pkwy Suite 500B <br /> Plano, TX 75093, US
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-auto">
              <div className="widget footer-widget widget-newsletter">
                <h3 className="widget_title">Get In Touch</h3>
                <p className="footer-text mb-50">
                  Stay updated with the latest parking solutions and system updates from WeLink CARGO.
                </p>
                <form className="newsletter-form" onSubmit={newsletterForm.handleSubmit(handleNewsletterSubmit)}>
                  <div className="form-group">
                    <input
                      className={`form-control ${newsletterForm.hasFieldError('email') ? 'is-invalid' : ''}`}
                      type="email"
                      placeholder="Your Email Address"
                      {...newsletterForm.register('email')}
                    />
                    {newsletterForm.getFieldError('email') && (
                      <div className="invalid-feedback">
                        {newsletterForm.getFieldError('email')}
                      </div>
                    )}
                  </div>
                  <button 
                    type="submit" 
                    className="btn"
                    disabled={newsletterForm.isSubmitting}
                  >
                    <i className="fas fa-arrow-right" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright-wrap">
        <div className="container">
          <div className="row gy-3 justify-content-md-between justify-content-center">
            <div className="col-auto align-self-center">
              <p className="copyright-text text-center">
                © <Link to="#">WeLink CARGO</Link> 2024 | All Rights Reserved
              </p>
            </div>
            <div className="col-auto">
              <div className="footer-links">
                <Link to="/">Terms &amp; Conditions</Link>
                <Link to="/">Privacy Policy</Link>
                <Link to="/">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterAreaOne;
