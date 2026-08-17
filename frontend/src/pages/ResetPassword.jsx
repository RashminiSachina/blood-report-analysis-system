import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Key, Droplet, ArrowRight } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from './Login.module.css'; 

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedEmail = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: passedEmail,
    otp: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.general) setErrors(prev => ({ ...prev, general: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.otp.trim()) newErrors.otp = '6-digit OTP is required';
    if (formData.otp.trim().length !== 6) newErrors.otp = 'OTP must be exactly 6 digits';
    
    if (!formData.password) newErrors.password = 'New password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Failed to reset password. Please try again.' });
        setLoading(false);
        return;
      }

      setSuccessMsg('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrors({ general: 'Unable to connect to server. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.brandHeader}>
          <Droplet size={26} fill="currentColor" style={{ color: 'var(--color-secondary)' }} />
          <span>VitalRead</span>
        </div>
        <div className={styles.leftContent}>
          <h2 className={styles.welcomeHeading}>Set your new password</h2>
          <p className={styles.welcomeSubtitle}>
            Nearly there! Enter the OTP you received and choose a strong new password for your account.
          </p>
        </div>
        <div className={styles.watermark}>
          <Droplet size={400} fill="currentColor" />
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>Create a new password securely.</p>
          </div>

          {successMsg && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8875rem',
              fontWeight: '500',
              marginBottom: '20px'
            }}>
              {successMsg}
            </div>
          )}

          {errors.general && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-error-bg, rgba(248,113,113,0.12))',
              color: 'var(--color-error, #F87171)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8875rem',
              fontWeight: '500',
              marginBottom: '20px'
            }}>
              {errors.general}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label="Email address"
              id="reset-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={!!passedEmail}
            />

            <Input
              label="6-Digit OTP"
              id="reset-otp"
              name="otp"
              type="text"
              placeholder="e.g. 482910"
              icon={Key}
              value={formData.otp}
              onChange={handleChange}
              error={errors.otp}
              maxLength={6}
            />

            <Input
              label="New Password"
              id="reset-password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Input
              label="Confirm New Password"
              id="reset-confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            <Button type="submit" variant="primary" fullWidth loading={loading} icon={ArrowRight}>
              Reset Password
            </Button>
          </form>

          <p className={styles.footerText} style={{ marginTop: '24px' }}>
            Remembered your password?{' '}
            <Link to="/login" className={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
