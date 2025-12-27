// app/login/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import './LoginPage.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(false);

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
  }, [router, redirect]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cooldown) {
      setMessage({
        type: 'error',
        text: 'Too many attempts. Please wait before trying again.'
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include', // ✅ REQUIRED
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          rememberMe: formData.rememberMe
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
        setAttempts(0);
        
        // Redirect after success
        setTimeout(() => {
          router.replace(redirect); // ✅ use replace, not push
        }, 1000);
        
        // Log successful login
        await fetch('/api/audit/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'DONOR_CREATED',
            entityType: 'DONOR',
            entityId: donorId,
            details: { source: 'manual' }
          })
        })
        
      } else {
        // Failed login
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          // Activate cooldown after 5 failed attempts
          setCooldown(true);
          setTimeout(() => {
            setCooldown(false);
            setAttempts(0);
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
          
          // Log failed attempt
          await fetch('/api/audit/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'LOGIN_FAILED',
              details: { 
                email: formData.email,
                attempts: newAttempts 
              },
              userAgent: navigator.userAgent
            })
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

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim() })
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

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo/Brand */}
        <div className="login-header">
          <Link href="/" className="login-logo">
            <div className="logo-icon">D</div>
            <span className="logo-text">DonorConnect</span>
          </Link>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
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

          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-wrapper">
              <EnvelopeIcon className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
              <label htmlFor="password" className="form-label">
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
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading || cooldown}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={loading || cooldown}
              >
                {showPassword ? (
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
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={loading || cooldown}
              className="checkbox"
            />
            <label htmlFor="rememberMe" className="checkbox-label">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading || cooldown}
          >
            {loading ? (
              <span className="button-loading">
                <div className="spinner"></div>
                Signing in...
              </span>
            ) : cooldown ? (
              'Please wait...'
            ) : (
              'Sign in to your account'
            )}
          </button>

          {/* Security Notice */}
          {attempts > 0 && (
            <div className="security-notice">
              <ExclamationCircleIcon className="notice-icon" />
              <span>
                {attempts} failed attempt{attempts > 1 ? 's' : ''}. 
                {attempts >= 3 && ' Account may be locked after 5 attempts.'}
              </span>
            </div>
          )}
        </form>

        {/* Demo Account Info */}
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

        {/* Footer */}
        <div className="login-footer">
          <p className="footer-text">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="footer-link">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="footer-link">
              Privacy Policy
            </Link>
          </p>
          <div className="footer-divider">
            <span>or</span>
          </div>
          <Link href="/contact" className="support-link">
            Need help? Contact support
          </Link>
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