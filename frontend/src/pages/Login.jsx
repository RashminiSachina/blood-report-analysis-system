import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Droplet } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from './Login.module.css';

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
              <a href="#forgot" className={styles.link} onClick={(e) => { e.preventDefault(); alert('Password reset link sent to console'); }}>
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Log in
            </Button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerSpan}>or</span>
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => console.log('Google Auth clicked (UI simulation)')}
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            Continue with Google
          </Button>

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
