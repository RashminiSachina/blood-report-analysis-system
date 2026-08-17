import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Droplet, ArrowRight, ArrowLeft } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from './Login.module.css'; // Reusing Login styles for consistency

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to request password reset. Please try again.');
        setLoading(false);
        return;
      }

      setSuccessMsg(`Success! An email containing your OTP has been sent to ${email}`);
      
      // Simulate real auth flow gently redirecting
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 3000);
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
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
          <h2 className={styles.welcomeHeading}>Recover your account</h2>
          <p className={styles.welcomeSubtitle}>
            Lost your password? No worries. We'll send you an OTP to quickly get back into your account.
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
            <h1 className={styles.title}>Forgot password?</h1>
            <p className={styles.subtitle}>Enter the email associated with your account</p>
          </div>

          {successMsg && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: '500',
              marginBottom: '20px',
              border: '1px solid var(--color-success-border)'
            }}>
              {successMsg}
              <br /><br />
              Redirecting you to enter your OTP...
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-error-bg, rgba(248,113,113,0.12))',
              color: 'var(--color-error, #F87171)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8875rem',
              fontWeight: '500',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
              label="Email address"
              id="forgot-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              error={error}
            />

            <Button type="submit" variant="primary" fullWidth loading={loading} icon={ArrowRight}>
              Send Recovery OTP
            </Button>
          </form>

          <p className={styles.footerText} style={{ marginTop: '24px' }}>
            <Link to="/login" className={styles.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
