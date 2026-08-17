import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Droplet } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from './Login.module.css';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccessMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Login failed. Please try again.' });
        setLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccessMsg('Log in successful! Redirecting...');
      setTimeout(() => navigate(from, { replace: true }), 1000);
    } catch (err) {
      setErrors({ general: 'Unable to connect to server. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Google Login failed.' });
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccessMsg('Google Log in successful! Redirecting...');
      setTimeout(() => navigate(from, { replace: true }), 1000);
    } catch (err) {
      setErrors({ general: 'Unable to connect to server. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Brand Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.brandHeader}>
          <Droplet size={26} fill="currentColor" style={{ color: 'var(--color-secondary)' }} />
          <span>VitalRead</span>
        </div>
        <div className={styles.leftContent}>
          <h2 className={styles.welcomeHeading}>Welcome back</h2>
          <p className={styles.welcomeSubtitle}>
            Access your saved blood reports, track historical parameters, and continue your health journey with confidence.
          </p>
        </div>
        <div className={styles.watermark}>
          <Droplet size={400} fill="currentColor" />
        </div>
      </div>

      {/* Right Form Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Log in to your account</h1>
            <p className={styles.subtitle}>Enter your credentials to access your reports</p>
          </div>

          {successMsg && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8875rem',
              fontWeight: '500'
            }}>
              {successMsg}
            </div>
          )}

          {errors.general && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-error-bg, #fef2f2)',
              color: 'var(--color-error, #dc2626)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8875rem',
              fontWeight: '500'
            }}>
              {errors.general}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label="Email address"
              id="login-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Password"
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <div className={styles.rowBetween}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  className={styles.checkbox}
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className={styles.link}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Log in
            </Button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerSpan}>or</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log('Google Login Failed');
                setErrors({ general: 'Google Login Failed. Please try again.' });
              }}
            />
          </div>

          <p className={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
