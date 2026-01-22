'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import './LoginPage.css';

// Create a separate component that uses useSearchParams
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const isRegistered = searchParams.get('registered') === 'true';
  const registeredEmail = searchParams.get('email');
  
  const [activeTab, setActiveTab] = useState('login');
  
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: registeredEmail || '',
    password: '',
    rememberMe: false
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    organizationName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false,
    confirm: false
  });
  const [message, setMessage] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Check for existing session on mount
  useEffect(() => {

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            router.push(redirect);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };
    
    checkSession();
    
    // Show success message if just registered
    if (isRegistered && registeredEmail) {
      setMessage({
        type: 'success',
        text: `Registration successful! Please login with ${registeredEmail}`
      });
      setActiveTab('login');
    }
  }, [router, redirect, isRegistered, registeredEmail]);





  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage(null);
    setErrors({});
    if (tab === 'login') {
      // Copy email from register form if available
      if (registerData.email && !loginData.email) {
        setLoginData(prev => ({ ...prev, email: registerData.email }));
      }
    }
  };

  // Handle login form input changes
  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle register form input changes
  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setRegisterData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Check password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
    
    // Clear confirm password error if passwords match
    if ((name === 'password' || name === 'confirmPassword') && 
        registerData.password && registerData.confirmPassword) {
      if (name === 'password' && value === registerData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: null }));
      } else if (name === 'confirmPassword' && value === registerData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: null }));
      }
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    setPasswordStrength(Math.min(strength, 100));
  };

  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'weak';
    if (passwordStrength < 70) return 'medium';
    return 'strong';
  };

  // Get password strength text
  const getStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  // Validate login form
  const validateLoginForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate register form
  const validateRegisterForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!registerData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (registerData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!registerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Organization validation
    if (!registerData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }
    
    // Phone validation (optional but validate format if provided)
    if (registerData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(registerData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Password validation
    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and numbers';
    }
    
    // Confirm password validation
    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms acceptance
    if (!registerData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (cooldown) {
      setMessage({
        type: 'error',
        text: 'Too many attempts. Please wait before trying again.'
      });
      return;
    }
    
    if (!validateLoginForm()) {
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email.trim(),
          password: loginData.password,
          rememberMe: loginData.rememberMe
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Successful login
        setMessage({
          type: 'success',
          text: 'Login successful! Redirecting...'
        });
        
        // Reset attempts
        setLoginAttempts(0);
        
        // Redirect after success
        setTimeout(() => {
          router.replace(redirect);
        }, 1000);
        
      } else {
        // Failed login
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          // Activate cooldown after 5 failed attempts
          setCooldown(true);
          setTimeout(() => {
            setCooldown(false);
            setLoginAttempts(0);
          }, 300000); // 5 minutes cooldown
          
          setMessage({
            type: 'error',
            text: 'Too many failed attempts. Please wait 5 minutes before trying again.'
          });
        } else {
          setMessage({
            type: 'error',
            text: data.error || 'Invalid email or password'
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) {
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.name.trim(),
          email: registerData.email.trim().toLowerCase(),
          organizationName: registerData.organizationName.trim(),
          phone: registerData.phone.trim() || null,
          password: registerData.password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Successful registration
        setMessage({
          type: 'success',
          text: data.message || 'Registration successful! You can now login.'
        });
        
        // Switch to login tab
        setTimeout(() => {
          setActiveTab('login');
          // Pre-fill login email
          setLoginData(prev => ({ 
            ...prev, 
            email: registerData.email 
          }));
        }, 2000);
        
      } else {
        // Registration failed
        setMessage({
          type: 'error',
          text: data.error || 'Registration failed. Please try again.'
        });
        
        // If there are field-specific errors from the API
        if (data.errors) {
          setErrors(data.errors);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    const email = activeTab === 'login' ? loginData.email : registerData.email;
    
    if (!email) {
      setErrors({ email: 'Please enter your email address' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      
      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Password reset instructions sent to your email!'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to send reset instructions. Please try again.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo/Brand */}
        <div className="login-header">
          <Link href="/" className="login-logo">
            <div className="logo-icon">D</div>
            <span className="logo-text">DonorConnect</span>
          </Link>
          <h1 className="login-title">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="login-subtitle">
            {activeTab === 'login' 
              ? 'Sign in to your account to continue' 
              : 'Join DonorConnect and start managing your nonprofit fundraising'
            }
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
          >
            Create Account
          </button>
        </div>

        {/* Auth Form */}
        <form 
          onSubmit={activeTab === 'login' ? handleLoginSubmit : handleRegisterSubmit} 
          className="login-form"
        >
          {message && (
            <div className={`message ${message.type}`}>
              {message.type === 'success' ? (
                <CheckCircleIcon className="message-icon" />
              ) : (
                <ExclamationCircleIcon className="message-icon" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <>
              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <EnvelopeIcon className="input-icon" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="you@example.com"
                    disabled={loading || cooldown}
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              {/* Password Input */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="login-password" className="form-label">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="forgot-password"
                    disabled={loading || cooldown}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-wrapper">
                  <LockClosedIcon className="input-icon" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword.login ? "text" : "password"}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="••••••••"
                    disabled={loading || cooldown}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('login')}
                    className="password-toggle"
                    disabled={loading || cooldown}
                  >
                    {showPassword.login ? (
                      <EyeSlashIcon className="toggle-icon" />
                    ) : (
                      <EyeIcon className="toggle-icon" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              {/* Remember Me */}
              <div className="remember-me">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={loginData.rememberMe}
                  onChange={handleLoginChange}
                  disabled={loading || cooldown}
                  className="checkbox"
                />
                <label htmlFor="rememberMe" className="checkbox-label">
                  Remember me for 30 days
                </label>
              </div>
            </>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <>
              {/* Name Input */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name *
                </label>
                <div className="input-wrapper">
                  <UserIcon className="input-icon" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="John Smith"
                    disabled={loading}
                    autoComplete="name"
                    required
                  />
                </div>
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="register-email" className="form-label">
                  Email Address *
                </label>
                <div className="input-wrapper">
                  <EnvelopeIcon className="input-icon" />
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="you@yournonprofit.org"
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              {/* Organization Input */}
              <div className="form-group">
                <label htmlFor="organizationName" className="form-label">
                  Organization Name *
                </label>
                <div className="input-wrapper">
                  <BuildingOfficeIcon className="input-icon" />
                  <input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    value={registerData.organizationName}
                    onChange={handleRegisterChange}
                    className={`form-input ${errors.organizationName ? 'error' : ''}`}
                    placeholder="Your Nonprofit Name"
                    disabled={loading}
                    autoComplete="organization"
                    required
                  />
                </div>
                {errors.organizationName && (
                  <span className="error-message">{errors.organizationName}</span>
                )}
              </div>

              {/* Phone Input (Optional) */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <div className="input-wrapper">
                  <PhoneIcon className="input-icon" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="(555) 123-4567"
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="register-password" className="form-label">
                  Password *
                </label>
                <div className="input-wrapper">
                  <LockClosedIcon className="input-icon" />
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword.register ? "text" : "password"}
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('register')}
                    className="password-toggle"
                    disabled={loading}
                  >
                    {showPassword.register ? (
                      <EyeSlashIcon className="toggle-icon" />
                    ) : (
                      <EyeIcon className="toggle-icon" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
                
                {/* Password strength meter */}
                {registerData.password && (
                  <div className="password-strength">
                    <div className="strength-meter">
                      <div 
                        className={`strength-fill ${getStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <div className="strength-text">
                      Password strength: <span className={getStrengthColor()}>
                        {getStrengthText()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <div className="input-wrapper">
                  <KeyIcon className="input-icon" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="password-toggle"
                    disabled={loading}
                  >
                    {showPassword.confirm ? (
                      <EyeSlashIcon className="toggle-icon" />
                    ) : (
                      <EyeIcon className="toggle-icon" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>

              {/* Terms Acceptance */}
              <div className="form-group">
                <div className="terms-acceptance">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={registerData.acceptTerms}
                    onChange={handleRegisterChange}
                    disabled={loading}
                    className="checkbox"
                  />
                  <label htmlFor="acceptTerms" className="checkbox-label">
                    I agree to the{' '}
                    <Link href="/terms" className="terms-link">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="terms-link">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <span className="error-message">{errors.acceptTerms}</span>
                )}
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading || (activeTab === 'login' && cooldown)}
          >
            {loading ? (
              <span className="button-loading">
                <div className="spinner"></div>
                {activeTab === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : activeTab === 'login' && cooldown ? (
              'Please wait...'
            ) : activeTab === 'login' ? (
              'Sign in to your account'
            ) : (
              'Create Account'
            )}
          </button>

          {/* Security Notice for Login */}
          {activeTab === 'login' && loginAttempts > 0 && (
            <div className="security-notice">
              <ExclamationCircleIcon className="notice-icon" />
              <span>
                {loginAttempts} failed attempt{loginAttempts > 1 ? 's' : ''}. 
                {loginAttempts >= 3 && ' Account may be locked after 5 attempts.'}
              </span>
            </div>
          )}
        </form>

        {/* Demo Account Info (only for login) */}
        {activeTab === 'login' && (
          <div className="demo-info">
            <h3 className="demo-title">Demo Accounts</h3>
            <div className="demo-accounts">
              <div className="demo-account">
                <strong>Admin:</strong> admin@greenstreet.org / Admin@1234
              </div>
              <div className="demo-account">
                <strong>Staff:</strong> staff@donorconnect.com / Staff@1234
              </div>
            </div>
            <p className="demo-warning">
              ⚠️ These are demo accounts. Use for testing purposes only.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="login-footer">
          {activeTab === 'login' ? (
            <>
              <p className="footer-text">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="auth-switch-link"
                >
                  Sign up here
                </button>
              </p>
              <div className="footer-divider">
                <span>or</span>
              </div>
              <Link href="/contact" className="support-link">
                Need help? Contact support
              </Link>
            </>
          ) : (
            <>
              <p className="footer-text">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="auth-switch-link"
                >
                  Sign in here
                </button>
              </p>
              <div className="footer-divider">
                <span>or</span>
              </div>
              <Link href="/contact" className="support-link">
                Questions? Contact our team
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Background Pattern */}
      <div className="login-pattern">
        <div className="pattern-dot"></div>
        <div className="pattern-dot"></div>
        <div className="pattern-dot"></div>
        <div className="pattern-dot"></div>
        <div className="pattern-dot"></div>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-icon">D</div>
              <span className="logo-text">DonorConnect</span>
            </div>
            <h1 className="login-title">Welcome</h1>
            <p className="login-subtitle">
              Loading authentication page...
            </p>
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}