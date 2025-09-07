import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import HeaderOne from '../components/HeaderOne';
import FooterAreaOne from '../components/FooterAreaOne';
import Preloader from '../helper/Preloader';
import useToast from '../hooks/useToast';
import useFormValidation from '../hooks/useFormValidation';
import { loginSchema, registrationSchema } from '../utils/validationSchemas';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, error, clearError } = useAuthStore();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [preloaderActive, setPreloaderActive] = useState(true);

  // Form validation hooks
  const loginForm = useFormValidation(loginSchema, {
    username: '',
    password: ''
  });

  const registrationForm = useFormValidation(registrationSchema, {
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    role: 'employee'
  });

  // Preloader effect
  useEffect(() => {
    setTimeout(() => {
      setPreloaderActive(false);
    }, 2000);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLoginSubmit = async (data) => {
    setLoading(true);
    clearError();

    const result = await login(data);
    
    if (result.success) {
      // Redirect based on user role
      const from = location.state?.from?.pathname || '/';
      const loggedInUser = result.user || user;
      
      if (loggedInUser?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (loggedInUser?.role === 'employee') {
        navigate('/checkpoint', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
    
    setLoading(false);
  };

  const handleRegistrationSubmit = async (data) => {
    // For demo purposes, we'll simulate account creation
    // In a real app, this would call a registration API
    const newUser = {
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      id: Date.now().toString() // Generate a simple ID
    };
    
    // Store the new user in localStorage (simulating backend)
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    // Auto-login the new user
    const loginCredentials = {
      username: data.username,
      password: data.password
    };
    
    // Store credentials for demo login
    const userCredentials = JSON.parse(localStorage.getItem('userCredentials') || '{}');
    userCredentials[data.username] = data.password;
    localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
    
    // Attempt to login with new credentials
    const result = await login(loginCredentials);
    
    if (result.success) {
      showSuccess('Account created successfully! You are now logged in.');
      navigate('/');
    } else {
      showError('Account created but login failed. Please try logging in manually.');
    }
  };

  // Show preloader
  if (preloaderActive) {
    return <Preloader />;
  }

  return (
    <>
      {/* Main Website Header */}
      <HeaderOne />
      
      <div className="login-page space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="login-card">
                <div className="login-header">
                  <div className="login-logo">
                    <div className="logo-icon">
                      <i className="fas fa-parking"></i>
                    </div>
                    <h2>Parking System</h2>
                  </div>
                  <p className="login-subtitle">Sign in to your account</p>
                </div>

                <div className="login-form">
                  <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                    <div className="form-group">
                      <label htmlFor="username" className="form-label">
                        Username
                      </label>
                      <input
                        type="text"
                        className={`form-control ${loginForm.hasFieldError('username') ? 'is-invalid' : ''}`}
                        id="username"
                        autoComplete="username"
                        placeholder="Enter your username"
                        {...loginForm.register('username')}
                      />
                      {loginForm.getFieldError('username') && (
                        <div className="invalid-feedback">
                          {loginForm.getFieldError('username')}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        type="password"
                        className={`form-control ${loginForm.hasFieldError('password') ? 'is-invalid' : ''}`}
                        id="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        {...loginForm.register('password')}
                      />
                      {loginForm.getFieldError('password') && (
                        <div className="invalid-feedback">
                          {loginForm.getFieldError('password')}
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="error-alert">
                        <div className="alert-icon">
                          <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <div className="alert-content">
                          {error}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn style2 btn-lg w-100"
                      disabled={loading || loginForm.isSubmitting}
                    >
                      {loading || loginForm.isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="demo-accounts-section">
                  <div className="demo-header">
                    <span className="demo-label">Demo Accounts</span>
                  </div>
                  <div className="demo-buttons">
                    <button
                      type="button"
                      className="demo-btn admin"
                      onClick={() => {
                        loginForm.setValue('username', 'admin');
                        loginForm.setValue('password', 'adminpass');
                      }}
                    >
                      <i className="fas fa-shield-alt me-2"></i>
                      Admin
                    </button>
                    <button
                      type="button"
                      className="demo-btn employee"
                      onClick={() => {
                        loginForm.setValue('username', 'emp1');
                        loginForm.setValue('password', 'pass1');
                      }}
                    >
                      <i className="fas fa-user-tie me-2"></i>
                      Employee
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="gate-access-section">
              <div className="gate-buttons">
                <Link to="/gate/gate_1" className="gate-btn">
                  <i className="fas fa-door-open me-2"></i>
                  Gate 1
                </Link>
                <Link to="/gate/gate_2" className="gate-btn">
                  <i className="fas fa-door-open me-2"></i>
                  Gate 2
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Website Footer */}
      <FooterAreaOne />
    </>
  );
};

export default LoginPage;
