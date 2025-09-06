import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const HeaderOne = () => {
  const [active, setActive] = useState(false);
  const [scroll, setScroll] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    var offCanvasNav = document.getElementById("offcanvas-navigation");
    var offCanvasNavSubMenu = offCanvasNav.querySelectorAll(".sub-menu");

    for (let i = 0; i < offCanvasNavSubMenu.length; i++) {
      offCanvasNavSubMenu[i].insertAdjacentHTML(
        "beforebegin",
        "<span class='mean-expand-class'>+</span>"
      );
    }

    var menuExpand = offCanvasNav.querySelectorAll(".mean-expand-class");
    var numMenuExpand = menuExpand.length;

    function sideMenuExpand() {
      if (this.parentElement.classList.contains("active") === true) {
        this.parentElement.classList.remove("active");
      } else {
        for (let i = 0; i < numMenuExpand; i++) {
          menuExpand[i].parentElement.classList.remove("active");
        }
        this.parentElement.classList.add("active");
      }
    }

    for (let i = 0; i < numMenuExpand; i++) {
      menuExpand[i].addEventListener("click", sideMenuExpand);
    }
    window.onscroll = () => {
      if (window.pageYOffset < 150) {
        setScroll(false);
      } else if (window.pageYOffset > 150) {
        setScroll(true);
      }
      return () => (window.onscroll = null);
    };
  }, []);

  const mobileMenu = () => {
    setActive(!active);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <>
      <header className="nav-header header-layout1">
        <div className={`sticky-wrapper ${scroll && "sticky"}`}>
          {/* Main Menu Area */}
          <div className="menu-area">
            <div className="header-navbar-logo">
              <Link to="/">
                <img src="/assets/img/logo-white.svg" alt="WeLink CARGO" />
              </Link>
            </div>
            <div className="container">
              <div className="row align-items-center justify-content-lg-start justify-content-between">
                <div className="col-auto d-xl-none d-block">
                  <div className="header-logo">
                    <Link to="/">
                      <img src="/assets/img/logo-white.svg" alt="WeLink CARGO" />
                    </Link>
                  </div>
                </div>
                <div className="col-auto">
                  <nav className="main-menu d-none d-lg-inline-block">
                    <ul>
                      <li>
                        <NavLink
                          to="/"
                          className={(navData) =>
                            navData.isActive ? "active" : ""
                          }
                        >
                          Home
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/about"
                          className={(navData) =>
                            navData.isActive ? "active" : ""
                          }
                        >
                          About Us
                        </NavLink>
                      </li>
                      <li className="menu-item-has-children">
                        <Link to="#">Parking System</Link>
                        <ul className="sub-menu">
                          <li>
                            <NavLink
                              to="/gate/gate_1"
                              className={(navData) =>
                                navData.isActive ? "active" : ""
                              }
                            >
                              <i className="fas fa-door-open me-2"></i>
                              Gate 1 - Main Entrance
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/gate/gate_2"
                              className={(navData) =>
                                navData.isActive ? "active" : ""
                              }
                            >
                              <i className="fas fa-door-open me-2"></i>
                              Gate 2 - East Entrance
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/gate/gate_3"
                              className={(navData) =>
                                navData.isActive ? "active" : ""
                              }
                            >
                              <i className="fas fa-door-open me-2"></i>
                              Gate 3 - South Entrance
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/gate/gate_4"
                              className={(navData) =>
                                navData.isActive ? "active" : ""
                              }
                            >
                              <i className="fas fa-door-open me-2"></i>
                              Gate 4 - West Entrance
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/gate/gate_5"
                              className={(navData) =>
                                navData.isActive ? "active" : ""
                              }
                            >
                              <i className="fas fa-crown me-2"></i>
                              Gate 5 - VIP Entrance
                            </NavLink>
                          </li>
                          <li className="divider"></li>
                          <li>
                            <NavLink
                              to="/checkpoint"
                              className={(navData) =>
                                navData.isActive ? "active" : ""
                              }
                            >
                              <i className="fas fa-clipboard-check me-2"></i>
                              Checkpoint (Employee)
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/login"
                              className={(navData) =>
                                navData.isActive ? "active" : ""
                              }
                            >
                              <i className="fas fa-sign-in-alt me-2"></i>
                              Employee Login
                            </NavLink>
                          </li>
                          <li className="divider"></li>
                          <li>
                            <NavLink
                              to="/login"
                              className={(navData) =>
                                navData.isActive ? "active" : ""
                              }
                            >
                              <i className="fas fa-shield-alt me-2"></i>
                              Admin Access
                            </NavLink>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <NavLink
                          to="/contact"
                          className={(navData) =>
                            navData.isActive ? "active" : ""
                          }
                        >
                          Contact
                        </NavLink>
                      </li>
                    </ul>
                  </nav>
                  <div className="navbar-right d-inline-flex d-lg-none">
                    <button
                      type="button"
                      className="menu-toggle icon-btn"
                      onClick={mobileMenu}
                    >
                      <i className="fas fa-bars" />
                    </button>
                  </div>
                </div>
                <div className="col-auto ms-auto d-xl-block d-none">
                  <div className="navbar-right-content">
                    {isAuthenticated ? (
                      <div className="user-info">
                        <div className="user-details">
                          <span className="user-name">
                            <i className="fas fa-user me-1"></i>
                            {user?.username || 'User'}
                          </span>
                          <span className="user-role">
                            {user?.role === 'admin' ? 'Admin' : user?.role === 'employee' ? 'Employee' : 'User'}
                          </span>
                        </div>
                        <button 
                          className="logout-btn"
                          onClick={handleLogout}
                          title="Logout"
                        >
                          <i className="fas fa-sign-out-alt"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="navbar-right-desc">
                        <img src="/assets/img/icon/chat.svg" alt="Chat Support" />
                        <div className="navbar-right-desc-details">
                          <h6 className="title">Parking Support?</h6>
                          <Link className="link" to="tel:+1234567890">
                            (123) 456-7890
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="logo-bg" />
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu-wrapper  ${active && "body-visible"}`}>
          <div className="mobile-menu-area">
            <div className="mobile-logo">
              <Link to="/">
                <img src="/assets/img/logo.svg" alt="WeLink CARGO" />
              </Link>
              <button className="menu-toggle" onClick={mobileMenu}>
                <i className="fa fa-times" />
              </button>
            </div>
            <div className="mobile-menu">
              <ul id="offcanvas-navigation">
                <li>
                  <NavLink
                    to="/"
                    className={(navData) => (navData.isActive ? "active" : "")}
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/about"
                    className={(navData) => (navData.isActive ? "active" : "")}
                  >
                    About Us
                  </NavLink>
                </li>
                <li className="menu-item-has-children submenu-item-has-children">
                  <Link to="#">Parking System</Link>
                  <ul className="sub-menu submenu-class">
                    <li>
                      <NavLink
                        to="/gate/gate_1"
                        className={(navData) =>
                          navData.isActive ? "active" : ""
                        }
                      >
                        Gate 1 - Main Entrance
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/gate/gate_2"
                        className={(navData) =>
                          navData.isActive ? "active" : ""
                        }
                      >
                        Gate 2 - East Entrance
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/gate/gate_3"
                        className={(navData) =>
                          navData.isActive ? "active" : ""
                        }
                      >
                        Gate 3 - South Entrance
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/gate/gate_4"
                        className={(navData) =>
                          navData.isActive ? "active" : ""
                        }
                      >
                        Gate 4 - West Entrance
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/gate/gate_5"
                        className={(navData) =>
                          navData.isActive ? "active" : ""
                        }
                      >
                        Gate 5 - VIP Entrance
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/checkpoint"
                        className={(navData) =>
                          navData.isActive ? "active" : ""
                        }
                      >
                        Checkpoint (Employee)
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/login"
                        className={(navData) =>
                          navData.isActive ? "active" : ""
                        }
                      >
                        Employee Login
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/login"
                        className={(navData) =>
                          navData.isActive ? "active" : ""
                        }
                      >
                        Admin Access
                      </NavLink>
                    </li>
                  </ul>
                </li>
                <li>
                  <NavLink
                    to="/contact"
                    className={(navData) => (navData.isActive ? "active" : "")}
                  >
                    Contact
                  </NavLink>
                </li>
                {isAuthenticated && (
                  <li className="mobile-logout-section">
                    <div className="mobile-user-info">
                      <div className="user-details">
                        <span className="user-name">
                          <i className="fas fa-user me-2"></i>
                          {user?.username || 'User'}
                        </span>
                        <span className="user-role">
                          {user?.role === 'admin' ? 'Admin' : user?.role === 'employee' ? 'Employee' : 'User'}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="mobile-logout-btn"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderOne;

