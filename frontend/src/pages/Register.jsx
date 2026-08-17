import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Droplet } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from './Register.module.css';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Password strength score (0-3)
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;

    if (score === 0 || pass.length < 4) return { score: 1, label: 'Weak', classKey: 'weak' };
    if (score === 1 || score === 2) return { score: Math.max(1, score), label: score === 1 ? 'Weak' : 'Medium', classKey: score === 1 ? 'weak' : 'medium' };
    return { score: 3, label: 'Strong', classKey: 'strong' };
  };

  const strengthInfo = getPasswordStrength(formData.password);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms & Conditions to register';
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
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Registration failed. Please try again.' });
        setLoading(false);
        return;
      }

      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
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
        setErrors({ general: data.message || 'Google Registration failed.' });
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccessMsg('Google Account linked successfully! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
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
          <h2 className={styles.welcomeHeading}>Start your health journey</h2>
          <p className={styles.welcomeSubtitle}>
            Create your account to unlock clear, educational breakdowns of every blood test report you receive.
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
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>Enter your details below to get started</p>
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
              label="Full name"
              id="register-fullname"
              name="fullName"
              placeholder="Sarah Jenkins"
              icon={User}
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />

            <Input
              label="Email address"
              id="register-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <div>
              <Input
                label="Password"
                id="register-password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />

              {/* Password Strength Indicator Bar */}
              {formData.password && (
                <div className={styles.strengthWrapper}>
                  <div className={styles.strengthHeader}>
                    <span>Password strength</span>
                    <span className={`${styles.strengthLabel} ${styles[`${strengthInfo.classKey}Text`]}`}>
                      {strengthInfo.label}
                    </span>
                  </div>
                  <div className={styles.strengthBars}>
                    <div className={`${styles.barSegment} ${strengthInfo.score >= 1 ? styles[strengthInfo.classKey] : ''}`} />
                    <div className={`${styles.barSegment} ${strengthInfo.score >= 2 ? styles[strengthInfo.classKey] : ''}`} />
                    <div className={`${styles.barSegment} ${strengthInfo.score >= 3 ? styles[strengthInfo.classKey] : ''}`} />
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            <div className={styles.checkboxContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  className={styles.checkbox}
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <span>
                  I agree to the <a href="#terms" className={styles.link} onClick={e => e.preventDefault()}>Terms & Conditions</a> and Privacy Policy.
                </span>
              </label>
              {errors.agreeTerms && (
                <span className={styles.errorText}>{errors.agreeTerms}</span>
              )}
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Create account
            </Button>
          </form>

          <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--color-text-light)' }}>
            <span>or</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log('Google Registration Failed');
                setErrors({ general: 'Google Registration Failed. Please try again.' });
              }}
            />
          </div>

          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
